
**NAME**

AddLibrary -- add a library to the system

**SYNOPSIS**

```c
    AddLibrary(library)
               A1

    void AddLibrary(struct Library *);

```
Links: [Library](_OOYC) 

**FUNCTION**

This function adds a new library to the system, making it available
to other programs.  The library should be ready to be opened at
this time.  It will be added to the system library name list, and
the checksum on the library entries will be calculated.

**INPUTS**

library - pointer to a properly initialized library structure

**SEE ALSO**

[RemLibrary](RemLibrary), [CloseLibrary](CloseLibrary), [OpenLibrary](OpenLibrary), [MakeLibrary](MakeLibrary)
