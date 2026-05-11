# VRSpace Internal Management System — Implementation Plan

## Context
VR Space (vrspace.co.ke) is a VR gaming venue in Nairobi, Kenya that has partnered with another company on a 50/50 revenue split. The business needs an internal system to:
1. Track employee attendance (clock in/out) and calculate overtime
2. Log VR sessions per machine, auto-calculate daily revenue
3. Compare internal sales against the partner's reported totals and flag discrepancies

This will be added as protected `/admin` routes in the existing **Vue 3 + Vite + Tailwind CSS** frontend, with **Supabase** as the backend (site stays on Netlify).

**Design philosophy: Mobile-first, desktop-capable.** The primary device is a phone at the venue, but the admin dashboard should also work well on larger screens (tablet/desktop). Use Tailwind breakpoints (`sm`, `md`, `lg`) to adapt layouts:
- **Phone** (<640px): Bottom tab bar, card-based lists, large tap targets, minimal typing
- **Tablet/Desktop** (>=768px): Sidebar navigation, data tables, multi-column layouts, inline actions

---

## Tech Stack
- **Frontend**: Existing Vue 3 + Vite + Tailwind CSS app
- **Backend**: Supabase (Postgres DB, Auth, Storage, Edge Functions)
- **Hosting**: Netlify (frontend), Supabase (backend)
- **New dependencies**: `@supabase/supabase-js`, `vue-sonner`

---

## Machines
Managed via admin CRUD. Pre-populated with:

| Machine | Price per Session | Status |
|---|---|---|
| Playstation 5 | 500 KES | Active |
| Nintendo | 500 KES | Active |
| GT Racing | 500 KES | Active |
| EggVR | 500 KES | Active |
| HTC Vive | 500 KES | Active |
| Meta Quest | 500 KES | Active |

All machines charge a flat **500 KES per session** regardless of duration. Multiple sessions can run on the same machine simultaneously. Admins can add, edit, deactivate, or delete machines.

---

## Phase 1: Foundation (Supabase + Auth)

> Supabase project is already created. `.env` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### 1.1 Database Schema

**`profiles`** (extends auth.users)
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | References auth.users(id) |
| full_name | TEXT | |
| email | TEXT | |
| role | TEXT | 'admin' or 'employee' |
| is_active | BOOLEAN | Default true |
| created_at | TIMESTAMPTZ | |

**`attendance`**
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| employee_id | UUID FK | References profiles(id) |
| clock_in | TIMESTAMPTZ | |
| clock_out | TIMESTAMPTZ | NULL while clocked in |
| date | DATE | |
| total_hours | NUMERIC(5,2) | Computed by trigger on clock_out |
| overtime_hours | NUMERIC(5,2) | GREATEST(total_hours - 8, 0) |
| UNIQUE | | (employee_id, date) |

**`machines`**
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | TEXT UNIQUE | Display name (e.g., 'Playstation 5') |
| slug | TEXT UNIQUE | URL-safe key (e.g., 'playstation_5') |
| price_per_session | NUMERIC(10,2) | Default 500.00 |
| is_active | BOOLEAN | Default true |
| created_at | TIMESTAMPTZ | |

**`sessions`** (individual VR sessions)
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| employee_id | UUID FK | Who logged it |
| machine_id | UUID FK | References machines(id) |
| session_count | INTEGER | Number of sessions (default 1) |
| price_per_session | NUMERIC(10,2) | Copied from machines.price_per_session at insert time |
| total_amount | NUMERIC(10,2) | Generated: session_count * price_per_session |
| date | DATE | Default CURRENT_DATE |
| created_at | TIMESTAMPTZ | |

**`daily_sales`** (daily reconciliation — one row per day)
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| date | DATE UNIQUE | One record per day |
| total_sessions | INTEGER | Auto-computed: SUM of sessions.session_count for this date |
| total_revenue | NUMERIC(10,2) | Auto-computed: SUM of sessions.total_amount for this date |
| our_share | NUMERIC(10,2) | total_revenue * 0.50 |
| partner_share | NUMERIC(10,2) | total_revenue * 0.50 |
| partner_reported_revenue | NUMERIC(10,2) | Entered by employee/admin (next day) |
| discrepancy | NUMERIC(10,2) | total_revenue - partner_reported_revenue |
| logged_by | UUID FK | Who entered the partner report |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |

