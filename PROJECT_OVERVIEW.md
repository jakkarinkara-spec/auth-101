# auth-101 — Project Overview

## สรุปภาพรวม

โปรเจคนี้คือระบบ **Authentication** ที่สร้างด้วย Next.js เป็นโปรเจคสำหรับเรียนรู้การทำ Login/Register พร้อม database จริง

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Auth | NextAuth v5 (beta) — Credentials Provider |
| ORM | Drizzle ORM |
| Database | PostgreSQL via Neon (serverless) |
| Password Hashing | bcryptjs |
| Styling | Tailwind CSS v4 |

---

## โครงสร้างไฟล์สำคัญ

```
auth-101/
├── auth.ts                         # NextAuth config (JWT strategy)
├── drizzle.config.ts               # Drizzle ORM config
│
├── app/
│   ├── page.tsx                    # Homepage
│   ├── layout.tsx                  # Root layout (Geist font)
│   │
│   ├── login/page.tsx              # Login form
│   ├── register/page.tsx           # Register form
│   │
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/      # NextAuth catch-all handler
│   │       └── register/           # POST /api/auth/register
│   │
│   └── db/
│       ├── index.ts                # Drizzle DB client
│       └── schema.ts               # Table definitions
│
└── drizzle/                        # SQL migrations
```

---

## Database Schema

### `users`
| Column | Type | Note |
|--------|------|------|
| id | text (UUID) | Primary Key |
| name | text | Nullable |
| email | text | Unique, Required |
| password | text | bcrypt hash |
| createdAt | timestamp | Auto |

### `crops` *(ตาราง experimental)*
| Column | Type | Note |
|--------|------|------|
| id | text (UUID) | Primary Key |
| name | text | Nullable |
| dayGrow | text | Required |
| createdAt | timestamp | Auto |

---

## Auth Flow

```
Register
  └─► POST /api/auth/register
        ├─ validate input
        ├─ check duplicate email
        ├─ hash password (bcrypt, 10 rounds)
        └─ insert to DB → redirect to /login

Login
  └─► signIn('credentials') [NextAuth]
        ├─ query DB by email
        ├─ compare bcrypt hash
        └─ issue JWT → redirect to /dashboard
```

---

## Environment Variables

```env
DATABASE_URL=   # Neon PostgreSQL connection string
AUTH_SECRET=    # 64-char hex key สำหรับ sign JWT
```

---

## หมายเหตุ

- ตาราง `crops` ดูเหมือนเป็น code ทดลองที่ยังไม่ได้ใช้งานจริง
- ยังไม่มีหน้า `/dashboard` (มีแค่ redirect ไปหา)
- ใช้ JWT session (ไม่ใช่ database session)
