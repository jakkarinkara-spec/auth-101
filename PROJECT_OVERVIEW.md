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
├── proxy.ts                        # Route protection (Next.js 16 Proxy)
├── drizzle.config.ts               # Drizzle ORM config
│
├── app/
│   ├── page.tsx                    # Landing page (Hero + Feature cards)
│   ├── layout.tsx                  # Root layout — Geist font + global Navbar
│   │
│   ├── components/
│   │   ├── navbar.tsx              # Global Navbar — auth-aware (sign in / sign out) + theme toggle
│   │   └── theme-toggle.tsx        # Light/dark theme toggle button (Client Component)
│   │
│   ├── login/page.tsx              # Login form (Client Component)
│   ├── register/page.tsx           # Register form (Client Component)
│   ├── dashboard/page.tsx          # Dashboard (Server Component) + ลิงก์ไป Manage crops
│   ├── dashboard/crops/            # หน้า Crops: page.tsx (Server — list) + create-crop-form.tsx (Client — form)
│   │
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/      # NextAuth catch-all handler
│   │       └── register/           # POST /api/auth/register
│   │   └── crops/route.ts          # POST /api/crops — สร้าง crop (ต้องล็อกอิน)
│   │
│   ├── items/                      # Mock API routes (คืนค่า JSON ตายตัว ไม่ต่อ DB / ไม่มี auth)
│   │   ├── SubmitSup/[id]/route.ts                      # POST → { returnCode: "OK", tranId }
│   │   ├── planogram-maintenance-requests/[imrId]/route.ts  # GET → รายการ IMR + items (current/new value)
│   │   └── planogram-requests/[imrId]/route.ts          # PATCH → { success: true }, POST → ข้อมูล supplier ตัวอย่าง
│   │
│   └── db/
│       ├── index.ts                # Drizzle DB client (neon-http)
│       └── schema.ts               # Table definitions
│
├── drizzle/                        # SQL migrations (0000–0003)
├── docs/                           # เอกสาร (Diátaxis): tutorials / how-to / reference / explanation
├── REDESIGN.md                     # บันทึกการ redesign UI (glassmorphism + light/dark)
└── AGENTS.md / CLAUDE.md           # กฎสำหรับ AI agent (รวมกฎให้อัปเดตไฟล์นี้)
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

### `crops`
| Column | Type | Note |
|--------|------|------|
| id | text (UUID) | Primary Key |
| name | text | Nullable |
| dayGrow | integer | Required (`day_grow`) |
| createdAt | timestamp | Auto |

> Migration `0002` เคยสร้างตาราง `item_maintenance_requests` (+ enum) แต่ `0003` ลบทิ้งแล้ว — ปัจจุบันมีแค่ `users` และ `crops`
> `schema.ts` ยัง import `jsonb`, `pgEnum` ไว้โดยไม่ได้ใช้

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
AUTH_SECRET=    # 64-char hex key สำหรับ sign JWT (NextAuth v5 ต้องใช้ชื่อนี้)
```

- ถ้าไม่ตั้ง `AUTH_SECRET` จะเจอ error `MissingSecret` ที่ `<Navbar />` ใน `app/layout.tsx` (เพราะเรียก `auth()`)
- `.env` ยังมี `BETTER_AUTH_SECRET` ค้างอยู่ ซึ่งโปรเจคนี้ไม่ได้ใช้ (ไม่ได้ใช้ Better Auth) — ลบได้
- แก้ `.env` แล้วต้อง restart dev server
- สร้าง secret ใหม่ได้ด้วย `npx auth secret` (ดู `docs/how-to/rotate-auth-secret.md`)

---

## UI Design

**Style:** Glassmorphism — รองรับทั้ง Light และ Dark Mode  
**Background:** Light `#f8fafc` / Dark `#030712` — ทั้งคู่มี gradient orbs  
**Cards:** `backdrop-blur-xl` + `bg-black/[0.02]` (light) / `bg-white/[0.04]` (dark) + border คู่กัน  
**Accent:** Indigo → Violet gradient (ใช้เหมือนกันทั้ง 2 theme)  

