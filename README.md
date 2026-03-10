# Monash College Management System

Fullstack college management platform — Express REST API + Next.js dashboard. Manages students, lecturers, head lecturers, courses, and documents with role-based access control.

## Tech Stack

| Layer    | Stack                          |
| -------- | ------------------------------ |
| Backend  | Express 5, TypeScript, Prisma 7 |
| Database | MySQL                          |
| Frontend | Next.js 16, React 19           |
| Auth     | JWT (access + httpOnly refresh cookie) |

## Project Structure

```
ts-prisma/
├── api-ts-prisma/    # Backend REST API
├── frontend/         # Next.js dashboard
└── README.md
```

## Prerequisites

- Node.js 20+
- MySQL 8+
- npm or pnpm

## Setup

### 1. Backend

```bash
cd api-ts-prisma
cp .env.example .env   # or create .env with your config
npm install
```

Configure `.env`:

```env
DATABASE_URL="mysql://user:password@localhost:3306/monash_db"
PORT=5000
JWT_ACCESS_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=http://localhost:3000
RESEND_API_KEY=re_xxx   # for email verification & password reset
```

```bash
npm run db:migrate      # run migrations
npm run dev             # start API on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env    # or create .env
```

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

```bash
npm install
npm run dev             # start on http://localhost:3000
```

## Scripts

### Backend (`api-ts-prisma`)

| Script        | Description              |
| ------------- | ------------------------ |
| `npm run dev` | Start dev server (tsx)   |
| `npm run build` | Compile TypeScript    |
| `npm run start` | Run production build  |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run migrations       |
| `npm run db:studio` | Open Prisma Studio   |

### Frontend (`frontend`)

| Script           | Description        |
| ---------------- | ------------------ |
| `npm run dev`    | Start Next.js dev  |
| `npm run build`  | Production build   |
| `npm run start`  | Run production    |
| `npm run lint`   | Run ESLint         |
| `npm run format` | Format with Prettier |

## Features

- **Auth**: Register, login, email verification, forgot/reset password
- **Roles**: Student, Lecturer, Head Lecturer
- **Documents**: Upload profile pictures, IC, transcripts, etc.
- **Courses**: Manage courses and assign students/lecturers
- **Profile**: Edit profile, change password

## License

Private
