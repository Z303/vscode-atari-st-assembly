
**NAME**

ClearScreen -- Clear from current position to end of [RastPort](_OOAF).

**SYNOPSIS**

```c
    ClearScreen(rp)
                A1

    void ClearScreen(struct RastPort *);

```
Links: [RastPort](_OOAF) 

**FUNCTION**

Clear a rectangular swath from the current position to the
right edge of the rastPort with [ClearEOL](ClearEOL), then clear the rest
of the screen from just beneath the swath to the bottom of
the rastPort.
Clearing consists of setting the color of the swath to zero,
or, if the DrawMode is 2, to the BgPen.

**INPUTS**

rp - pointer to [RastPort](_OOAF) structure

NOTES
o   This function may use the blitter.

**SEE ALSO**

[ClearEOL](ClearEOL)  [Text](Text)  [SetRast](SetRast)
[graphics/text.h](_OOAX)  [graphics/rastport.h](_OOAF)
