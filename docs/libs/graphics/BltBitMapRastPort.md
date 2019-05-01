
**NAME**

BltBitMapRastPort -- Blit from source bitmap to destination rastport.

**SYNOPSIS**

```c
    error = BltBitMapRastPort
         (srcbm, srcx, srcy, destrp, destX, destY, sizeX, sizeY, minterm)
         D0     A0     D0    D1    A1      D2     D3     D4     D5     D6

    BOOL BltBitMapRastPort
         (struct BitMap *, WORD, WORD, struct RastPort *, WORD, WORD,
          WORD, WORD, UBYTE);

```
Links: [BitMap](_OOAV) [RastPort](_OOAF) 

**FUNCTION**

Blits from source bitmap to position specified in destination rastport
using minterm.

**INPUTS**

srcbm   - a pointer to the source bitmap
srcx    - x offset into source bitmap
srcy    - y offset into source bitmap
destrp  - a pointer to the destination rastport
destX   - x offset into dest rastport
destY   - y offset into dest rastport
sizeX   - width of blit in pixels
sizeY   - height of blit in rows
minterm - minterm to use for this blit

RESULT
TRUE

BUGS

**SEE ALSO**

[BltMaskBitMapRastPort](BltMaskBitMapRastPort) [graphics/gfx.h](_OOAV) [graphics/rastport.h](_OOAF)
