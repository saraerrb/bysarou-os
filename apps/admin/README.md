# BySarou OS — COD Commerce Operating System

> Local-first operating system for Cash-On-Delivery e-commerce businesses.  
> Manage inventory, orders, shipping, returns, confirmation, and analytics.

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- **Node.js** 18+ → [Download](https://nodejs.org)
- **PostgreSQL** installed and running locally → [Download](https://www.postgresql.org/download/)
- **npm** (comes with Node.js)

### 1. Install Dependencies

```bash
cd bysarou-os
npm install
```

### 2. Create the Database

Open a terminal and run:

```bash
createdb bysarou_os
```

Or using psql:

```sql
CREATE DATABASE bysarou_os;
```

### 3. Configure Environment

The `.env` file is already set up with defaults:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bysarou_os?schema=public"
```

> If your PostgreSQL user or password is different, update `.env` accordingly.

### 4. Push Schema & Generate Client

```bash
npx prisma db push
npx prisma generate
```

### 5. Seed Sample Data

```bash
npx tsx prisma/seed.ts
```

### 6. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
bysarou-os/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts              # Sample data
├── src/
│   ├── app/
│   │   ├── (dashboard)/     # Dashboard pages
│   │   │   ├── inventory/   # Inventory module
│   │   │   └── page.tsx     # Dashboard home
│   │   ├── api/             # API routes
│   │   │   ├── products/
│   │   │   ├── categories/
│   │   │   ├── stock/
│   │   │   └── variants/
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Design system
│   ├── components/
│   │   ├── layout/          # Sidebar, Header, DashboardLayout
│   │   └── inventory/       # Inventory components
│   ├── lib/
│   │   ├── prisma.ts        # Prisma singleton
│   │   └── constants.ts     # Nav items, sizes, etc.
│   └── types/
│       └── index.ts         # TypeScript interfaces
├── .env                     # Local environment variables
├── package.json
└── README.md
```

## 🧱 Tech Stack

| Layer      | Technology              |
|-----------|------------------------|
| Frontend  | Next.js 15 (App Router) |
| Styling   | TailwindCSS v4          |
| Language  | TypeScript              |
| Database  | PostgreSQL (local)      |
| ORM       | Prisma                  |
| Icons     | Lucide React            |

## 📦 Available Modules

- ✅ **Dashboard** — Overview + module navigation
- ✅ **Inventory** — Products, variants, stock management
- 🔜 Orders
- 🔜 Shipping
- 🔜 Returns
- 🔜 Confirmation
- 🔜 Finance
- 🔜 Analytics

## 📝 License

Private — BySarou © 2026
