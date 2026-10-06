# auth-101 — Project Overview

## สรุปภาพรวม

**น้ำลึก** — เว็บเช่าเรือตกปลาเหมาลำ สร้างด้วย Next.js 16 + NextAuth v5 + Drizzle ORM บน Neon PostgreSQL

แบ่งเป็น 2 ส่วน:

| ส่วน | หน้า | หน้าที่ |
|------|------|---------|
| **เว็บเช่าเรือ** (สาธารณะ) | `/`, `/boats`, `/boats/[id]` | ดูแพ็กเกจทริป ค้นหา/กรองเรือ เลือกทริป-วัน-จำนวนคน-บริการเสริม แล้วส่งคำขอจอง (ต้องล็อกอินตอนยืนยัน) |
| **บัญชีผู้ใช้** | `/login`, `/register` | สมัคร / เข้าสู่ระบบ (ดีไซน์เดียวกับเว็บเช่าเรือ) |
| **ลูกค้า** | `/bookings` | การจองของฉัน — ทริปที่กำลังจะถึง และที่ผ่านมา / ยกเลิก, ยกเลิกคำขอที่ยังรอยืนยันเองได้ (ต้องล็อกอิน) |
| **แอดมิน** | `/admin`, `/admin/boats/new`, `/admin/boats/[id]` | แดชบอร์ดผู้ดูแล: สรุปตัวเลข, ยืนยัน / ยกเลิกคำขอจอง, เพิ่ม / แก้ไขเรือ (เฉพาะ `role = admin`) |

หน้าเว็บเช่าเรือทำตามดีไซน์ `เว็บเช่าเรือตกปลา.html` (3 หน้า: หน้าแรก / เลือกเรือ / รายละเอียดเรือและจอง)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Auth | NextAuth v5 (beta) — Credentials Provider, JWT session |
| ORM | Drizzle ORM (`drizzle-orm/neon-http`) |
| Database | PostgreSQL บน Neon (serverless) |
| Password Hashing | bcryptjs |
| Styling | Tailwind CSS v4 |
| Fonts | Kanit + IBM Plex Sans Thai ผ่าน `next/font/google` (Geist ยังโหลดใน root layout) |

---

## โครงสร้างไฟล์

