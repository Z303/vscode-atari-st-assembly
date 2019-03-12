import { DebugProtocol } from "vscode-debugprotocol";
import { DebugDisassembledFile, DebugDisassembledMananger } from "./debugDisassembled";
import { DebugInfo } from "./debugInfo";
import { GdbProxy } from "./gdbProxy";

/**
 * Class to contact the fs-UAE GDB server.
 */
export class BreakpointManager {
    // Default selection mask for exception : each bit is a exception code
    static readonly DEFAULT_EXCEPTION_MASK = 0b1111111000000010000011110000000000000000011111111111100;
    /** Proxy to Gdb */
    private gdbProxy: GdbProxy;
    /** Breakpoints selected */
    private breakpoints = new Array<GdbBreakpoint>();
    /** Pending breakpoint no yet sent to debuger */
    private pendingBreakpoints = new Array<GdbBreakpoint>();
    /** Debug information for the loaded program */
    private debugInfo?: DebugInfo;
    /** Manager of disassembled code */
    private debugDisassembledMananger: DebugDisassembledMananger;
    /** Next breakpoint id */
    private nextBreakpointId = 0;

    public constructor(gdbProxy: GdbProxy, debugDisassembledMananger: DebugDisassembledMananger) {
        this.gdbProxy = gdbProxy;
        this.debugDisassembledMananger = debugDisassembledMananger;
        this.gdbProxy.setSendPendingBreakpointsCallback(this.sendAllPendingBreakpoint);
    }

    public setDebugInfo(debugInfo: DebugInfo) {
        this.debugInfo = debugInfo;
    }

    private addPendingBreakpoint(breakpoint: GdbBreakpoint, err?: Error) {
        breakpoint.verified = false;
        if (err) {
            breakpoint.message = err.message;
        }
        this.pendingBreakpoints.push(breakpoint);
    }
    public setBreakpoint(debugBp: GdbBreakpoint): Promise<GdbBreakpoint> {
        return new Promise(async (resolve, reject) => {
            if (debugBp.source && debugBp.line && (debugBp.id !== undefined)) {
                debugBp.verified = false;
                const path = <string>debugBp.source.path;

                if (!DebugDisassembledFile.isDebugAsmFile(path)) {
                    if (this.debugInfo) {
                        let values = this.debugInfo.getAddressSeg(path, debugBp.line);
                        if (values) {
                            debugBp.segmentId = values[0];
                            debugBp.offset = values[1];
                            await this.gdbProxy.setBreakpoint(debugBp).then(() => {
                                resolve(debugBp);
                            }).catch((err) => {
                                this.addPendingBreakpoint(debugBp, err);
                                reject(err);
                            });
                        } else {
                            let err = new Error("Segment offset not resolved");
                            this.addPendingBreakpoint(debugBp, err);
                            reject(err);
                        }
                    } else {
                        let err = new Error("Debug information not resolved retrieved");
                        this.addPendingBreakpoint(debugBp, err);
                        reject(err);
                    }
                } else {
                    const name = <string>debugBp.source.name;
                    await this.debugDisassembledMananger.getAddressForFileEditorLine(name, debugBp.line).then(async address => {
                        debugBp.segmentId = undefined;
                        debugBp.offset = address;
                        await this.gdbProxy.setBreakpoint(debugBp).then(() => {
                            resolve(debugBp);
                        }).catch((err) => {
                            this.addPendingBreakpoint(debugBp, err);
                            reject(err);
                        });
                    }).catch((err) => {
                        this.addPendingBreakpoint(debugBp, err);
                        reject(err);
                    });
                }
            } else {
                let err = new Error("Breakpoint info incomplete");
                this.addPendingBreakpoint(debugBp, err);
                reject(err);
            }
        });
    }

    public createBreakpoint(source: DebugProtocol.Source, line: number): GdbBreakpoint {
        return <GdbBreakpoint>{
            id: this.nextBreakpointId++,
            line: line,
            source: source,
            verified: false
        };
    }

    public createExceptionBreakpoint(): GdbBreakpoint {
        return <GdbBreakpoint>{
            id: this.nextBreakpointId++,
            exceptionMask: BreakpointManager.DEFAULT_EXCEPTION_MASK,
            verified: false
        };
    }

    public sendAllPendingBreakpoint = (): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            if ((this.pendingBreakpoints) && this.pendingBreakpoints.length > 0) {
                let pending = this.pendingBreakpoints;
                this.pendingBreakpoints = new Array<GdbBreakpoint>();
                for (let bp of pending) {
                    await this.setBreakpoint(bp).catch(err => {
                        this.pendingBreakpoints.push(bp);
                    });
                }
            }
            resolve();
        });
    }

    /**
     * Ask for an exception breakpoint
     */
    public setExceptionBreakpoint(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            let breakpoint = this.createExceptionBreakpoint();
            await this.gdbProxy.setBreakpoint(breakpoint).then(() => {
                resolve();
            }).catch((err) => {
                reject(err);
            });
        });
    }

    /**
     * Ask to remove an exception breakpoint
     */
    public removeExceptionBreakpoint(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            let breakpoint = this.createExceptionBreakpoint();
            await this.gdbProxy.removeBreakpoint(breakpoint).then(() => {
                resolve();
            }).catch((err) => {
                reject(err);
            });
        });
    }

    public clearBreakpoints(source: DebugProtocol.Source): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const path = <string>source.path;
            if (this.debugInfo && !DebugDisassembledFile.isDebugAsmFile(path)) {
                let hasError = false;
                let values = this.debugInfo.getAllSegmentIds(path);
                for (let segmentId of values) {
                    let remainingBreakpoints = new Array<GdbBreakpoint>();
                    for (let bp of this.breakpoints) {
                        if (bp.segmentId === segmentId) {
                            await this.gdbProxy.removeBreakpoint(bp).catch(err => {
                                remainingBreakpoints.push(bp);
                                hasError = true;
                            });
                        } else {
                            remainingBreakpoints.push(bp);
                        }
                    }
                    this.breakpoints = remainingBreakpoints;
                }
                if (hasError) {
                    reject(new Error("Some breakpoints cannot be removed"));
                } else {
                    resolve();
                }
            }
        });
    }
}

/** Interface for a breakpoint */
export interface GdbBreakpoint extends DebugProtocol.Breakpoint {
    /** Id for the segment if undefined it is an absolute offset*/
    segmentId?: number;
    /** Offset relative to the segment*/
    offset: number;
    /** exception mask : if present it is an exception breakpoint */
    exceptionMask?: number;
}
