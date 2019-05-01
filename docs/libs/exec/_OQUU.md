
**NAME**

DeleteTask -- delete a task created with [CreateTask](_OQTA)

**SYNOPSIS**

```c
    DeleteTask(task)

    VOID DeleteTask(struct Task *);

```
Links: [Task](_OOXE) 

**FUNCTION**

This function simply calls [exec_library/RemTask](RemTask), deleting a task
from the Exec task lists and automatically freeing any stack and
structure memory allocated for it by [CreateTask](_OQTA).

Before deleting a task, you must first make sure that the task is
not currently executing any system code which might try to signal
the task after it is gone.

This can be accomplished by stopping all sources that might reference
the doomed task, then causing the subtask to execute a Wait(0L).
Another option is to have the task call <a href="../Includes_and_Autodocs_2._guide/node0378.html">DeleteTask()/RemTask() on
itself.

**INPUTS**

task - task to remove from the system

NOTE
This function simply calls [exec_library/RemTask](RemTask), so you can call
[RemTask](RemTask) directly instead of calling this function.

**SEE ALSO**

[CreateTask](_OQTA), [exec_library/RemTask](RemTask)
