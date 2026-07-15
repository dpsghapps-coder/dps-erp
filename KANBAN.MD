# ProKanban Cloud — Kanban Layout

## View Tabs

Two tabs switch the Kanban board view:

| Tab               | Shows                                    |
|-------------------|------------------------------------------|
| Active Workflow   | 6 columns: NEW JOBS → DESIGN → PRINTING → ASSEMBLY → QC & INSPECTION → COMPLETED |
| Paused / Cancelled| 2 columns: PAUSED and CANCELLED only     |

Each tab shows a count badge of jobs in that view.

## Workflow States

| Key            | Display          | Color   |
|----------------|------------------|---------|
| `new_jobs`     | NEW JOBS         | Blue    |
| `design`       | DESIGN           | Indigo  |
| `printing`     | PRINTING         | Amber   |
| `assembly`     | ASSEMBLY         | Orange  |
| `qc_inspection`| QC & INSPECTION  | Purple  |
| `completed`    | COMPLETED        | Emerald |
| `paused`       | PAUSED           | Yellow  |
| `cancelled`    | CANCELLED        | Red     |

Status flow: NEW JOBS → DESIGN → PRINTING → ASSEMBLY → QC & INSPECTION → COMPLETED
PAUSED and CANCELLED are terminal states (no auto-transition forward or back).

## Metrics Bar

| Metric          | Definition                              |
|-----------------|-----------------------------------------|
| Total           | All jobs                                |
| On Shop Floor   | printing + assembly                     |
| Queued          | new_jobs + design                       |
| Completed       | completed                               |
| Urgent          | priority=urgent AND status ≠ completed/cancelled |

## Filter Bar

- **Search**: filters by id, orderNumber, customerName, productDetails, operator
- **Priority filter**: All / Urgent / High / Normal
- **New Job Document**: opens creation form

## Drag and Drop

- **PointerSensor**: 8px activation distance (prevents accidental drags)
- **KeyboardSensor**: keyboard accessibility
- **DragOverlay**: shows card preview while dragging
- Drops are constrained to valid columns for the active view

## Cards

Each Kanban card shows:
- Priority badge (color-coded: urgent=red, high=orange, else blue)
- Job ID
- Product details (with amber hover)
- Customer name
- Quantity + due date (overdue dates highlighted red)
- Assigned operator
- Delete button + Move forward/backward buttons

## Modals

- **Job Detail Modal**: full job info with status, id, quantity, due date, operator, order number, notes, and audit history timeline
- **New Job Modal**: form with order number, customer, product details, quantity, priority, starting column (NEW JOBS or DESIGN), operator, notes, due date

## Theme

Light and dark mode toggled via sun/moon icon in header. Uses `data-theme="dark|light"` attribute on `<html>`, persisted in localStorage under key `theme`.