```
auth-101/
├── auth.ts                         # NextAuth config — Credentials provider, JWT, ใส่ user.id ลง session
├── proxy.ts                        # มี session cookie แล้วเข้า /login หรือ /register → redirect ไป / (matcher: /login, /register)
├── drizzle.config.ts
│
├── app/
│   ├── layout.tsx                  # Root layout — <html>/<body>, Geist font, script ตั้ง theme ก่อน paint (ไม่มี navbar)
│   ├── globals.css                 # Tailwind + design tokens light/dark และ component classes (ui-*) เดิม — หน้าปัจจุบันไม่ได้ใช้ ui-*
│   │
│   ├── (site)/                     # เว็บเช่าเรือ — route group (ไม่อยู่ใน URL)
│   │   ├── layout.tsx              # ฟอนต์ Kanit / IBM Plex Sans Thai + สีของดีไซน์เป็น CSS var --nl-* (ธีมสว่างตายตัว)
│   │   ├── _components/ui.tsx      # SiteNav (เมนู + เข้าสู่ระบบ/ออกจากระบบ), SiteHeader, AuthShell (โครงหน้า login/register), Placeholder, PortBadge, BoatLogo
│   │   ├── _components/styles.ts   # class ที่ใช้ทั้ง Server/Client: heading, field, fieldLabel, primaryButton, textLink
│   │   ├── page.tsx                # /  — hero, ฟอร์มค้นหา (GET → /boats), แพ็กเกจทริป (ราคาเริ่มต้นจาก DB), เรือแนะนำ 3 ลำ, วิธีจอง, ท่าเรือ (นับเรือจาก DB), CTA, footer
│   │   ├── boats/page.tsx          # /boats — รายการเรือ กรองด้วย ?port= &trip= &guests= &amenity= (ซ้ำได้) &date=
│   │   ├── boats/filters.tsx       # (Client) slider จำนวนคน + checkbox สิ่งอำนวยความสะดวก → เขียนลง URL
│   │   ├── boats/[id]/page.tsx     # /boats/[id] — ข้อมูลเรือ + วันที่ถูกจองแล้วใน 14 วันข้างหน้า
│   │   ├── boats/[id]/booking-form.tsx  # (Client) เลือกทริป / วัน / จำนวนคน / บริการเสริม + สรุปราคา → POST /api/bookings
│   │   ├── login/                  # page.tsx (Server: AuthShell, อ่าน ?callbackUrl= ?error= ?registered=) + login-form.tsx (Client: signIn)
│   │   ├── register/               # page.tsx (Server: AuthShell) + register-form.tsx (Client: POST /api/auth/register → /login?registered=1)
│   │   ├── bookings/page.tsx       # /bookings — การจองของฉัน (ไม่ล็อกอิน → /login?callbackUrl=/bookings) กรองด้วย userId ของ session
│   │   └── admin/                  # หน้าผู้ดูแล — ทุกหน้าเรียก adminSession() ใน guard.tsx (ไม่ล็อกอิน → /login?callbackUrl=..., ไม่ใช่ admin → <NotAdmin />)
│   │       ├── page.tsx            # /admin — สถิติ + ตารางคำขอจองกรอง ?status= + ตารางเรือ (ปุ่มเพิ่ม / แก้ไข)
│   │       ├── booking-actions.tsx # (Client) ยืนยัน / ยกเลิก 2 จังหวะ → PATCH /api/bookings/[id]
│   │       └── boats/              # new/page.tsx (/admin/boats/new), [id]/page.tsx (/admin/boats/[id]) + boat-form.tsx (Client: POST / PATCH /api/boats)
│   │                               #   + closures.tsx (Client: เพิ่มช่วงวันปิด / เปิดกลับทีละวัน) + active-toggle.tsx
│   │
│   ├── components/                 # ของเดิมจากธีมหลังบ้าน — ตอนนี้ไม่มีหน้าไหน import
│   │   ├── navbar.tsx              # Navbar (async Server Component) — sign in / sign out + theme toggle
│   │   └── theme-toggle.tsx        # (Client) สลับ light/dark
│   │
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth handler
│   │   ├── auth/register/          # POST /api/auth/register
│   │   ├── bookings/               # POST /api/bookings — route.ts + validate.ts (คำนวณราคาใหม่ที่ server)
│   │   ├── bookings/[id]/          # PATCH /api/bookings/[id] — admin เปลี่ยนสถานะ (confirmed / cancelled), ลูกค้ายกเลิกคำขอ pending ของตัวเอง
│   │   └── boats/                  # POST /api/boats, PATCH /api/boats/[id], PATCH /api/boats/[id]/active,
│   │                               #   POST /api/boats/[id]/closures, DELETE /api/boats/[id]/closures/[closureId] (admin เท่านั้น)
│   │
│   ├── lib/
│   │   ├── boats.ts                # ข้อมูลคงที่ (TRIPS, PORTS, AMENITIES, ADDONS, INCLUDED) + quote() คำนวณราคา + helper วันที่เวลาไทย
│   │   ├── search.ts               # firstParam() อ่าน searchParams, containsPattern() สำหรับ ILIKE
│   │   ├── redirect.ts             # safeCallbackUrl() — รับเฉพาะ path ในเว็บ กัน open redirect
│   │   └── admin.ts                # isAdmin(userId) — อ่าน users.role จาก DB, ห่อด้วย React cache() (SiteNav + /admin ใช้ query เดียวต่อ request)
│   │
│   └── db/
│       ├── index.ts                # Drizzle client (neon-http)
│       └── schema.ts               # users, boats, bookings
│
├── drizzle/                        # SQL migrations 0000–0010
├── scripts/
│   ├── migrate.ts                  # apply migrations ผ่าน Neon HTTP (ใช้ตอน vercel-build)
│   ├── baseline-migrations.ts      # mark migrations เก่าว่า applied แล้วโดยไม่รัน SQL
│   └── seed-boats.ts               # ใส่เรือตัวอย่าง 5 ลำจากดีไซน์
├── docs/                           # เอกสาร (Diátaxis): tutorials / how-to / reference / explanation
└── AGENTS.md / CLAUDE.md           # กฎสำหรับ AI agent
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
| role | enum `user_role` | `user` (default) / `admin` |
| createdAt | timestamp | Auto |

### `boats` — เรือให้เช่า
| Column | Type | Note |
|--------|------|------|
| id | text (UUID) | Primary Key |
| name | text | Required |
| port | text | Required — ชื่อสั้นของท่าเรือ ต้องตรงกับ `PORTS` ใน `app/lib/boats.ts` (สัตหีบ / หัวหิน / ภูเก็ต / เกาะช้าง) |
| lengthM, seats | integer | Required — ความยาว (เมตร), จำนวนคนสูงสุด |
| kind, captain | text | Required — ประเภทเรือ, ชื่อกัปตัน |
| description, engine, equipment | text | Nullable |
| tags | text[] | Required, default `{}` — สิ่งอำนวยความสะดวก ใช้กรองหน้า /boats |
| priceHalf, priceFull, priceNight | integer | Nullable — ราคาเหมาลำ (บาท) ต่อประเภททริป, `null` = ไม่รับทริปแบบนั้น |
| active | boolean | Required, default `true` — `false` = ปิดรับจอง (ใช้แทนการลบ): ไม่แสดงในหน้าเว็บ, จองเพิ่มไม่ได้, คำขอจองเดิมยังอยู่ |
| createdAt | timestamp | Auto |

### `bookings` — คำขอจอง
| Column | Type | Note |
|--------|------|------|
| id | text (UUID) | Primary Key |
| userId | text | FK → `users.id` (ON DELETE CASCADE) |
| boatId | text | FK → `boats.id` (ON DELETE CASCADE) |
| tripType | enum `trip_type` | `half` / `full` / `night` |
| tripDate | date | วันออกเรือ |
| guests | integer | จำนวนคน |
| addons | text[] | id ของบริการเสริม (`gear`, `lunch`, `photo`) |
| total, deposit | integer | คำนวณที่ server — deposit = 30% ของ total |
| status | enum `booking_status` | `pending` (default) / `confirmed` / `cancelled` |
| createdAt | timestamp | Auto |

- Unique index `bookings_boat_date_active` บน (`boat_id`, `trip_date`) เฉพาะแถวที่ `status <> 'cancelled'` → เรือหนึ่งลำจองได้วันละหนึ่งรายการ กันจองซ้อนได้แม้ส่งพร้อมกัน (neon-http ไม่มี interactive transaction)

### `boat_closures` — วันปิดรับจอง
| Column | Type | Note |
|--------|------|------|
| id | text (UUID) | Primary Key |
| boatId | text | FK → `boats.id` (ON DELETE CASCADE) |
| date | date | วันที่ปิดรับจอง |
| reason | text | Nullable — เช่น ซ่อมบำรุง / คลื่นลม |
| createdAt | timestamp | Auto |

- Unique index `boat_closures_boat_date` บน (`boat_id`, `date`) — วันละหนึ่งแถวต่อเรือ
- วันปิดแสดงเป็น "ปิด" ในปฏิทินหน้า `/boats/[id]` และ `POST /api/bookings` ตอบ 409 — คำขอจองที่มีอยู่แล้ววันนั้นไม่ถูกยกเลิกอัตโนมัติ (หน้าแก้ไขเรือแจ้งเตือนให้)

### ประวัติ migration
| ไฟล์ | เปลี่ยนอะไร |
|------|-------------|
| `0000`–`0001` | สร้าง `users`, `crops` |
| `0002`–`0003` | เพิ่มแล้วลบ `item_maintenance_requests` |
| `0004` | เพิ่ม `users.role` |
| `0005`–`0006` | เพิ่ม `plots` + เจ้าของแปลง (ระบบฟาร์มเดิม) |
| `0007` | เพิ่ม `boats`, `bookings` |
| `0008` | drop `crops`, `plots` (นำระบบฟาร์มออก) |
| `0009` | เพิ่ม `boats.active` (เปิด / ปิดรับจอง) |
| `0010` | เพิ่มตาราง `boat_closures` (วันปิดรับจองรายวันของแต่ละเรือ) |

---

## Flow หลัก

### จองเรือ
```
/  ──(ฟอร์มค้นหา GET)──►  /boats?port=&trip=&guests=&date=
                              │  กรองที่ server จาก searchParams
                              ▼
                         /boats/[id]?trip=&guests=&date=     (ค่าเริ่มต้นของฟอร์มมาจาก query)
                              │  เลือกทริป / วัน (ปฏิทิน 14 วัน เลือกได้วันเดียว, วันที่ถูกจองแสดง "เต็ม") / คน / บริการเสริม
                              │  ยังไม่ล็อกอิน → ปุ่ม "เข้าสู่ระบบเพื่อจอง" → /login?callbackUrl=/boats/[id]
                              ▼
                         POST /api/bookings
                              ├─ auth() — ไม่มี session → 401
                              ├─ validate: ทริป, วันที่ (พรุ่งนี้ – 60 วัน, เวลาไทย), จำนวนคน ≤ seats, add-on
                              ├─ คำนวณราคาด้วย quote() (ไม่เชื่อราคาจาก client)
                              └─ insert status = pending — ชน unique index → 409
