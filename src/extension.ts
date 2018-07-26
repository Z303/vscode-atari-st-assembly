// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { M68kFormatter } from './formatter';
import { M68kHoverProvider } from './hover';
import { M86kColorProvider } from './color';
import { Calc, CalcController } from './calc';
import { VASMCompiler, VASMController } from './vasm';
import { StatusManager } from "./status";
import { FsUAEDebugSession } from './fsUAEDebug';
import * as Net from 'net';
import { RunFsUAENoDebugSession } from './runFsUAENoDebug';

// Setting all the globals values
export const AMIGA_ASM_MODE: vscode.DocumentFilter = { language: 'm68k', scheme: 'file' };
export let errorDiagnosticCollection: vscode.DiagnosticCollection;
export let warningDiagnosticCollection: vscode.DiagnosticCollection;
export let statusManager: StatusManager;
export let calc: Calc;
export let compiler: VASMCompiler;

/*
 * Set the following compile time flag to true if the
 * debug adapter should run inside the extension host.
 * Please note: the test suite does no longer work in this mode.
 */
const EMBED_DEBUG_ADAPTER = true;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Preparing the status manager
    statusManager = new StatusManager();
    statusManager.showStatus("Build", 'amiga-assembly.build-vasm-workspace', "Build Workspace");
    vscode.window.onDidChangeActiveTextEditor(statusManager.showHideStatus, null, context.subscriptions);
    context.subscriptions.push(statusManager);

    statusManager.outputChannel.appendLine("Starting Amiga Assembly");
    let formatter = new M68kFormatter();
    // Declaring the formatter
    let disposable = vscode.languages.registerDocumentFormattingEditProvider(AMIGA_ASM_MODE, formatter);
    context.subscriptions.push(disposable);

    // Formatter for a range in document
    disposable = vscode.languages.registerDocumentRangeFormattingEditProvider(AMIGA_ASM_MODE, formatter);
    context.subscriptions.push(disposable);

    // Format on type
    disposable = vscode.languages.registerOnTypeFormattingEditProvider(AMIGA_ASM_MODE, formatter, ' ', ';');
    context.subscriptions.push(disposable);

    // Declaring the Hover
    disposable = vscode.languages.registerHoverProvider(AMIGA_ASM_MODE, new M68kHoverProvider());
    context.subscriptions.push(disposable);

    // create a new calculator
    calc = new Calc();
    let controller = new CalcController(calc);

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(controller);
    context.subscriptions.push(calc);

    // Commands for the calculator
    disposable = vscode.commands.registerCommand('amiga-assembly.calculator', () => {
        return calc.showInputPanel();
    });
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('amiga-assembly.evaluate-selection', () => {
        return calc.evaluateSelections();
    });
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('amiga-assembly.evaluate-selection-replace', () => {
        return calc.replaceSelections();
    });
    context.subscriptions.push(disposable);

    // Color provider
    context.subscriptions.push(vscode.languages.registerColorProvider(AMIGA_ASM_MODE, new M86kColorProvider()));

    // Diagnostics 
    errorDiagnosticCollection = vscode.languages.createDiagnosticCollection('m68k-error');
    context.subscriptions.push(errorDiagnosticCollection);
    warningDiagnosticCollection = vscode.languages.createDiagnosticCollection('m68k-warning');
    context.subscriptions.push(warningDiagnosticCollection);

    // VASM Command
    compiler = new VASMCompiler();
    // Build a file
    disposable = vscode.commands.registerCommand('amiga-assembly.build-vasm', () => {
        statusManager.onDefault();
        return compiler.buildCurrentEditorFile().catch(error => {
            statusManager.onError(error);
        });
    });
    context.subscriptions.push(disposable);
    // Build on save
    let vController = new VASMController(compiler);
    context.subscriptions.push(vController);
    // Build the workspace
    disposable = vscode.commands.registerCommand('amiga-assembly.build-vasm-workspace', () => {

        statusManager.onDefault();
        return compiler.buildWorkspace().then(() => {
            statusManager.onSuccess();
        }).catch(error => {
            statusManager.onError(error);
        });
    });
    // Clean the workspace
    disposable = vscode.commands.registerCommand('amiga-assembly.clean-vasm-workspace', () => {
        return compiler.cleanWorkspace().then(() => {
            statusManager.onDefault();
        }).catch(error => {
            statusManager.onError(error);
        });
    });
    context.subscriptions.push(disposable);

    // Debug configuration
    context.subscriptions.push(vscode.commands.registerCommand('amiga-assembly.getProgramName', config => {
        return vscode.window.showInputBox({
            placeHolder: "Please enter the name of a program file in the workspace folder",
            value: "myprogram"
        });
    }));

    // register a configuration provider for 'fs-uae' debug type
    const provider = new FsUAEConfigurationProvider();
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('fs-uae', provider));
    context.subscriptions.push(provider);
    const runProvider = new RunFsUAEConfigurationProvider();
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('fs-uae-run', runProvider));
    context.subscriptions.push(runProvider);
    statusManager.outputChannel.appendLine("------> done");
}

