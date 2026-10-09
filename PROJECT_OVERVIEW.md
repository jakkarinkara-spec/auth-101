# auth-101 — Project Overview

## สรุปภาพรวม

**น้ำลึก** — เว็บเช่าเรือตกปลาเหมาลำ สร้างด้วย Next.js 16 + NextAuth v5 + Drizzle ORM บน Neon PostgreSQL

แบ่งเป็น 2 ส่วน:

| ส่วน | หน้า | หน้าที่ |
|------|------|---------|
| **เว็บเช่าเรือ** (สาธารณะ) | `/`, `/boats`, `/boats/[id]` | ดูแพ็กเกจทริป ค้นหา/กรองเรือ เลือกทริป-วัน-จำนวนคน-บริการเสริม แล้วส่งคำขอจอง (ต้องล็อกอินตอนยืนยัน) |
| **บัญชีผู้ใช้** | `/login`, `/register` | สมัคร / เข้าสู่ระบบ (ดีไซน์เดียวกับเว็บเช่าเรือ) |
| **ทุกคน (ล็อกอิน)** | `/account` | โปรไฟล์ของฉัน: แก้ชื่อบัญชี (อีเมลแก้ไม่ได้) + เบอร์ติดต่อสูงสุด 3 เบอร์ — ปุ่มบันทึกเดียวกัน ส่งเฉพาะส่วนที่เปลี่ยน (ตรวจตอนกดบันทึก แจ้งเป็นกล่องเตือน) — ยังไม่เปิดให้เปลี่ยนรหัสผ่าน — ลิงก์จากชื่อในแถบบัญชี |
| **ลูกค้า** | `/bookings` | การจองของฉัน — ทริปที่กำลังจะถึง และที่ผ่านมา / ยกเลิก, ยกเลิกคำขอที่ยังรอยืนยันเองได้ (ต้องล็อกอิน) |
| **เจ้าของเรือ** | `/owner`, `/owner/bookings`, `/owner/boats` (+ `/[id]`), `/owner/boat-requests` (+ `/new`), `/owner/profile` | แดชบอร์ดเจ้าของเรือแบบมี sidebar (เหมือน admin): ภาพรวม, คำขอจอง, เรือของฉัน (เปิด/ปิด + วันปิด), คำขอเพิ่มเรือ, ข้อมูลส่วนตัว — สมัคร 2 ขั้น (อนุมัติตัวบุคคล → ขอเพิ่มเรือรายลำ), แก้ข้อมูลเรือ / ราคาไม่ได้ |
| **แอดมิน** | `/admin`, `/admin/bookings`, `/admin/owners` (+ `/history`), `/admin/boat-requests`, `/admin/boats` (+ `/new`, `/[id]`) | แดชบอร์ดผู้ดูแลแบบมี sidebar แยกหัวข้อ: ภาพรวม, คำขอจอง, ผู้สมัครเจ้าของเรือ (ขั้นที่ 1), คำขอเพิ่มเรือ (ขั้นที่ 2), เรือ (เพิ่ม / แก้ไข / เปิด-ปิด / วันปิด, คอลัมน์เจ้าของแสดงชื่อที่ลงทะเบียน) — เฉพาะ `role = admin` |

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
│   │   ├── _components/bookings-section.tsx  # ตารางคำขอจอง + แท็บสถานะ + loadBookingRows(tab, scope) — ใช้ทั้ง /admin/bookings และ /owner
│   │   ├── _components/booking-actions.tsx   # (Client) ยืนยัน / ยกเลิกคำขอจอง 2 จังหวะ → PATCH /api/bookings/[id]
│   │   ├── _components/section-sidebar.tsx   # (Client) SectionSidebar (เมนูหัวข้อ + ป้ายตัวเลขงานที่รอ) + SidebarShell — ใช้ทั้ง /admin และ /owner
│   │   ├── page.tsx                # /  — hero, ฟอร์มค้นหา (GET → /boats), แพ็กเกจทริป (ราคาเริ่มต้นจาก DB), เรือแนะนำ 3 ลำ, วิธีจอง, ท่าเรือ (นับเรือจาก DB), CTA, footer
│   │   ├── boats/page.tsx          # /boats — รายการเรือ กรองด้วย ?port= &trip= &guests= &amenity= (ซ้ำได้) &date=
│   │   ├── boats/filters.tsx       # (Client) slider จำนวนคน + checkbox สิ่งอำนวยความสะดวก → เขียนลง URL
│   │   ├── boats/[id]/page.tsx     # /boats/[id] — ข้อมูลเรือ + วันที่ถูกจองแล้วใน 14 วันข้างหน้า
│   │   ├── boats/[id]/booking-form.tsx  # (Client) เลือกทริป / วัน / จำนวนคน / บริการเสริม + สรุปราคา → POST /api/bookings
│   │   ├── login/                  # page.tsx (Server: AuthShell, อ่าน ?callbackUrl= ?error= ?registered=) + login-form.tsx (Client: signIn)
│   │   ├── register/               # page.tsx (Server: AuthShell) + register-form.tsx (Client: POST /api/auth/register → /login?registered=1)
│   │   ├── account/                # /account — page.tsx + account-forms.tsx (Client: AccountForm)
│   │   ├── bookings/page.tsx       # /bookings — การจองของฉัน (ไม่ล็อกอิน → /login?callbackUrl=/bookings) กรองด้วย userId ของ session
│   │   ├── owner/                  # เจ้าของเรือ — layout.tsx: หัวเว็บ + sidebar (เฉพาะผ่านการอนุมัติตัวบุคคลแล้ว), guard.ts: ownerContext() / approvedOwnerContext()
│   │   │                           #   page.tsx (/owner: ยังไม่ผ่าน = สถานะใบสมัคร, ผ่านแล้ว = ภาพรวม), bookings/, boats/ (+ [id]: วันปิด + เปิด/ปิด, ไม่ใช่เจ้าของ = 404),
│   │   │                           #   boat-requests/ (+ new/: ฟอร์มขอเพิ่มเรือ), profile/ (ข้อมูลส่วนตัว = ใบสมัคร)
│   │   └── admin/                  # หน้าผู้ดูแล — layout.tsx: หัวเว็บ + sidebar หัวข้อ (SectionSidebar: ไฮไลต์หน้าปัจจุบัน + ตัวเลขงานที่รอ)
│   │       │                       #   ทุกหน้าเรียก adminSession() ใน guard.tsx (ไม่ล็อกอิน → /login?callbackUrl=<หน้านั้น>, ไม่ใช่ admin → <NotAdmin />)
│   │       ├── page.tsx            # /admin — ภาพรวม: ตัวเลขสรุป + งานที่รอดำเนินการ
│   │       ├── bookings/           # /admin/bookings — ตารางคำขอจองทุกเรือ กรอง ?status=
│   │       ├── owners/             # /admin/owners — ผู้สมัครเจ้าของเรือรออนุมัติตัวบุคคล (ขั้นที่ 1)
│   │       ├── boat-requests/      # /admin/boat-requests — คำขอเพิ่มเรือรออนุมัติรายลำ (ขั้นที่ 2)
│   │       ├── application-actions.tsx  # (Client) อนุมัติ (ยืนยันอีกครั้ง) / ไม่อนุมัติ (ต้องพิมพ์เหตุผล)
│   │       ├── request-kind.tsx    # ป้าย + คำอธิบายสีประเภทคำขอ (REQUEST_KIND ใน styles.ts: สร้างใหม่ = เขียว, แก้ไข = ส้ม, ส่งใหม่ = ฟ้า)
│   │       └── boats/              # /admin/boats (ตารางเรือ), new/ (เพิ่ม), [id]/ (แก้ไข + วันปิด + เปิด/ปิด)
│   │                               #   + boat-form.tsx (Client, ใช้ทั้ง admin และ mode="apply"), closures.tsx, active-toggle.tsx
│   │
│   ├── components/                 # ของเดิมจากธีมหลังบ้าน — ตอนนี้ไม่มีหน้าไหน import
│   │   ├── navbar.tsx              # Navbar (async Server Component) — sign in / sign out + theme toggle
│   │   └── theme-toggle.tsx        # (Client) สลับ light/dark
│   │
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth handler
│   │   ├── auth/register/          # POST /api/auth/register
│   │   ├── account/                # PATCH /api/account (แก้ชื่อ — sync ชื่อเจ้าของเรือ), PUT /api/account/phones
│   │   ├── bookings/               # POST /api/bookings — route.ts + validate.ts (คำนวณราคาใหม่ที่ server)
│   │   ├── bookings/[id]/          # PATCH /api/bookings/[id] — admin / เจ้าของเรือ (เฉพาะเรือตัวเอง) เปลี่ยนสถานะ, ลูกค้ายกเลิกคำขอ pending ของตัวเอง
│   │   ├── owner-applications/     # POST (ผู้ใช้สมัคร — ต้องมีข้อมูลส่วนตัวก่อน), PATCH [id] { action: approve | reject } (admin)
│   │   ├── owner-profiles/[userId] # PATCH { action: approve | reject } — admin อนุมัติตัวบุคคล (ขั้นที่ 1) → role owner
│   │   ├── owner-profile/          # PUT — บันทึก / แก้ไขข้อมูลส่วนตัวของตัวเอง (upsert) + validate.ts
│   │   └── boats/                  # POST /api/boats, PATCH /api/boats/[id] (admin), PATCH /api/boats/[id]/active (admin / เจ้าของ),
│   │                               #   POST /api/boats/[id]/closures, DELETE /api/boats/[id]/closures/[closureId] (admin เท่านั้น)
│   │
│   ├── lib/
│   │   ├── boats.ts                # ข้อมูลคงที่ (TRIPS, PORTS, AMENITIES, ADDONS, INCLUDED) + quote() คำนวณราคา + helper วันที่เวลาไทย
│   │   ├── search.ts               # firstParam() อ่าน searchParams, containsPattern() สำหรับ ILIKE
│   │   ├── redirect.ts             # safeCallbackUrl() — รับเฉพาะ path ในเว็บ กัน open redirect
│   │   └── admin.ts                # getAccount() / getRole() (อ่านชื่อ-role ล่าสุดจาก DB, cache ต่อ request) / isAdmin() / canManageBoat() = admin หรือ boats.owner_id = ผู้ใช้ / ownedBoatIds() subquery
│   │
│   └── db/
│       ├── index.ts                # Drizzle client (neon-http)
│       └── schema.ts               # users, boats, bookings
│
├── drizzle/                        # SQL migrations 0000–0017
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
| phones | text[] | Required, default `{}` — เบอร์ติดต่อ 0–3 เบอร์ (แก้ที่ `/account`) admin / เจ้าของเรือเห็นในตารางคำขอจอง |
| role | enum `user_role` | `user` (default) / `admin` / `owner` — `owner` ใช้แค่แสดงเมนู สิทธิ์จริงเช็คจาก `boats.owner_id` |
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
| ownerId | text | Nullable (`owner_id`) — FK → `users.id` (ON DELETE SET NULL) เจ้าของเรือ ตั้งผ่านการอนุมัติคำขอเท่านั้น |
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

