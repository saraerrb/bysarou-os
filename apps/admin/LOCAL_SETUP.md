# BySarou OS — Local Setup Guide

Follow these steps to get your Commerce OS running in a local development environment.

## 📋 Prerequisites
- **Node.js** (v18+)
- **PostgreSQL** (Running locally or via Docker)
- **npm** or **pnpm**

## 🚀 Getting Started

### 1. Clone & Install
```bash
cd bysarou-os
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/bysarou_os?schema=public"
JWT_SECRET="your_ultra_secret_key_here"
```

### 3. Database Initialization
```bash
# Apply schema changes
npx prisma db push

# Regenerate Prisma Client
npx prisma generate

# (Optional) Seed initial data
npx prisma db seed
```

### 4. Initial Admin Setup
Since this is a SaaS-ready platform, you need to create the first root admin:
1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:3000/register-admin`
3. Fill out the form to create your account and the default "BySarou" store.

### 5. Start Development
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

## 🛠️ Common Commands
- `npx prisma studio`: Open a visual editor for your database.
- `npx tsc --noEmit`: Run type checks.
- `npm run build`: Test production build stability.
