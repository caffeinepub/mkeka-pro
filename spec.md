# Mkeka Pro

## Current State
Admin role management uses AccessControl module state. The claimAdmin function mutates the module's internal map but may not work reliably.

## Requested Changes (Diff)

### Add
- Standalone `var adminPrincipal : ?Principal` to track admin directly

### Modify
- claimAdmin simply sets adminPrincipal := ?caller
- isCallerAdminSafe checks adminPrincipal == ?caller
- All admin checks use the new direct variable

### Remove
- Complex iterator logic in claimAdmin

## Implementation Plan
1. Add adminPrincipal var
2. Rewrite claimAdmin and isCallerAdminSafe
3. Update all admin gate checks