### `owner_applications` — คำขอเป็นเจ้าของเรือ
| Column | Type | Note |
|--------|------|------|
| id | text (UUID) | Primary Key |
| userId | text | FK → `users.id` (ON DELETE CASCADE) ผู้สมัคร |
| boatData | jsonb | ข้อมูลเรือที่ผู้สมัครกรอก (ผ่าน `parseBoatBody` เดียวกับ admin) |
| boatId | text | Nullable — FK → `boats.id` (ON DELETE SET NULL) เรือที่ระบบสร้างตอนอนุมัติ |
| phone | text | Required — ใช้ยืนยันตัวตนก่อนอนุมัติ |
| note | text | Nullable |
| status | enum `owner_application_status` | `pending` (default) / `approved` / `rejected` |
| rejectReason | text | Nullable — เหตุผลที่ไม่อนุมัติ แสดงในหน้า `/owner/boat-requests` |
| createdAt / decidedAt | timestamp | decidedAt = เวลาที่อนุมัติ / ปฏิเสธ |

- ผู้ใช้หนึ่งคนมีคำขอที่รออนุมัติพร้อมกันได้ไม่เกิน 3 รายการ (เช็คใน API)

### `owner_profiles` — ข้อมูลส่วนตัวเจ้าของเรือ
| Column | Type | Note |
|--------|------|------|
| userId | text | Primary Key — FK → `users.id` (ON DELETE CASCADE) หนึ่งแถวต่อผู้ใช้ |
| fullName | text | Required — ชื่อที่ลงทะเบียน (`users.name`) server ใส่ให้ตอนบันทึก ไม่รับจาก client |
| phone | text | Required |
| address | text | Required |
| contactEmail | text | Nullable — อีเมลติดต่อ (อาจไม่ใช่อีเมลล็อกอิน) |
| updatedAt | timestamp | Auto |

