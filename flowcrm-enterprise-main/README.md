# FlowCRM Enterprise

A full-featured CRM I built with React, Express, and TypeScript. It's got everything you'd expect — leads, deals, pipeline kanban, role-based access, real-time updates, and a permission system that actually works end to end.

## What it does

FlowCRM is a customer relationship management app designed for teams that need granular control over who sees and does what. Think sales pipeline management, contact tracking, dashboards, task management, internal communication, calendar, audit logging — all the usual CRM stuff but with a permission engine that controls it at both the UI and API level.

There are four built-in roles (super admin, manager, sales executive, marketing), and you can create custom ones. The permission matrix UI lets you tick/untick 11 granular permissions per role. On the backend, every single route is gated by middleware that checks the same permissions, so there's no frontend-only security theater.

It also has two-factor auth, real-time notifications via WebSocket, CSV/Excel/PDF export, and a kanban board where you drag deals between pipeline stages.

## Tech stack

**Frontend:** React 19, TypeScript 5.8, Vite 8, Tailwind CSS 4.2, shadcn/ui (45+ Radix components), React Router 6, Recharts, @dnd-kit, Socket.IO client, date-fns, Zod 4, React Hook Form

**Backend:** Express 5.1, TypeScript (tsx runner), Socket.IO 4.8, bcryptjs, jsonwebtoken, speakeasy (TOTP), Zod 3, Multer, Nodemailer, Node native test runner

**Database:** JSON file-based. No external database server needed — everything persists to `data/database.json`. This was a deliberate choice to keep setup frictionless while still having a real backend.

## Architecture

The frontend and backend are in separate directories in a monorepo layout. The Vite dev server proxies `/api` and `/socket.io` to the Express server so in development everything runs on one origin.

The data flow is:
1. A user does something in the UI
2. React context updates immediately (optimistic)
3. An HTTP request goes to the backend
4. The backend validates, persists to the JSON file, and emits a Socket.IO event
5. All connected clients get the update in real time

Permissions are stored in localStorage as `roles:matrix` for fast client-side checks and synced from the backend on login. The `can()` function checks this matrix, falling back to hardcoded defaults if the server hasn't synced yet. On the backend side, `authorizePermission` middleware looks up the user's role and checks the required permission before any route handler runs.

## What's in it

### Role-based access control
- 4 default roles, unlimited custom roles
- 11 permissions: view/edit/delete leads, manage customers/deals, view revenue, manage reports/users/roles, send notifications, view audit
- Visual permission matrix with checkboxes
- Backend middleware enforces it on every route
- Permissions gate sidebar nav items, routes, and individual components

### Pipeline kanban
- Drag-and-drop deals between stages (using @dnd-kit)
- Custom pipelines with configurable stages
- Activity logging on every stage change

### Dashboard
- 8 KPI stat cards (leads, customers, open deals, revenue, forecast, conversion, tasks due, notifications)
- Revenue and forecast area chart
- Sales pipeline donut chart
- Team performance bar chart (admin only)
- Activity heatmap
- Quarterly goals progress bars
- Customizable widget layout — hide/reorder widgets, persisted to localStorage

### Lead management
- Full CRUD with searchable data table
- CSV import with column mapping
- Lead-to-customer conversion
- Bulk delete and bulk status updates
- Activity logging on every action

### Contacts, companies, customers
- Full CRUD with cross-entity linking
- Customer lifecycle tracking (active, churned, at risk, VIP)
- Total spend tracking

### Deal management
- Full CRUD with pipeline stage and probability tracking
- Close date and value tracking
- Status: open, won, lost

### Task management
- Priority levels (low, medium, high, urgent)
- Assignee assignment with due dates
- Related entity linking

### Communication center
- Unified inbox across channels (email, call, SMS, internal)
- From/to tracking with timestamps

### Calendar
- Events with start/end times
- Attendee management
- Recurrence: none, daily, weekly, monthly

### Notifications
- Real-time delivery via Socket.IO
- Read/unread tracking with badge indicator
- Dedicated notification center page

### Audit log
- Tracks every create, update, delete, assign, status change, login, and logout
- 15 activity kinds across all entities
- Admin-only delete capability

### Export
- CSV via PapaParse
- Excel via SheetJS
- PDF via jsPDF with auto-table

