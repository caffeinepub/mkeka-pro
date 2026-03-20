# Mkeka Pro

## Current State
Full sportsbook with events (Soccer, Basketball, Tennis, NFL, Esports), bet placement, admin panel for creating/resolving events, leaderboard, and role-based access control.

## Requested Changes (Diff)

### Add
- `Tip` data type: id, sport, match description, prediction, reasoning, odds, status (Upcoming/Won/Lost), createdAt, createdBy
- `createTip` -- admin only, creates a new tip
- `getTips` -- public query, optionally filter by sport or status
- `updateTipStatus` -- admin only, mark tip as Won or Lost
- Tips feed page accessible from main nav
- Admin panel section to create tips and update their status

### Modify
- Header nav to include a "Tips" link
- AdminPage to include a Tips management section
- App.tsx to include a /tips route

### Remove
- Nothing removed

## Implementation Plan
1. Add Tip type, state, and CRUD functions to backend main.mo
2. Add TipsPage to frontend showing tips feed with sport/status filters
3. Add Tips section to AdminPage for creating tips and marking them won/lost
4. Add Tips nav link in Header and /tips route in App.tsx
