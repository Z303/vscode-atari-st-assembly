
**NAME**

OrRegionRegion -- Perform 2d OR operation of one region
with second region, leaving result in second region

**SYNOPSIS**

```c
    status = OrRegionRegion(region1,region2)
      d0                       a0      a1

    BOOL OrRegionRegion( struct Region *, struct Region * );

```
Links: [Region](_OOBW) [Region](_OOBW) 

**FUNCTION**

If any portion of region1  is not in the region then add
that portion to the region2

**INPUTS**

region1 - pointer to [Region](_OOBW) structure
region2 - pointer to [Region](_OOBW) structure

**RESULTS**

status - return TRUE if successful operation
return FALSE if ran out of memory

BUGS

**SEE ALSO**

[OrRectRegion](OrRectRegion) [graphics/regions.h](_OOBW)
