# FlowCRM Enterprise

A full-stack CRM platform built for modern sales teams. Manage leads, track deals, organize contacts, assign tasks, and monitor your pipeline — all in real time.

**Live Demo:** [flowcrm-website.vercel.app](https://flowcrm-website.vercel.app)

---

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite (build tool)
- React Router 6 (routing)
- Tailwind CSS 4 + shadcn/ui (design system)
- Recharts (data visualization)
- Socket.IO client (real-time updates)
- Zod (validation)
- React Hook Form + dnd-kit

**Backend**
- Node.js + Express 5
- TypeScript
- Prisma ORM (PostgreSQL)
- Socket.IO (WebSocket)
- JWT authentication
- Speakeasy (2FA / TOTP)
- Bcrypt.js (password hashing)
- Zod (request validation)
- Nodemailer (email)

**Infrastructure**
- Database: PostgreSQL (Neon)
- Backend hosting: Render
- Frontend hosting: Vercel

---

## Features

### Sales Pipeline
- **Leads** — Capture, track, and convert leads through 7 stages (New Lead → Won/Lost)
- **Deals** — Pipeline view with drag-and-drop deal management, values, and close date tracking
- **Contacts** — Link contacts to companies and assign owners
- **Companies** — Company profiles with industry, revenue, employee count, and status tracking
- **Customers** — Customer records with spend tracking and status (Active, VIP, At Risk, Churned)

### Task & Calendar Management
- **Tasks** — Create, assign, and track tasks with priority levels (Low → Urgent)
- **Calendar** — Schedule events with recurrence (daily, weekly, monthly) and attendee tracking

### Team & Permissions
- **Team** — View all team members, their roles, and individual performance metrics
- **Roles & Permissions** — Granular role-based access control with 11 permission types. Create custom roles and toggle permissions per role
- **Pre-built roles:** Super Admin, Manager, Sales Executive, Marketing

### Dashboard & Analytics
- **Dashboard** — Real-time stats, revenue charts, pipeline breakdown, team performance bar chart, activity feed, task list, and a GitHub-style activity heatmap
- **Reports** — Revenue, pipeline, lead, and team performance reports
- **Audit Trail** — Complete activity log tracking all create, update, delete, and status change events

### Communication & Notifications
- **Notifications** — Real-time notifications for deal assignments, task alerts, and system events
- **Communications** — Log emails, calls, SMS, and internal messages with full history
- **Notes & Attachments** — Add contextual notes and file attachments to any entity

### Settings
- **Settings** — Platform-wide configuration and data management
- **Data Seeding** — Reset and seed demo data with one click

### Security
- JWT-based authentication
- Two-factor authentication (2FA/TOTP)
- Password reset via email
- Permission checks on every API endpoint
- Rate limiting

---

## Project Structure

```
flowcrm-enterprise-main/
├── backend/                     # Express.js API server
│   ├── prisma/
│   │   └── schema.prisma        # Database schema (15 models)
│   ├── src/
│   │   ├── config/              # DB, Prisma, Socket.IO, CORS, env
│   │   ├── controllers/         # 18 route controllers
│   │   ├── middleware/          # Auth, rate limiting, error handling
│   │   ├── models/              # TypeScript type definitions
│   │   ├── routes/              # 18 route handlers
│   │   ├── services/            # Business logic layer
│   │   ├── sockets/             # WebSocket event handlers
│   │   ├── utils/               # Analytics, filtering, CSV helpers
│   │   ├── validations/         # Zod schemas for request validation
│   │   ├── auth/                # JWT, password hashing, 2FA
│   │   ├── app.ts               # Express app setup
│   │   └── server.ts            # HTTP server + Socket.IO init
│   └── package.json
│
└── flowcrm-enterprise-main/     # React frontend
    ├── src/
    │   ├── components/
    │   │   ├── common/          # Reusable components (DataTable, etc.)
    │   │   ├── layout/          # AppShell, Sidebar, Header
    │   │   └── ui/              # 50+ shadcn/ui components
    │   ├── context/
    │   │   ├── AuthContext      # Auth state, login, 2FA, permissions
    │   │   ├── DataContext      # Entity data, CRUD, real-time sync
    │   │   └── ThemeContext     # Light/dark/system theme
    │   ├── lib/
    │   │   ├── types.ts         # All TypeScript interfaces & enums
    │   │   ├── format.ts        # Currency, date, number formatting
    │   │   ├── nav.ts           # Navigation configuration
    │   │   └── exporters.ts     # CSV, PDF, XLSX export utilities
    │   ├── routes/
    │   │   ├── auth/            # Login, Register, Forgot Password
    │   │   ├── _authenticated/  # 22 protected pages (dashboard, leads, etc.)
    │   │   ├── App.tsx          # Router + Error boundary
    │   │   └── main.tsx         # Entry point
    │   └── services/
    │       ├── api.ts           # Fetch wrapper with auth
    │       ├── auth.service.ts  # Auth API calls
    │       └── entities.service.ts  # Entity CRUD services
    └── package.json
```

---

## Database Models

The app uses 15 Prisma models:

| Model | Description |
|---|---|
| User | Team members with roles, 2FA, and activity tracking |
| Lead | Sales prospects with 7-stage pipeline |
| Contact | Individual contacts linked to companies |
| Company | Business entities with revenue and industry data |
| Customer | Paying customers with spend tracking |
| Deal | Sales opportunities with value, stage, and probability |
| Task | Assignable work items with priority and due dates |
| CalendarEvent | Scheduled events with recurrence |
| Activity | Audit log of all user actions |
| Notification | Real-time alerts and system messages |
| Note | Contextual notes on any entity |
| FileAttachment | Uploaded files linked to entities |
| Message | Communications (email, call, SMS, internal) |
| Pipeline | Custom sales pipeline definitions |
| Role | Role definitions with permission sets |
| Permission | Individual permission entries |
| PasswordResetToken | Password reset flow tokens |
| TeamGoal | Team performance targets |

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or use [Neon](https://neon.tech) for free)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd flowcrm-enterprise-main
```

### 2. Set up the backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN=604800
PORT=3001
NODE_ENV=development
CLIENT_URL="http://localhost:5173"
CORS_ORIGINS="http://localhost:5173,http://localhost:4173"
```

Push the database schema and seed demo data:
```bash
npx prisma db push
npm run seed
```

Start the backend:
```bash
npm run dev
```

### 3. Set up the frontend
```bash
cd ../flowcrm-enterprise-main
npm install
```

Create a `.env` file in the `flowcrm-enterprise-main/` directory:
```env
VITE_API_BASE_URL="http://localhost:3001"
VITE_WS_URL="http://localhost:3001"
```

Start the frontend:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. Demo Login
After seeding, use these credentials:

| Email | Password | Role |
|---|---|---|
| superadmin@flowcrm.com | SuperAdmin123 | Super Admin |
| sales@flowcrm.com | TeamMember123 | Sales Executive |

---

## Deploying

### Backend (Render)
1. Create a new Web Service on Render, connect your repo
2. Set the root directory to `backend`
3. Add the environment variables listed in the `.env` section above
4. Set build command: `npm install`
5. Set start command: `npx prisma db push --accept-data-loss || true; node --import tsx src/server.ts`

### Frontend (Vercel)
1. Import your repo on Vercel
2. Set the root directory to `flowcrm-enterprise-main`
3. Add environment variables:
   ```
   VITE_API_BASE_URL=https://your-backend.onrender.com
   VITE_WS_URL=https://your-backend.onrender.com
   ```
4. Deploy

---

## API Endpoints

All endpoints are under `/api/`.

| Resource | GET | POST | PUT | DELETE |
|---|---|---|---|---|
| `/auth` | `/me` | `/login`, `/register`, `/2fa/*`, `/forgot` | — | — |
| `/users` | `/`, `/:id` | `/` | `/:id` | `/:id` |
| `/leads` | `/`, `/:id` | `/` | `/:id` | `/:id` |
| `/contacts` | `/`, `/:id` | `/` | `/:id` | `/:id` |
| `/companies` | `/`, `/:id` | `/` | `/:id` | `/:id` |
| `/customers` | `/`, `/:id` | `/` | `/:id` | `/:id` |
| `/deals` | `/`, `/:id` | `/` | `/:id` | `/:id` |
| `/tasks` | `/`, `/:id` | `/` | `/:id` | `/:id` |
| `/events` | `/`, `/:id` | `/` | `/:id` | `/:id` |
| `/activities` | `/`, `/:id` | `/` | `/:id` | `/:id` |
| `/notifications` | `/`, `/:id` | `/` | `/:id` | `/:id` |
| `/communications` | `/`, `/:id` | `/` | `/:id` | `/:id` |
| `/notes` | `/`, `/:id` | `/` | `/:id` | `/:id` |
| `/attachments` | `/`, `/:id`, `/upload` | `/`, `/upload` | `/:id` | `/:id` |
| `/roles` | `/`, `/:id` | `/` | `/:id` | `/:id` |
| `/pipelines` | `/`, `/:id` | `/` | `/:id` | `/:id` |
| `/reports` | `/revenue`, `/pipeline`, `/leads`, `/team` | — | — | — |
| `/dashboard` | `/` | — | — | — |

Bulk delete available via `POST /:resource/bulk-delete`.

---

## Architecture

**Data Flow:**
```
Frontend → React Context (DataContext) → API Service → Express → Controller → Service → Database (Prisma/PostgreSQL)
                                                    ↓
                                            Real-time (Socket.IO) → Frontend
```

**Auth Flow:**
```
Login → JWT issued → Stored client-side → Sent as Bearer token → Backend verifies → Permission checks on every route
```

---

## License

This project is proprietary and intended for educational and internal use only.
