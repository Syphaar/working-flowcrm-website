
# FlowCRM Enterprise — Build Plan

## Heads up on stack
Your prompt asks for "React Router," but this project is on **TanStack Start + TanStack Router** (file-based routing). I'll use TanStack Router — it provides the same routing capabilities and is what's wired up. Everything else (React, TS, Tailwind, shadcn/ui, Lucide) matches your spec.

Given the enormous scope (20+ modules), I'll deliver this in a **single large build pass** as one cohesive app. Some "nice-to-have" depth will be scoped to keep the app shippable and snappy — see the Scope section.

---

## Scope (what ships in v1)

**Full depth (production-feel):**
- Auth: Login / Register / Forgot Password / Unauthorized, protected routes, logout confirm, two demo accounts seeded
- Layout: Desktop sidebar + topbar; mobile drawer + bottom nav; global search; ⌘K command palette
- Super Admin Dashboard: KPI cards, revenue chart, pipeline, recent activity, tasks, customizable widgets (show/hide/reorder + localStorage)
- Team Member Dashboard: scoped to assigned data
- Modules with full CRUD + search + filters + sort + pagination + bulk actions + notes + attachments + timeline:
  Leads, Contacts, Companies, Customers, Deals, Tasks, Activities, Calendar, Notifications, Users/Team, Roles & Permissions
- Pipeline Kanban with drag-and-drop (stage update + activity log)
- Reports: revenue / sales / team / conversion / customer growth charts (Recharts)
- Settings: profile, theme (light/dark/system), 2FA toggle (code 123456), reset demo data
- Global activity/audit log on every create/edit/delete/assign/status-change/login/logout
- CSV import for Leads (upload → preview → map → confirm)
- Export to CSV (real), Excel (.xlsx via SheetJS), PDF (jsPDF)
- Toasts, confirm dialogs, loading skeletons, empty states everywhere
- Reusable components: StatCard, DataTable, SearchBar, Modal, ConfirmDialog, Pagination, NotificationCard, ActivityCard, entity Cards, EmptyState, LoadingSkeleton
- Mock data volumes as specified (100 leads, etc.)

**Pragmatic simplifications (still functional, lighter depth):**
- Communication Center: unified inbox UI with mock emails/calls/SMS/internal — composing logs an activity, no real send
- Attachments: filename + size + type stored in state (no actual file blob persistence beyond session)
- Recurring events: stored as a recurrence rule string + expanded in calendar view (daily/weekly/monthly only)
- Saved filters: per-user in localStorage (not shareable)
- User presence: simulated (random online/away/offline, "last active X min ago")
- Permission matrix: enforced at UI level (route guards + button gating)

---

## Technical approach

- **Routing:** TanStack Router file-based under `src/routes/`. Pathless `_authenticated` layout gates app routes; `auth/*` routes are public.
- **State:** React Context for `auth`, `data` (entity stores), `notifications`, `activity`, `theme`, `permissions`. Persisted to `localStorage` with a seed-on-first-load hydrator and Reset Demo Data action.
- **Data layer:** Single `mockSeed.ts` generates deterministic data via seeded PRNG so refreshes are stable. Stores expose CRUD methods that also append to the activity log.
- **UI:** shadcn components already in the project; add only what's missing. Tailwind v4 tokens in `src/styles.css` updated to the FlowCRM palette (indigo/cyan/orange + status colors), gradients, soft shadows, rounded radii.
- **Charts:** Recharts (`recharts` package).
- **DnD:** `@dnd-kit/core` for pipeline kanban.
- **Export:** `papaparse` (CSV), `xlsx` (Excel), `jspdf` + `jspdf-autotable` (PDF).
- **Command palette:** shadcn `command` + global `⌘K` listener.
- **Forms:** react-hook-form + zod (already common with shadcn).
- **Responsive:** Sidebar collapses to drawer < md; bottom nav on mobile for primary sections.

---

## File structure (high level)

```text
src/
  routes/
    __root.tsx                 (providers + shell)
    index.tsx                  (redirect → /auth/login or /dashboard)
    auth/
      login.tsx, register.tsx, forgot-password.tsx, unauthorized.tsx
    _authenticated/
      route.tsx                (guard + AppShell layout)
      dashboard.tsx
      leads.tsx, leads.$id.tsx
      contacts.tsx, contacts.$id.tsx
      companies.tsx, companies.$id.tsx
      customers.tsx, customers.$id.tsx
      deals.tsx, deals.$id.tsx
      pipeline.tsx
      activities.tsx
      tasks.tsx
      calendar.tsx
      reports.tsx
      notifications.tsx
      communications.tsx
      team.tsx, team.$id.tsx
      roles.tsx
      audit.tsx
      settings.tsx
  components/
    layout/ (AppShell, Sidebar, Topbar, BottomNav, CommandPalette, GlobalSearch)
    common/ (StatCard, DataTable, SearchBar, Pagination, ConfirmDialog, EmptyState, LoadingSkeleton, NotesPanel, Timeline, AttachmentsPanel)
    cards/ (LeadCard, DealCard, ContactCard, CustomerCard, UserCard, NotificationCard, ActivityCard, CalendarCard)
    charts/ (RevenueChart, PipelineChart, TeamPerformanceChart, ConversionChart, Heatmap)
    pipeline/ (KanbanBoard, KanbanColumn, KanbanCard)
  context/ (AuthContext, DataContext, NotificationContext, ThemeContext)
  lib/ (mockSeed.ts, storage.ts, permissions.ts, export.ts, csv.ts, dates.ts, presence.ts)
  styles.css                   (FlowCRM tokens)
```

## Demo accounts
- `superadmin@flowcrm.com` / `SuperAdmin123` → Super Admin (everything)
- `sales@flowcrm.com` / `TeamMember123` → Sales Executive (assigned data only)

## Build order
1. Design tokens + AppShell + Auth + route guards + demo accounts
2. Mock data seed + Data/Notification/Activity contexts + storage
3. Reusable primitives (DataTable, StatCard, etc.) + Command palette + global search
4. Dashboard (admin + member variants) with customizable widgets
5. Leads → Contacts → Companies → Customers → Deals (CRUD, detail pages, notes, attachments, timeline)
6. Pipeline kanban with DnD + Tasks + Calendar + Activities + Communications
7. Reports + Notifications center + Team + Roles/Permissions + Audit
8. Settings (profile, theme, 2FA toggle, reset demo data) + Exports + CSV import + final polish pass

This is a multi-thousand-line build. I'll execute it end-to-end once you approve. Ready to proceed?