| status | enum `owner_profile_status` | `pending` (default) / `approved` / `rejected` — ขั้นที่ 1 อนุมัติตัวบุคคล |
| requestType | enum `owner_profile_request` | `new` / `edit` (แก้หลังอนุมัติ) / `resubmit` (ส่งใหม่หลังถูกปฏิเสธ) — admin เห็นเป็นสีต่างกัน |
| approvedData | jsonb | Nullable — ชื่อ / เบอร์ / ที่อยู่ชุดที่อนุมัติล่าสุด |
| pendingData | jsonb | Nullable — `{ phone, address, contactEmail }` ที่เจ้าของเรือ (อนุมัติแล้ว) ขอแก้ รอ admin อนุมัติ — admin เห็นเป็น "ข้อมูลที่ใช้อยู่ → ค่าที่ขอแก้" |
| rejectReason | text | Nullable — เหตุผลที่ไม่อนุมัติครั้งล่าสุด (บังคับใส่ตอนไม่อนุมัติ, ล้างเมื่ออนุมัติ) แสดงให้ผู้สมัคร + admin เห็นตอนส่งใหม่ |
| decidedAt | timestamp | Nullable — เวลาที่ admin ตัดสิน |

- แถวนี้ = ใบสมัครเป็นเจ้าของเรือ: บันทึกครั้งแรก / หลังถูกปฏิเสธ → `pending`; อนุมัติแล้วแก้เบอร์ / ที่อยู่ / อีเมลติดต่อ → เก็บใน `pending_data` รอ admin อนุมัติก่อน (สถานะยัง `approved` ใช้ข้อมูลเดิมจนกว่าจะอนุมัติ, ไม่อนุมัติ = ทิ้งคำขอ) มีคำขอค้างอยู่ส่งใหม่ไม่ได้ (หน้า `/owner/profile` ซ่อนฟอร์ม แสดงค่าที่ขอแก้ + ปุ่มยกเลิก) — รอ admin ตัดสิน หรือกดยกเลิกคำขอ (`DELETE /api/owner-profile`) แล้วส่งใหม่ — ชื่อ = ชื่อบัญชี เปลี่ยนที่ `/account` ได้ทันที ไม่ต้องตรวจ
- ประวัติ: ตอน admin อนุมัติ / ไม่อนุมัติ หรือเจ้าของเรือยกเลิก บันทึกลง `owner_profile_edits` (`closeOwnerEdit` ใน `app/lib/owner-edits.ts`) ดูที่ `/admin/owners/history`
- `/admin/owners` + ตัวเลขในเมนู = `status = pending` หรือ (`approved` และมี `pending_data`) (`OWNER_REVIEW_WHERE` ใน `app/lib/admin.ts`)
- admin สมัครเป็นเจ้าของเรือไม่ได้ — `PUT /api/owner-profile` และ `POST /api/owner-applications` ตอบ 403, หน้าใต้ `/owner` แสดงข้อความแจ้ง + ลิงก์ไป `/admin/boats`
- ส่งคำขอเพิ่มเรือได้เฉพาะ `status = approved` — `POST /api/owner-applications` ตอบ 409 ถ้ายังไม่มีหรือยังไม่อนุมัติ และคัดลอก `phone` ไปเก็บในคำขอ ณ ตอนส่ง

