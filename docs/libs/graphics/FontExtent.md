
**NAME**

FontExtent -- get the font attributes of the current font (V36)

**SYNOPSIS**

```c
    FontExtent(font, fontExtent)
               A0    A1

    void FontExtent(struct TextFont *, struct TextExtent *);

```
Links: [TextFont](_OOAX) [TextExtent](_OOAX) 

**FUNCTION**

This function fills the text extent structure with a bounding
(i.e. maximum) extent for the characters in the specified font.

**INPUTS**

font       - the [TextFont](_OOAX) from which the font metrics are extracted.
fontExtent - the [TextExtent](_OOAX) structure to be filled.

RESULT
fontExtent is filled.

NOTES
The [TextFont](_OOAX), not the [RastPort](_OOAF), is specified -- unlike
[TextExtent](TextExtent), effect of algorithmic enhancements is not
included, nor does te_Width include any effect of
rp_TxSpacing.  The returned te_Width will be negative only
when FPF_REVPATH is set in the tf_Flags of the font -- the
effect of left-moving characters is ignored for the width of
a normal font, and the effect of right-moving characters is
ignored if a REVPATH font.  These characters will, however,
be reflected in the bounding extent.

**SEE ALSO**

[TextExtent](TextExtent)  [graphics/text.h](_OOAX)