### Auth
- JWT-based with configurable expiry (default 7 days)
- Two-factor authentication (TOTP via speakeasy)
- Rate limiting on API endpoints
- Password hashing with bcryptjs
- Forgot/reset password flow

### UI odds and ends
- Responsive — sidebar becomes a drawer on mobile with bottom nav
- Command palette (Cmd+K)
- Dark mode (light, dark, system)
- Toast notifications
- Loading skeletons and empty states
- Confirmation dialogs on destructive actions
- Gradient accents and soft shadows

## Project structure

```
flowcrm-enterprise/
├── backend/
│   ├── data/database.json        # JSON file database
│   ├── src/
│   │   ├── auth/                 # JWT, password, token helpers
│   │   ├── config/               # CORS, database, env, mail, socket
│   │   ├── controllers/          # 19 route handlers
│   │   ├── middleware/           # Auth, permission, rate-limit, error, upload
│   │   ├── models/               # TypeScript interfaces (17 entities)
│   │   ├── routes/               # 20 route files
│   │   ├── services/             # Business logic
│   │   ├── sockets/              # WebSocket handlers
│   │   ├── utils/                # Analytics, CSV, pagination, formatters
│   │   ├── validations/          # Zod schemas
│   │   ├── tests/                # Integration tests
│   │   ├── app.ts
│   │   ├── server.ts
│   │   └── seed.ts
│   ├── uploads/
│   └── package.json
│
└── flowcrm-enterprise-main/      # Frontend
    ├── src/
    │   ├── components/
    │   │   ├── common/           # DataTable, StatCard, PageHeader, etc.
    │   │   ├── layout/           # AppShell, Sidebar, Topbar, BottomNav
    │   │   └── ui/               # 45 shadcn/ui components
    │   ├── context/
    │   │   ├── AuthContext.tsx    # Auth state + permissions
    │   │   ├── DataContext.tsx    # Global state + real-time
    │   │   └── ThemeContext.tsx
    │   ├── hooks/
    │   ├── lib/                  # Types, utils, formatters, exporters
    │   ├── routes/
    │   │   ├── auth/             # Login, register, forgot password
    │   │   └── _authenticated/   # 23 pages
    │   └── services/             # API client, auth, entities
    ├── App.tsx
    ├── main.tsx
    └── styles.css
```

## Getting started

You need Node.js 18+ and npm or bun.

```bash
# Install dependencies
cd flowcrm-enterprise-main && npm install
cd ../backend && npm install

# Seed the database
cd ../backend && npm run seed

# Start the backend (terminal 1)
npm run dev    # runs on :3001

# Start the frontend (terminal 2)
cd ../flowcrm-enterprise-main && npm run dev    # runs on :5173
```

The frontend proxies API and WebSocket calls to the backend automatically.

### Demo logins

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@flowcrm.com | SuperAdmin123 |
| Sales Executive | sales@flowcrm.com | TeamMember123 |
| Everyone else | — | Demo123 |

## API routes

All routes under `/api/` are RESTful. Everything except `/api/auth/*` requires a JWT Bearer token.

| Module | Key endpoints |
|--------|---------------|
| Auth | POST login, register, forgot, reset, logout, 2FA verify/setup/enable/disable, GET me |
| Users | CRUD + bulk delete (admin) |
| Roles | CRUD |
| Leads | CRUD + bulk delete |
| Contacts | CRUD + bulk delete |
| Companies | CRUD + bulk delete |
| Customers | CRUD + bulk delete |
| Deals | CRUD + bulk delete |
| Tasks | CRUD |
| Pipeline | CRUD + stages |
| Notifications | CRUD |
| Activities | Read, delete (admin) |
| Reports | Aggregated data |
| Dashboard | Metrics |
| Calendar | CRUD |
| Communications | CRUD |
| Notes | CRUD per entity |
| Attachments | Upload/download |
| Settings | User settings |

## Scripts

**Frontend:** `npm run dev` (dev server), `build` (production), `preview`, `lint`, `format`

**Backend:** `npm run dev` (hot-reload), `start` (production), `seed` (demo data), `test` (all tests), `test:auth`, `test:users`, `test:leads`, `test:deals`, `test:tasks`

## License

MIT
