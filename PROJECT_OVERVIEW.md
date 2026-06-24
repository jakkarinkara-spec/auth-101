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
├── proxy.ts                        # Route protection (Next.js 16 Proxy) ← ใหม่
├── drizzle.config.ts               # Drizzle ORM config
│
├── app/
│   ├── page.tsx                    # Landing page (Hero + Feature cards)
│   ├── layout.tsx                  # Root layout (Geist font)
│   │
│   ├── login/page.tsx              # Login form (Client Component)
│   ├── register/page.tsx           # Register form (Client Component)
│   ├── dashboard/page.tsx          # Dashboard (Server Component) ← ใหม่
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

Route Protection (2 layers)
  ├─ Layer 1 — proxy.ts (fast, edge-first)
  │     ├─ check session cookie exists
  │     ├─ /dashboard → redirect /login if no cookie
  │     └─ /login, /register → redirect /dashboard if already logged in
  └─ Layer 2 — dashboard/page.tsx (full validation)
        └─ auth() → verify JWT → redirect /login if invalid
```

---

## Environment Variables

```env
DATABASE_URL=   # Neon PostgreSQL connection string
AUTH_SECRET=    # 64-char hex key สำหรับ sign JWT
```

---

## UI Design

**Style:** Glassmorphism Dark Mode  
**Background:** `#030712` (deep navy-black) + gradient orbs  
**Cards:** `backdrop-blur-xl` + `bg-white/[0.04]` + `border-white/10`  
**Accent:** Indigo → Violet gradient  

| หน้า | Style note |
|------|-----------|
| Homepage | Landing page — hero, badge, feature cards |
| Login | Indigo accent, glass card, loading spinner |
| Register | Violet accent, glass card, password helper text |
| Dashboard | Server Component, profile + session info, sign out action |

---

## หมายเหตุ

- ตาราง `crops` ดูเหมือนเป็น code ทดลองที่ยังไม่ได้ใช้งานจริง
- ใช้ JWT session (ไม่ใช่ database session)
- `app/dashboard/page.tsx` เป็น Server Component ดึง session ด้วย `auth()` และ redirect ไป `/login` ถ้ายังไม่ได้ login
- Next.js 16 เปลี่ยนชื่อ `middleware.ts` → `proxy.ts` และ function ชื่อ `middleware` → `proxy` (deprecated ใน v16.0.0)
- proxy ทำหน้าที่แค่ตรวจ session cookie (fast check) ส่วน session จริงยัง validate ใน Server Component อีกชั้น
