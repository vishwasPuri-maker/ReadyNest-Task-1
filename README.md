# Dynamic Form Builder (ReadyNest — Week 1)

A full-stack **Dynamic Form Builder** where authenticated users can create, customize, publish, and share forms, while anyone can fill them out **without signing up**. Every response flows back into the owner's dashboard, with analytics, file uploads, and more.

> **Core idea:** Instead of hard-coding forms, the entire form structure is stored as **data** in the database. A single renderer reads that data and displays any form — so one component can render infinitely many different forms. Adding a new field type just means extending that one renderer.

**Live Demo:** https://ready-nest-task-1.vercel.app
**Repository:** https://github.com/vishwasPuri-maker/ReadyNest-Task-1

---

## Features

### Authentication
- Sign up & login with **JWT** stored in secure `httpOnly` cookies
- **Email verification** at signup using a 6-digit code
- **Forgot / Reset password** via a secure, time-limited email link
- Protected routes — only logged-in users can access the dashboard or manage forms
- Auto-redirect logged-in users away from login/signup

### Form Building
- **Drag-and-drop builder** — drag field types from a side palette into the form, and reorder fields by dragging
- **9 field types:** text, email, number, dropdown, checkbox, radio, date, textarea, and **file upload (image/PDF)**
- Auto-suggested labels when a field type is chosen (still fully editable)
- **Create, Edit, Delete** forms — editing preserves field IDs so older responses still map correctly
- **Save as Draft** (private) or **Publish** (generates a public link)
- **Publish / Unpublish** toggle
- A scannable **QR code** for every published form

### Responses
- Public form filling with **no login** + required-field validation
- Responses stored in the database with a timestamp
- A responses dashboard with **search**, **filters** (by field value), and **CSV export** (opens in Excel / Numbers)
- Uploaded files shown as image previews / file links

### Analytics & Real-time
- Analytics page tracking **views, fills, and conversion rate**
- Visualized with custom-built **SVG charts** (a donut for conversion + bar charts per form) — no external chart library
- **Near real-time updates via polling** — new responses update counts/tables and show a toast without a page refresh

### Extras
- A **Premium Templates** marketplace (free + unlockable templates, pricing-card UI)
- **Light / Dark mode** (theme persists across sessions)
- Loading skeletons for smooth navigation

---

## Tech Stack — what & why

| Tool | Used for |
|------|----------|
| **Next.js 16** (App Router, React 19) | Full app — frontend pages + backend API routes |
| **TypeScript** | Type safety across the whole codebase |
| **Tailwind CSS v4** | All styling and responsive UI |
| **PostgreSQL (Neon)** | Cloud database |
| **Prisma ORM** | Data modeling & type-safe DB access |
| **JWT (jsonwebtoken)** | Authentication (login sessions via httpOnly cookie) |
| **bcryptjs** | Secure password hashing |
| **Brevo** | Transactional emails (verification + password reset) |
| **Cloudinary** | Storing uploaded files (images / PDFs) |
| **qrcode.react** | Generating QR codes for published forms |
| **Vercel** | Hosting & CI/CD (auto-deploy from GitHub) |

---

## Folder Structure

