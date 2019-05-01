
**NAME**

FreeDosEntry -- Frees an entry created by [MakeDosEntry](MakeDosEntry) (V36)

**SYNOPSIS**

```c
    FreeDosEntry(dlist)
                   D1

    void FreeDosEntry(struct DosList *)

```
Links: [DosList](_OOWX) 

**FUNCTION**

Frees an entry created by [MakeDosEntry](MakeDosEntry).  This routine should be
eliminated and replaced by a value passed to FreeDosObject()!

**INPUTS**

dlist - [DosList](_OOWX) to free.

**SEE ALSO**

[AddDosEntry](AddDosEntry), [RemDosEntry](RemDosEntry), [FindDosEntry](FindDosEntry), [LockDosList](LockDosList),
[NextDosEntry](NextDosEntry), [MakeDosEntry](MakeDosEntry)
