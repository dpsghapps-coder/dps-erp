<div align="center">

# DPS-ERP

### Enterprise Resource Planning for Design & Print Solutions

A modern, full-stack ERP system built for printing, manufacturing, and creative service companies.
Manages the entire business lifecycle — from client acquisition and orders to production, procurement, and financials.

<br/>

![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)

</div>

---

## Features

- **12 Business Modules** — CRM, Orders, Production, Inventory, Procurement, HRM, Finance, Studio, Decision Hub, Chat, Admin, and more
- **Kanban Production Board** — Drag-and-drop job tracking across 8 workflow stages with real-time metrics
- **Multi-Step Procurement** — Full purchase request → approval → PO → receipt → inspection workflow
- **Role-Based Access Control** — 54 granular permissions across 12 modules, 11 predefined roles
- **Decision Hub** — Meeting management, decision tracking, action items, and reviews
- **Real-Time Chat** — Direct messages, group conversations, file attachments, and read receipts
- **Global Search** — Cross-module search via `Ctrl+K` / `Cmd+K`
- **Dark Mode** — Full dark theme with system preference detection and persistence
- **Glassmorphism UI** — Custom glass-card design system with responsive layout
- **GPS Map Picker** — Leaflet-based location picker for client and supplier addresses

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Laravel 12, PHP 8.2+, Inertia.js Server |
| **Frontend** | React 18, TypeScript 5, Inertia.js Client |
| **Styling** | Tailwind CSS 4, Framer Motion, Lucide Icons |
| **Build** | Vite 7, PostCSS |
| **Database** | SQLite (default), MySQL/PostgreSQL supported |
| **Auth** | Laravel Breeze (Inertia + React), Sanctum |
| **Charts** | Recharts |
| **Drag & Drop** | @dnd-kit |
| **Maps** | Leaflet |
| **Notifications** | Sonner (toasts), SweetAlert2 (dialogs) |

---

## Modules

| Module | Description | Key Features |
|---|---|---|
| **CRM** | Client & lead management | Contacts, interaction logging, lead pipeline, reports |
| **Orders** | Order lifecycle | Order creation, confirmation, payment tracking, line items |
| **Production** | Job shop floor | Kanban board, 8-stage workflow, drag-and-drop, status history |
| **Inventory** | Material management | Product catalog, stock levels, restock alerts, material categories |
| **Procurement** | Purchasing | POs, goods received, multi-step purchase requests, supplier pricing |
| **HRM** | People management | Employees, attendance, leaves, payroll, performance, noticeboard |
| **Finance** | Income & expenses | Transaction tracking, categories, date filtering |
| **Studio** | Booking management | Studio session scheduling |
| **Decision Hub** | Governance | Meetings, decisions, action items, reviews |
| **Chat** | Communication | Direct messages, groups, file sharing, read receipts |
| **Admin** | System config | Users, roles, permissions, settings, audit logs |
| **Dashboard** | Overview | Cross-module metrics and quick links |

---

## Roles

| Role | Scope |
|---|---|
| `admin` | Full system access |
| `md` | Managing Director — full access to all modules |
| `manager` | Broad operational access across departments |
| `supervisor` | Team oversight with edit access |
| `senior_designer` | Full studio and creative access |
| `junior_designer` | Limited studio access |
| `senior_artisan` | Full production and inventory access |
| `junior_artisan` | Limited production access |
| `intern` | View-only access across modules |
| `senior_customer_service_rep` | Full CRM and orders access |
| `junior_customer_service_rep` | Basic CRM and orders view access |
| `general` | Basic view-only access |

---

## Getting Started

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+ & npm
- SQLite (default) or MySQL/PostgreSQL

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd dps-erp

# Run the full setup script (installs deps, generates key, migrates, seeds)
composer setup
```

### Manual Setup

```bash
# Install PHP dependencies
composer install

# Install JS dependencies
npm install

# Create environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run database migrations and seeders
php artisan migrate --seed

# Build frontend assets
npm run build
```

### Development Server

```bash
# Start all services (server, queue, logs, Vite)
composer dev

# Or start individually
php artisan serve          # HTTP server
npm run dev                # Vite dev server
php artisan queue:listen   # Queue worker
php artisan pail           # Real-time logs
```

### Default Credentials

| Email | Password | Role |
|---|---|---|
| `admin@dps-erp.com` | `password` | Admin |

---

## Project Structure

```
dps-erp/
├── app/
│   ├── Http/Controllers/     # 16+ controllers across all modules
│   ├── Models/               # 40+ Eloquent models
│   └── Notifications/        # Module-specific notification classes
├── database/
│   ├── migrations/           # 85 migration files
│   └── seeders/              # 10 seeders with sample data
├── resources/
│   ├── css/                  # Tailwind + glassmorphism component styles
│   └── js/
│       ├── Components/       # Reusable UI (Chat/, HRM/, Production/, ui/)
│       ├── Layouts/          # AppLayout with permission-gated sidebar
│       ├── Pages/            # 16 page modules (Admin through Welcome)
│       └── Utils/            # Currency formatting (GHS)
├── routes/
│   └── web.php               # All route definitions with permission middleware
└── vite.config.js
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (React)                       │
│   Pages ─── Components ─── Inertia.js ─── Tailwind     │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP
┌────────────────────────┴────────────────────────────────┐
│                  Laravel 12 Backend                      │
│   Controllers ─── Inertia ─── Eloquent ─── Middleware   │
│                  (Permission Gates)                      │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────┐
│              SQLite / MySQL / PostgreSQL                 │
│   85 migrations ─── 40+ tables ─── Seeders              │
└─────────────────────────────────────────────────────────┘
```

**Key Patterns:**
- Controllers return `inertia()` responses — no API layer needed
- Frontend permission checks via `can()` in React components
- Sidebar navigation dynamically shows/hides modules based on user role
- Flash messages from server rendered as Sonner toasts
- Vite prefetching enabled for faster page transitions

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+K` / `Cmd+K` | Open global search |

---

## Testing

```bash
# Run full test suite
composer test

# Or directly
php artisan test
```

---

## License

This project is proprietary software. All rights reserved.

---

<div align="center">

**DPS-ERP** — Built for Design & Print Solutions

</div>