### 1.2 Postgres Helpers
- **`get_user_role()`** function — used by all RLS policies
- **`calculate_attendance_hours()`** trigger — fires on attendance UPDATE when clock_out is set
- **`compute_daily_sales(p_date DATE)`** function — sums sessions for a given date, upserts into daily_sales, computes discrepancy
- **`handle_new_user()`** trigger — auto-creates profile row on auth.users INSERT

### 1.3 RLS Policies
- Employees: read/write **own** rows only (sessions, attendance)
- Admins: read/write **all** rows
- Profiles: only admins can create/update/delete
- daily_sales: employees can only read **today's** record (resets to 0 each new day); admins can read all and update partner_reported_revenue

### 1.4 New Files
- **`src/lib/supabase.js`** — Supabase client singleton
- **`src/composables/useAuth.js`** — reactive `user`, `profile`, `isAdmin`, `isAuthenticated` + signIn/signOut

### 1.5 Modify
- **`package.json`** — add `@supabase/supabase-js`, `vue-sonner`
- Remove `@inertiajs/vue3` (unused)

---

## Phase 2: Admin Shell + Routing

### 2.1 New Files
- **`src/views/admin/AdminLayout.vue`** — mobile-first shell: bottom tab bar (phone), sidebar (tablet/desktop) + `<router-view>`
- **`src/views/admin/Login.vue`** — email/password login form

### 2.2 Modify
- **`src/router/index.js`** — add:
  - `/admin` route — redirects to `/admin/clock` (employee) or `/admin/dashboard` (admin) based on role after login
  - `/admin/login` route (no auth required)
  - `/admin` parent route with `AdminLayout` + child routes (all lazy-loaded)
  - `beforeEach` navigation guard checking auth + role
  - All existing public routes remain untouched
  - Admin routes **bypass** the public Layout.vue (no Navbar/Footer)

### 2.3 Netlify SPA Redirect
Add `public/_redirects`:
```
/*    /index.html   200
```

### Routes Overview
| Path | Component | Access | Mobile Nav |
|---|---|---|---|
| `/admin/login` | Login.vue | Public | — |
| `/admin/dashboard` | Dashboard.vue | Admin only | Dashboard tab |
| `/admin/clock` | ClockInOut.vue | All authenticated | Clock tab |
| `/admin/sessions` | SessionLogger.vue | All authenticated | Sessions tab |
| `/admin/sessions/history` | SessionHistory.vue | All authenticated | — |
| `/admin/attendance` | AttendanceLog.vue | Admin only | — |
| `/admin/attendance/hours` | EmployeeHours.vue | Admin only | — |
| `/admin/sales` | DailySalesForm.vue | All authenticated | Sales tab |
| `/admin/sales/reports` | SalesReport.vue | Admin only | — |
| `/admin/sales/discrepancies` | DiscrepancyView.vue | Admin only | — |
| `/admin/machines` | MachineList.vue | Admin only | — |
| `/admin/machines/new` | MachineForm.vue | Admin only | — |
| `/admin/machines/:id/edit` | MachineForm.vue | Admin only | — |
| `/admin/employees` | EmployeeList.vue | Admin only | — |
| `/admin/employees/new` | EmployeeForm.vue | Admin only | — |

---

## Phase 3: Employee Management

### New Files
- **`src/services/employeeService.js`** — list, create, deactivate employees
- **`src/views/admin/employees/EmployeeList.vue`** — card-based list (mobile), table (desktop)
- **`src/views/admin/employees/EmployeeForm.vue`** — add new employee form

