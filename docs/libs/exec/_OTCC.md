
**NAME**

CloseDevice -- close the serial port

**SYNOPSIS**

```c
    CloseDevice(deviceNode)
                 A1
```
**FUNCTION**

This is an exec call that terminates communication with the
serial device.  Upon closing, the device's input buffer is freed.

Note that all IORequests MUST be complete before closing.
If any are pending, your program must [AbortIO](_OTCA) then [WaitIO](WaitIO)
to complete them.

**INPUTS**

deviceNode - pointer to the device node, set by Open

**SEE ALSO**

[serial.device/OpenDevice](_OTDT)