### `owner_profile_edits` — ประวัติคำขอแก้ข้อมูลเจ้าของเรือ
| Field | Type | หมายเหตุ |
|-------|------|----------|
| id | text (UUID) | Primary Key |
| userId | text | FK → `users.id` (cascade) — เจ้าของเรือ |
| before / requested | jsonb | `{ phone, address, contactEmail }` ข้อมูลที่ใช้อยู่ตอนขอแก้ / ค่าที่ขอแก้ |
| status | enum `owner_profile_edit_status` | `approved` / `rejected` / `cancelled` (เจ้าของเรือยกเลิกเอง) |
| rejectReason | text | Nullable — เหตุผลที่ไม่อนุมัติ |
| decidedBy | text | Nullable — FK → `users.id` (set null) admin ที่ตัดสิน (null = ยกเลิกเอง) |
| submittedAt / decidedAt | timestamp | เวลาส่งคำขอ / เวลาตัดสิน |

- บันทึกเฉพาะคำขอที่ปิดแล้ว (คำขอที่รอตรวจอยู่ใน `owner_profiles.pending_data`) — insert หลัง UPDATE สำเร็จ (ไม่มี transaction: insert พลาด = ตัดสินแล้วแต่ไม่มีในประวัติ)

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
| `0011` | role `owner`, `boats.owner_id`, ตาราง `owner_applications` |
| `0019` | ตาราง `owner_profile_edits` (ประวัติคำขอแก้ข้อมูลเจ้าของเรือที่ตัดสินแล้ว) |
| `0018` | `owner_profiles.pending_data` (คำขอแก้ข้อมูลหลังอนุมัติ — รออนุมัติก่อนมีผล) |
| `0017` | `users.phones` (เบอร์ติดต่อสูงสุด 3 เบอร์) |
| `0016` | `reject_reason` ใน `owner_profiles` และ `owner_applications` |
| `0015` | `owner_profiles.request_type` + `approved_data` (backfill จากใบที่อนุมัติแล้ว) |
| `0014` | `owner_profiles.status` / `decided_at` (อนุมัติตัวบุคคล) |
| `0013` | ตาราง `owner_profiles` (ข้อมูลส่วนตัวเจ้าของเรือ) |
| `0012` | `owner_applications`: เพิ่ม `boat_data` (jsonb), `boat_id` เป็น nullable, ลบ unique index เดิม — สมัครด้วยข้อมูลเรือแทนการเลือกเรือที่มี |

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
- SiteNav แสดงลิงก์ "การจองของฉัน" เมื่อล็อกอิน, "สมัครเป็นเจ้าของเรือ" (→ `/owner`) เมื่อ `role = user`, "แดชบอร์ดเจ้าของเรือ" เมื่อ `role = owner` และ "แอดมิน" เมื่อ `role = admin`
- **เจ้าของเรือ — อนุมัติ 2 ขั้น:**
  1. **ตัวบุคคล:** ผู้ใช้กรอกข้อมูลส่วนตัวที่ `/owner/profile` (เบอร์โทร, ที่อยู่, อีเมลติดต่อถ้ามี — ชื่อใช้ชื่อที่ลงทะเบียน แก้ในฟอร์มไม่ได้) → admin อนุมัติในส่วน "ผู้สมัครเป็นเจ้าของเรือ" ที่ `/admin` → `owner_profiles.status = approved`, role `user` → `owner` (admin ไม่ถูกลดสิทธิ์)
  2. **เรือรายลำ:** เจ้าของที่ผ่านขั้นที่ 1 ส่งข้อมูลเรือที่ `/owner/boat-requests/new` (`BoatForm mode="apply"` — ส่งแล้วกลับหน้ารายการ `/owner/boat-requests`) → admin อนุมัติในส่วน "คำขอเพิ่มเรือ" → ระบบสร้างเรือโดย `owner_id` = ผู้ส่ง (อนุมัติเรือไม่ได้ถ้าผู้ส่งยังไม่ผ่านขั้นที่ 1)
  - `/owner` = แดชบอร์ด: ยังไม่ผ่านขั้นที่ 1 แสดงสถานะใบสมัคร (ยังไม่สมัคร / รอตรวจ / ไม่ผ่าน) ไม่มี sidebar; ผ่านแล้วมี sidebar หัวข้อ ภาพรวม / คำขอจอง / เรือของฉัน / คำขอเพิ่มเรือ / ข้อมูลส่วนตัว (หน้าที่ต้องผ่านการอนุมัติจะส่งกลับ `/owner` ถ้ายังไม่ผ่าน)
  - สิทธิ์กับเรือทุกจุดเช็คจาก `boats.owner_id` ไม่ใช่ role (ไม่มีปุ่มถอดเจ้าของในหน้าเว็บ — ต้องแก้ `boats.owner_id` ใน DB)
  - เจ้าของเห็นชื่อ / อีเมลลูกค้าที่จองเรือตัวเอง — admin ควรยืนยันตัวตนจากเบอร์โทรก่อนอนุมัติ
  - เจ้าของแก้ข้อมูลเรือ / ราคา / เพิ่มเรือไม่ได้ (admin เท่านั้น)
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