export function deactivate() {
    // nothing to do
}

class FsUAEConfigurationProvider implements vscode.DebugConfigurationProvider {

    private server?: Net.Server;

	/**
	 * Massage a debug configuration just before a debug session is being launched,
	 * e.g. add all missing attributes to the debug configuration.
	 */
    resolveDebugConfiguration(folder: vscode.WorkspaceFolder | undefined, config: vscode.DebugConfiguration, token?: vscode.CancellationToken): vscode.ProviderResult<vscode.DebugConfiguration> {

        // if launch.json is missing or empty
        if (!config.type && !config.request && !config.name) {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document.languageId === 'm68k') {
                config.type = 'fs-uae';
                config.name = 'Launch';
                config.request = 'launch';
                config.program = '${file}';
                config.stopOnEntry = true;
                config.startEmulator = true;
                config.emulator = "fs-uae";
                config.program = "${workspaceFolder}/${command:AskForProgramName}";
                config.conf = "configuration/dev.fs-uae";
                config.buildWorkspace = true;
                config.serverName = "localhost";
                config.serverPort = 6860;
            }
        }

        if (!config.program) {
            return vscode.window.showInformationMessage("Cannot find a program to debug").then(_ => {
                return undefined;	// abort launch
            });
        }

        const self = this;
        if (config.buildWorkspace) {
            return vscode.commands.executeCommand("amiga-assembly.build-vasm-workspace").then(() => {
                return self.setSession(folder, config, token);
            });
        } else {
            return this.setSession(folder, config, token);
        }
    }

    /**
     * Sets the session config
     */
    private setSession(folder: vscode.WorkspaceFolder | undefined, config: vscode.DebugConfiguration, token?: vscode.CancellationToken): vscode.ProviderResult<vscode.DebugConfiguration> {
        if (EMBED_DEBUG_ADAPTER) {
            // start port listener on launch of first debug session
            if (!this.server) {
                // start listening on a random port
                this.server = Net.createServer(socket => {
                    const session = new FsUAEDebugSession();
                    session.setRunAsServer(true);
                    session.start(<NodeJS.ReadableStream>socket, socket);
                }).listen(0);
            }
            // make VS Code connect to debug server instead of launching debug adapter
            config.debugServer = this.server.address().port;
        }
        return config;
    }

    dispose() {
        if (this.server) {
            this.server.close();
        }
    }
}

class RunFsUAEConfigurationProvider implements vscode.DebugConfigurationProvider {
    private server?: Net.Server;
	/**
	 * Massage a debug configuration just before a debug session is being launched,
	 * e.g. add all missing attributes to the debug configuration.
	 */
    resolveDebugConfiguration(folder: vscode.WorkspaceFolder | undefined, config: vscode.DebugConfiguration, token?: vscode.CancellationToken): vscode.ProviderResult<vscode.DebugConfiguration> {

        // if launch.json is missing or empty
        if (!config.type && !config.request && !config.name) {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document.languageId === 'm68k') {
                config.type = 'fs-uae-run';
                config.name = 'Launch';
                config.request = 'launch';
                config.emulator = "fs-uae";
                config.conf = "configuration/dev.fs-uae";
                config.buildWorkspace = true;
            }
        }
        const self = this;
        if (config.buildWorkspace) {
            return vscode.commands.executeCommand("amiga-assembly.build-vasm-workspace").then(() => {
                return self.setSession(folder, config, token);
            });
        } else {
            return this.setSession(folder, config, token);
        }
    }

    /**
     * Sets the session config
     */
    private setSession(folder: vscode.WorkspaceFolder | undefined, config: vscode.DebugConfiguration, token?: vscode.CancellationToken): vscode.ProviderResult<vscode.DebugConfiguration> {
        if (EMBED_DEBUG_ADAPTER) {
            // start port listener on launch of first debug session
            if (!this.server) {
                // start listening on a random port
                this.server = Net.createServer(socket => {
                    const session = new RunFsUAENoDebugSession();
                    session.setRunAsServer(true);
                    session.start(<NodeJS.ReadableStream>socket, socket);
                }).listen(0);
            }
            // make VS Code connect to debug server instead of launching debug adapter
            config.debugServer = this.server.address().port;
        }
        return config;
    }

    dispose() {
        if (this.server) {
            this.server.close();
        }
    }
}