```
- ยังไม่มีระบบชำระเงินจริง ปุ่มสร้างแค่ "คำขอจอง" (pending)
- admin ยืนยัน / ยกเลิกคำขอได้ที่ `/admin` — ยกเลิกแล้ววันนั้นว่างให้คนอื่นจอง และดึงกลับมาไม่ได้
- admin เพิ่ม / แก้ไขเรือได้ที่ `/admin/boats/new` และ `/admin/boats/[id]` — แก้ราคาแล้วคำขอจองเดิมยังใช้ราคาเดิมที่บันทึกไว้
- ไม่มีการลบเรือ — ใช้ "ปิดรับจอง" (`boats.active = false`) แทน: เรือหายจากหน้าแรก / `/boats` / จำนวนเรือต่อท่า / ราคาเริ่มต้น, หน้า `/boats/[id]` ยังเปิดได้แต่ขึ้น "ปิดรับจองชั่วคราว", `POST /api/bookings` ตอบ 409 — คำขอจองเดิมไม่ถูกยกเลิกอัตโนมัติ
- ลูกค้าดูการจองของตัวเองได้ที่ `/bookings` และกด "ยกเลิกคำขอ" (2 จังหวะ, `cancel-request.tsx`) ได้เฉพาะคำขอที่ยังรอยืนยันและยังไม่ถึงวัน — ยืนยันแล้วต้องติดต่อทาง LINE หรือให้ admin ยกเลิกให้
- SiteNav แสดงลิงก์ "การจองของฉัน" เมื่อล็อกอิน และ "แอดมิน" เฉพาะผู้ใช้ที่ `role = admin`
- ป้ายสถานะ (`STATUS_BADGE`) อยู่ใน `(site)/_components/styles.ts`, `addonLabel()` อยู่ใน `app/lib/boats.ts` — ใช้ร่วมกันระหว่าง `/admin` กับ `/bookings`

### Auth
```
Register  → POST /api/auth/register → validate → เช็คอีเมลซ้ำ (409) → bcrypt hash → insert
            → /login?registered=1 (ส่ง callbackUrl ต่อ)
