# Mkeka Pro

## Current State
Full sportsbook app with admin panel, Tips feature, and Internet Identity auth. The `claimAdmin` backend function uses iterator chaining (`.filter().map().toArray()`) that traps at runtime, causing the "Fail to claim admin" error.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- Fix `claimAdmin` to use a simple for-loop that collects admin principals into an array before modifying the map (avoids mutation-during-iteration trap)

### Remove
- Nothing

## Implementation Plan
1. Rewrite `claimAdmin` in `main.mo` to use a for-loop with `Array.append` to safely collect then demote existing admins before assigning caller as admin