```
form/
├── prisma/
│   └── schema.prisma            # DB models: User, Form, Field, Response, TemplatePurchase
│
├── src/
│   ├── app/                     # Next.js App Router (pages + API routes)
│   │   ├── layout.tsx           # Root layout (fonts, theme init script)
│   │   ├── page.tsx             # Landing / home page
│   │   ├── globals.css          # Theme tokens (light/dark) + global styles
│   │   │
│   │   ├── login/               # Login page
│   │   ├── signup/              # Signup page
│   │   ├── verify-email/        # Enter 6-digit verification code
│   │   ├── forgot-password/     # Request a reset link
│   │   ├── reset-password/[token]/  # Set a new password from the email link
│   │   │
│   │   ├── dashboard/           # Authenticated area
│   │   │   ├── layout.tsx       # Dashboard-wide font (Inter)
│   │   │   ├── loading.tsx      # Skeleton shown while data loads
│   │   │   ├── page.tsx         # Dashboard home (form cards + stats)
│   │   │   ├── analytics/       # Views / fills / conversion + charts
│   │   │   └── templates/       # Templates marketplace
│   │   │
│   │   ├── forms/
│   │   │   ├── new/             # Create form (form builder)
│   │   │   └── [id]/
│   │   │       ├── edit/        # Edit an existing form
│   │   │       └── responses/   # Owner-only responses table
│   │   │
│   │   ├── form/[id]/           # PUBLIC form page (no login) — fill & submit
│   │   │
│   │   └── api/                 # Backend API routes
│   │       ├── signup/          # Create account + send verification code
│   │       ├── login/           # Verify password + issue JWT
│   │       ├── logout/          # Clear auth cookie
│   │       ├── verify-email/    # Confirm the 6-digit code
│   │       ├── forgot-password/ # Email a reset link
│   │       ├── reset-password/  # Set a new password from token
│   │       ├── forms/           # POST create form / list
│   │       │   └── [id]/        # PUT update, PATCH publish toggle, DELETE
│   │       │       ├── responses/  # POST a response (public) 
│   │       │       └── view/    # Count a view (public)
│   │       ├── notifications/   # Recent responses (polled by the dashboard)
│   │       └── templates/
│   │           ├── use/         # Clone a template into a new form
│   │           └── purchase/    # Unlock a premium template
│   │
│   ├── components/
│   │   ├── Navbar.tsx           # Home page navbar
│   │   ├── ThemeToggle.tsx      # Light / dark switch
│   │   ├── auth/
│   │   │   ├── AuthCard.tsx     # Login / signup card (tabbed)
│   │   │   └── AuthBackground.tsx
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── FormCard.tsx     # Form card (publish, QR, delete, share)
│   │   │   ├── Charts.tsx       # SVG donut + bar charts
│   │   │   ├── TemplatesGallery.tsx / TemplateCard.tsx
│   │   │   ├── LiveUpdates.tsx  # Polling + new-response toasts
│   │   │   ├── DashboardSkeleton.tsx
│   │   │   └── LogoutButton.tsx
│   │   └── forms/
│   │       ├── FormBuilder.tsx  # Drag-and-drop builder (create + edit)
│   │       ├── PublicForm.tsx   # Renders & submits a public form
│   │       └── ResponsesTable.tsx  # Search, filter, CSV export
│   │
│   └── lib/                     # Server/shared utilities
│       ├── prisma.ts            # Prisma client singleton
│       ├── auth.ts              # JWT sign/verify + cookie config
│       ├── session.ts          # requireUser / getCurrentUserId helpers
│       ├── email.ts            # Brevo email sending
│       ├── cloudinary.ts        # File upload helper
│       ├── fields.ts            # The 9 field types + helpers
│       └── templates.ts         # Pre-built form templates
│
├── .env                         # Secrets (NOT committed)
├── next.config.ts
└── package.json
```

---

## Database Models (`prisma/schema.prisma`)

- **User** — id, name, email, hashed password, emailVerified, verifyCode, resetToken
- **Form** — id, title, description, published, views, `userId`, createdAt
- **Field** — id, label, type, required, options[], `formId`
- **Response** — id, `formId`, answers (JSON), createdAt
- **TemplatePurchase** — tracks which premium templates a user has unlocked

Responses store answers as **JSON keyed by field ID** (not label), so renaming a field never breaks old responses.

---

## API Routes

| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| POST | `/api/signup` | Create account + send code | Public |
| POST | `/api/login` | Login, issue JWT | Public |
| POST | `/api/logout` | Clear session | Public |
| POST | `/api/verify-email` | Confirm 6-digit code | Public |
| POST | `/api/forgot-password` | Email reset link | Public |
| POST | `/api/reset-password` | Set new password | Public |
| POST | `/api/forms` | Create a form | Owner |
| PUT | `/api/forms/[id]` | Update a form | Owner |
| PATCH | `/api/forms/[id]` | Publish / unpublish | Owner |
| DELETE | `/api/forms/[id]` | Delete a form | Owner |
| POST | `/api/forms/[id]/responses` | Submit a response | Public |
| POST | `/api/forms/[id]/view` | Count a view | Public |
| GET | `/api/notifications` | Recent responses (polling) | Owner |
| POST | `/api/templates/use` | Clone a template | Owner |
| POST | `/api/templates/purchase` | Unlock a premium template | Owner |