| หน้า | Style note |
|------|-----------|
| Homepage | Landing page — hero, badge, feature cards |
| Login | Indigo accent, glass card, loading spinner |
| Register | Violet accent, glass card, password helper text |
| Dashboard | Server Component, profile + session info |
| Navbar (global) | Auth-aware — sign out เมื่อ login, sign in เมื่อไม่ได้ login + ปุ่มสลับ theme |

### Light/Dark Mode

- ผู้ใช้สลับ theme ได้ผ่านปุ่มไอคอน sun/moon ใน Navbar (`app/components/theme-toggle.tsx`)
- ค่า theme เก็บใน `localStorage` (key: `theme`) — จำค่าไว้ข้าม session
- ถ้าไม่มีค่าเก็บไว้ จะ fallback ไปตาม `prefers-color-scheme` ของระบบ
- ใช้ attribute `data-theme="light" | "dark"` บน `<html>` แทนการใช้ class — ตาม pattern ที่ Next.js 16 docs แนะนำสำหรับ [preventing flash before hydration](node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md)
- มี inline `<script>` ใน `<head>` (ใน `app/layout.tsx`) ที่ set attribute ก่อน browser paint — ป้องกัน flash ของ theme ผิดตอนโหลดหน้า
- Tailwind v4 ผูก `dark:` variant เข้ากับ `[data-theme="dark"]` ผ่าน `@custom-variant` ใน `app/globals.css` (ปกติ Tailwind v4 จะผูก `dark:` กับ `prefers-color-scheme` เท่านั้น ถ้าไม่ประกาศ custom variant)

---

## Scripts

| คำสั่ง | หน้าที่ |
|--------|--------|
| `npm run dev` / `build` / `start` / `lint` | คำสั่งมาตรฐานของ Next.js |
| `npm run seed:imr` | รัน `scripts/seed-imr.ts` — **ไฟล์นี้ไม่มีอยู่แล้ว** (ตาราง IMR ถูกลบใน migration 0003) script นี้จึงรันไม่ได้ |

---

## หมายเหตุ

- Route ใน `app/items/**` เป็น mock endpoint ที่คืน JSON ตายตัว (ข้อมูล planogram/supplier ตัวอย่าง) ไม่ได้ผ่าน `proxy.ts` และไม่ได้ตรวจ session
- ตาราง `crops` ใช้ที่หน้า `/dashboard/crops` — สร้างผ่าน `POST /api/crops` (route นี้เช็ค `auth()` เองเพราะ `/api/*` ไม่อยู่ใน matcher ของ proxy) ยังไม่มีคอลัมน์ owner ทุก user จึงเห็นรายการเดียวกัน
- ใช้ JWT session (ไม่ใช่ database session)
- `app/dashboard/page.tsx` เป็น Server Component ดึง session ด้วย `auth()` และ redirect ไป `/login` ถ้ายังไม่ได้ login
- Next.js 16 เปลี่ยนชื่อ `middleware.ts` → `proxy.ts` และ function ชื่อ `middleware` → `proxy` (deprecated ใน v16.0.0)
- proxy ทำหน้าที่แค่ตรวจ session cookie (fast check) ส่วน session จริงยัง validate ใน Server Component อีกชั้น
- `app/components/navbar.tsx` เป็น async Server Component ตรวจ session ด้วย `auth()` — แสดง sign out เมื่อ login อยู่, แสดง sign in + get started เมื่อยังไม่ login
- Navbar เป็น `fixed` (position) — dashboard page ใช้ `pt-16` เพื่อ offset ให้ content ไม่ถูกทับ
- `app/components/theme-toggle.tsx` เป็น Client Component แต่ไม่ใช้ React state เพื่อ toggle icon — ใช้ CSS (`dark:hidden` / `dark:block`) ล้วนๆ เพื่อเลี่ยง hydration mismatch ระหว่าง server default กับค่าที่ script แก้ไว้ก่อน paint