Login     → signIn('credentials') → เทียบ bcrypt → ออก JWT → callbackUrl (default /)
            ผิด → NextAuth พากลับ /login?error=CredentialsSignin

proxy.ts — มี session cookie แล้วเข้า /login, /register → redirect /
ตอนนี้ไม่มีหน้าที่ต้องล็อกอินถึงเข้าได้ — การจองตรวจ session ด้วย auth() ใน POST /api/bookings
```
- `/api/*` ไม่อยู่ใน matcher ของ proxy → ทุก route handler ต้องเรียก `auth()` เอง
- `role` ไม่อยู่ใน JWT — ถ้าต้องเช็ค admin ให้ใช้ `isAdmin()` ซึ่งอ่านจาก DB (เปลี่ยน role แล้วมีผลทันที)

---

## UI

### เว็บเช่าเรือ (`app/(site)`)
- ทุกหน้าอยู่ใน `(site)` — ธีมสว่างตายตัวตามดีไซน์
- สีเป็น CSS variable ใน `(site)/layout.tsx` ใช้ผ่าน Tailwind เช่น `bg-(--nl-navy)`, `text-(--nl-ink)`
  - หลัก: navy `#0F3B52`, teal `#0B6E72`, accent ส้ม `#F29A4A`, พื้น `#F3F6F5`
  - override `--input-bg` / `--ink` ใน wrapper ด้วย เพื่อให้ dropdown (`<option>`) เป็นสีสว่างแม้ `<html data-theme="dark">`
- หัวข้อใช้ Kanit (`font-(family-name:--font-kanit)`), เนื้อหาใช้ IBM Plex Sans Thai
- รูปภาพยังเป็นกล่องลายทาง `[ภาพ ...]` (Placeholder) และข้อมูลติดต่อยังเป็น `[เบอร์โทร]`, `[LINE ID]` ตามดีไซน์

### ของเดิมที่ยังค้าง (ยังไม่มีหน้าใช้)
- `app/globals.css` — token light / dark (`--page`, `--panel`, `--ink`, `--accent` …) และ class `ui-*`
- `app/layout.tsx` — inline script ตั้ง `data-theme` จาก `localStorage` / `prefers-color-scheme`
- `app/components/navbar.tsx`, `theme-toggle.tsx` — navbar หลังบ้านแบรนด์ "Auth 101"
- เก็บไว้เผื่อทำหน้า dashboard / หลังบ้านใหม่ ถ้าไม่ใช้แล้วลบได้

---

## Scripts

| คำสั่ง | หน้าที่ |
|--------|--------|
| `npm run dev` / `build` / `start` / `lint` | คำสั่งมาตรฐาน Next.js |
| `npm run db:generate` | สร้าง migration จาก `schema.ts` (drizzle-kit) — ตรวจไฟล์ SQL ก่อน apply ทุกครั้ง |
| `npm run db:migrate` | apply migrations ใน `drizzle/` ผ่าน Neon HTTP driver |
| `npm run db:baseline` | mark migrations ว่า applied แล้วโดยไม่รัน SQL (ใช้กับ DB ที่สร้างด้วยวิธีอื่น) |
| `npm run seed:boats` | ใส่เรือตัวอย่าง 5 ลำ (ข้ามลำที่ชื่อซ้ำ รันซ้ำได้) |
| `vercel-build` | `migrate.ts` แล้ว `next build` — **deploy = รัน migration ใหม่กับ DB จริงอัตโนมัติ** |
| `npm run seed:imr` | ค้างจากของเดิม — ไฟล์ `scripts/seed-imr.ts` ไม่มีแล้ว รันไม่ได้ |

---

## Environment Variables

```env
DATABASE_URL=   # Neon PostgreSQL connection string
AUTH_SECRET=    # secret สำหรับ sign JWT (NextAuth v5)
```

- ไม่ตั้ง `AUTH_SECRET` จะเจอ `MissingSecret` ตอนเรียก `auth()`
- สร้าง secret ใหม่: `npx auth secret` (ดู `docs/how-to/rotate-auth-secret.md`)
- แก้ `.env` แล้วต้อง restart dev server

---

## หมายเหตุ / ข้อควรรู้

- **ตรวจ `DATABASE_URL` ก่อนรัน migration / seed จากเครื่อง** — `.env` ปัจจุบันชี้ไปที่ Neon (host แสดงตอนรัน `db:migrate` / `seed:boats`) ถ้าเป็น DB เดียวกับ production จะมีผลกับเว็บจริงทันที
- **CSS ค้าง (Turbopack cache)** — ถ้าแก้ `globals.css` หรือ class แล้วหน้าเว็บไม่เปลี่ยน ให้หยุด dev server, ลบ `.next/dev/cache` แล้วรันใหม่
- Next.js 16 ใช้ `proxy.ts` แทน `middleware.ts` และ API บางตัวต่างจากเวอร์ชันเก่า — อ่าน `node_modules/next/dist/docs/` ก่อนเขียนโค้ด (ดู `AGENTS.md`)
- `app/db/index.ts` import `neon` ไว้โดยไม่ได้ใช้ (lint warning เดิม)
- API reference ฉบับเต็มอยู่ที่ `docs/reference/api.md`
