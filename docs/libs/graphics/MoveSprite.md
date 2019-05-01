
**NAME**

MoveSprite -- Move sprite to a point relative to top of viewport.

**SYNOPSIS**

```c
    MoveSprite(vp, sprite, x, y)
               A0  A1      D0 D1

    void MoveSprite(struct ViewPort *,struct SimpleSprite *, WORD, WORD);

```
Links: [ViewPort](_OOBX) [SimpleSprite](_OOCU) 

**FUNCTION**

Move sprite image to new place on display.

**INPUTS**

vp - pointer to [ViewPort](_OOBX) structure
if vp = 0, sprite is positioned relative to [View](_OOBX).
sprite - pointer to [SimpleSprite](_OOCU) structure
(x,y)  - new position relative to top of viewport or view.

**RESULTS**

Calculate the hardware information for the sprite and
place it in the posctldata array. During next video display
the sprite will appear in new position.

BUGS
Sprites really appear one pixel to the left of the position you
specify.  This bug affects the apparent display position of the sprite
on the screen, but does not affect the numeric position relative to
the viewport or view.

**SEE ALSO**

[FreeSprite](FreeSprite)  [ChangeSprite](ChangeSprite)  [GetSprite](GetSprite)  [graphics/sprite.h](_OOCU)
