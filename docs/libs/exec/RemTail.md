
**NAME**

RemTail -- remove the tail node from a list

**SYNOPSIS**

```
    node = RemTail(list)
    D0             A0

```
struct [Node](Node) *RemTail(struct [List](List) *);

**FUNCTION**

Remove the last node from a list, and return a pointer to it. If
the list is empty, return zero. Assembly programmers may prefer to
use the REMTAIL macro from &#034;exec/lists.i&#034;.

**WARNING**

This function does not arbitrate for access to the list.  The
calling task must be the owner of the involved list.

**INPUTS**

list - a pointer to the target list header

RESULT
node - the node removed or zero when empty list

**SEE ALSO**

[AddHead](AddHead), [AddTail](AddTail), [Enqueue](Enqueue), Insert, Remove, [RemHead](RemHead), RemTail