### Note on Creating Employees
Creating auth users for others requires the `service_role` key (can't be exposed in browser). Will use a **Supabase Edge Function** `create-employee` — implementation deferred to when we build this phase.

---

## Phase 4: Machine Management

### New Files
- **`src/services/machineService.js`** — CRUD operations for machines
- **`src/views/admin/machines/MachineList.vue`** — card grid of machines with status toggle
- **`src/views/admin/machines/MachineForm.vue`** — add/edit machine (name, price, active status)

### Responsive UX
- **Phone**: Card grid (2 columns), tap to edit, FAB to add new machine
- **Desktop**: Data table with columns (name, price, status, actions), inline edit/deactivate buttons

### Seed Data
Pre-populate the `machines` table via SQL migration with: Playstation 5, Nintendo, GT Racing, EggVR, HTC Vive, Meta Quest — all at 500 KES.

---

## Phase 5: Roll Call (Attendance)

### New Files
- **`src/services/attendanceService.js`** — clock in/out, query attendance records
- **`src/views/admin/attendance/ClockInOut.vue`** — big clock-in/out button, today's status, elapsed timer
- **`src/views/admin/attendance/AttendanceLog.vue`** — admin: all records, filterable by employee/date
- **`src/views/admin/attendance/EmployeeHours.vue`** — admin: weekly/monthly hours + overtime summary

### Responsive UX
- **ClockInOut (phone)**: Full-screen centered button. Green "Clock In" / Red "Clock Out". Elapsed time in large font. One-tap action.
- **ClockInOut (desktop)**: Same button but in a centered card with today's summary alongside.
- **AttendanceLog (phone)**: Swipeable date cards, pull-to-refresh
- **AttendanceLog (desktop)**: Filterable data table with employee, date, clock in/out, hours, overtime columns

### Logic
- On page load: check if today has an open attendance record (clock_out IS NULL)
- Clock In: INSERT row with clock_in = now()
- Clock Out: UPDATE row with clock_out = now() (trigger computes hours + overtime)
- Show elapsed time with a client-side timer

---

## Phase 6: Session Logging + Daily Sales

### New Files
- **`src/services/sessionService.js`** — log sessions, query by date
- **`src/services/salesService.js`** — compute daily sales, enter partner report, upload files
- **`src/views/admin/sessions/SessionLogger.vue`** — log VR sessions
- **`src/views/admin/sessions/SessionHistory.vue`** — today's session log
- **`src/views/admin/sales/DailySalesForm.vue`** — enter partner reported revenue
- **`src/views/admin/sales/SalesReport.vue`** — admin: daily/weekly/monthly reconciliation table
- **`src/views/admin/sales/DiscrepancyView.vue`** — admin: filtered to days with discrepancies

### Responsive UX — Session Logger
The primary screen employees use throughout the day:

**Phone:**
- Machine buttons in a grid (pulled from `machines` table, only active) — tap to select
- **Quick-add mode**: tap machine button = +1 session logged instantly (undo toast via vue-sonner)
- **Batch mode**: select machine, enter number of sessions, submit
- Today's running total at top: "12 sessions — 6,000 KES"
- Session history below: scrollable list of today's entries with swipe-to-delete

**Desktop:**
- Split layout: machine buttons on left, live session table on right
- Session table with columns: machine, count, amount, time, actions (edit/delete)
- Running total in a sticky header bar

### Responsive UX — Daily Sales Form (next-day reconciliation)

**Phone:**
- Date picker defaults to yesterday
- Auto-computed totals from sessions (read-only): total sessions, total revenue, our share, partner share
- Input field: partner's reported revenue
- Discrepancy with color coding (green = match, red = mismatch)

**Desktop:**
- Two-column layout: left = session summary, right = partner input + discrepancy highlight
- Discrepancy highlighted inline with amounts side-by-side

### Flow
1. Throughout the day: employee logs sessions via SessionLogger (quick-tap or batch)
2. Next day: employee/admin opens DailySalesForm, enters partner's reported revenue
3. System calls `compute_daily_sales(date)` — sums sessions, computes splits and discrepancy
4. Admin reviews discrepancies in DiscrepancyView

---

## Phase 7: Dashboard + Polish

### New Files
- **`src/views/admin/Dashboard.vue`** — admin overview
- **`src/components/admin/StatCard.vue`** — stat card
- **`src/components/admin/DateRangeFilter.vue`** — date range picker for reports

### Dashboard Data (admin only)
- Employees currently clocked in
- Today's total sessions + revenue (live count)
- Recent discrepancies (last 7 days)
- Overtime alerts

### Responsive UX
- **Phone**: Stat cards in 2-column grid, tap to drill into detail, pull-to-refresh
- **Desktop**: 4-column stat row at top, recent activity table and discrepancy alerts below in a 2-column layout

---

## Implementation Order + Testing

Each phase is built and tested before moving to the next. Run `npm run dev` after each phase and verify on both phone and desktop.

### Phase 1: Foundation
**Build:**
1. Run SQL migrations (tables, triggers, RLS, seed machines) in Supabase
2. `npm install @supabase/supabase-js vue-sonner` + remove `@inertiajs/vue3`
3. Create `src/lib/supabase.js`
4. Create `src/composables/useAuth.js`

**Test:**
- [ ] Supabase connection works (`supabase.from('profiles').select()` returns data or empty array, no error)
- [ ] Tables exist in Supabase dashboard with correct columns
- [ ] RLS policies block unauthenticated requests
- [ ] Seed machines appear in the `machines` table

### Phase 2: Admin Shell + Routing
**Build:**
5. Create `Login.vue`
6. Create `AdminLayout.vue` (bottom tab bar + sidebar)
7. Update `src/router/index.js` with admin routes + guard
8. Add `public/_redirects`

**Test:**
- [ ] `/admin` redirects to `/admin/login` when not authenticated
- [ ] Login with valid credentials works, redirects to correct page based on role
- [ ] Login with wrong credentials shows error toast
- [ ] Navigation guard blocks employee from admin-only routes
- [ ] Bottom tab bar shows on phone, sidebar shows on desktop
- [ ] Public site (Home, About, Experiences, etc.) still works unchanged
- [ ] No Navbar/Footer visible on admin pages

### Phase 3: Employee Management
**Build:**
9. Build EmployeeList + EmployeeForm + Edge Function

**Test:**
- [ ] Admin can see list of all employees
- [ ] Admin can create a new employee (Edge Function works)
- [ ] Admin can deactivate an employee
- [ ] Employee cannot access employee management routes
- [ ] New employee can log in with their credentials

### Phase 4: Machine Management
**Build:**
10. Build MachineList + MachineForm

**Test:**
- [ ] 6 seeded machines appear in the list
- [ ] Admin can add a new machine with custom name and price
- [ ] Admin can edit an existing machine's name or price
- [ ] Admin can deactivate a machine (it disappears from active list but data is preserved)
- [ ] Phone shows card grid, desktop shows data table
- [ ] Employee cannot access machine management routes

### Phase 5: Attendance (Clock In/Out)
**Build:**
11. Build ClockInOut + AttendanceLog + EmployeeHours

**Test:**
- [ ] Employee sees "Clock In" button when not clocked in
- [ ] Tapping "Clock In" creates a row in the DB, button switches to "Clock Out"
- [ ] Elapsed timer counts up in real-time
- [ ] Tapping "Clock Out" records clock_out time, trigger computes total_hours and overtime_hours
- [ ] Employee cannot clock in twice on the same day
- [ ] Admin can view all employees' attendance in AttendanceLog
- [ ] Admin can filter attendance by employee and date range
- [ ] EmployeeHours shows correct weekly/monthly totals and overtime
- [ ] Phone and desktop layouts both work

### Phase 6: Session Logging + Daily Sales
**Build:**
12. Build SessionLogger + SessionHistory
13. Build DailySalesForm + SalesReport + DiscrepancyView

**Test (Session Logger):**
- [ ] Active machines appear as buttons (deactivated ones hidden)
- [ ] Quick-tap: tap machine = +1 session logged, undo toast appears
- [ ] Batch: select machine, enter count, submit — correct total_amount computed (count x price)
- [ ] Today's running total updates live at top of screen
- [ ] Session history shows all entries for today, can delete an entry
- [ ] Phone shows tap grid + list, desktop shows split view with table

**Test (Daily Sales):**
- [ ] Date picker defaults to yesterday
- [ ] Auto-computed totals from sessions match manual count
- [ ] Enter partner reported revenue — discrepancy auto-computes
- [ ] Green = match, red = mismatch color coding works
- [ ] SalesReport shows daily/weekly/monthly breakdown with splits
- [ ] DiscrepancyView filters to only days with mismatches
- [ ] Employee can only see their own sessions, admin sees all

### Phase 7: Dashboard + Polish
**Build:**
14. Build Dashboard with real data
15. Add loading states, error toasts, input validation across all pages
16. Responsive polish pass

**Test:**
- [ ] Dashboard shows: employees clocked in, today's sessions + revenue, recent discrepancies, overtime alerts
- [ ] Tapping a stat card navigates to the correct detail view
- [ ] Loading spinners appear while data fetches
- [ ] Error toasts show on failed operations (network error, validation)
- [ ] Empty states show helpful messages (no sessions today, no discrepancies, etc.)
- [ ] All pages tested on phone screen and desktop
- [ ] `npm run build` succeeds with no errors
- [ ] Deploy to Netlify, `/admin` routes work on page refresh

---

## Future Features
- CSV/PDF export for reports
- Charts (ApexCharts) for trends on dashboard
- Real-time updates via Supabase Realtime (live session feed)
- Break tracking (deduct from total hours)
- Multi-location support if VRSpace expands
- Payroll export (overtime hours in payroll format)
- Partner report OCR (auto-extract numbers from uploaded PDFs)
- Mobile PWA (service worker for offline session logging)
- Audit log (track all edits to attendance/sales records)
- Per-machine pricing (schema already supports it — just update via admin)
