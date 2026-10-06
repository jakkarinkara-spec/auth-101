# อ้างอิง API

## Endpoints สำหรับ authentication

endpoints เหล่านี้จัดการโดย NextAuth และ registration route ที่สร้างเอง

---

### `POST /api/auth/register`

สร้างบัญชีผู้ใช้ใหม่

**Request body**

| Field | Type | จำเป็น | คำอธิบาย |
|-------|------|--------|----------|
| `name` | string | ไม่ | ชื่อที่แสดง |
| `email` | string | ใช่ | ต้องไม่ซ้ำกับที่มีอยู่ |
| `password` | string | ใช่ | เก็บเป็น bcrypt hash (10 rounds) |

**Responses**

| Status | เงื่อนไข |
|--------|----------|
| `201 Created` | สร้างผู้ใช้สำเร็จ |
| `400 Bad Request` | ไม่มี `email` หรือ `password` |
| `409 Conflict` | อีเมลนี้ถูกลงทะเบียนแล้ว |

**ตัวอย่าง request**

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "สมชาย",
  "email": "somchai@example.com",
  "password": "secretpassword"
}
```

---

### `POST /api/auth/signin`

ยืนยันตัวตนผู้ใช้ด้วย credentials จัดการโดย NextAuth

**Request body**

| Field | Type | จำเป็น |
|-------|------|--------|
| `email` | string | ใช่ |
| `password` | string | ใช่ |
| `callbackUrl` | string | ไม่ |

เมื่อสำเร็จ จะตั้งค่า JWT session cookie และ redirect ไปที่ `callbackUrl` (หน้า `/login` ส่งค่าจาก `?callbackUrl=` ถ้าเป็น path ในเว็บ ไม่งั้นใช้ `/`)
เมื่อล้มเหลว จะ redirect ไปที่ `/login?error=CredentialsSignin`

---

### `GET /api/auth/signout`
### `POST /api/auth/signout`

ลบ session cookie และ redirect ไปที่ `/login`

---

### `GET /api/auth/session`

คืนค่า session ปัจจุบันเป็น JSON

**Response (ล็อกอินแล้ว)**

```json
{
  "user": {
    "name": "สมชาย",
    "email": "somchai@example.com",
    "image": null
  },
  "expires": "2026-07-19T00:00:00.000Z"
}
```

**Response (ยังไม่ได้ล็อกอิน)**

```json
null
```

---

## Endpoints สำหรับจองเรือ (Bookings)

---

### `POST /api/bookings`

ส่งคำขอจองเรือ ต้องล็อกอินก่อน (ตรวจ session ด้วย `auth()` ใน route handler) — `userId` ตั้งเป็น user ที่ล็อกอิน ราคา (`total`, `deposit`) **คำนวณใหม่ที่ server** จากราคาเรือในตาราง `boats` และ `ADDONS` ใน `app/lib/boats.ts` ไม่รับจาก client สถานะเริ่มต้นเป็น `pending` (ยังไม่มีระบบชำระเงินจริง)

**Request body**

| Field | Type | จำเป็น | คำอธิบาย |
|-------|------|--------|----------|
| `boatId` | string | ใช่ | `id` ของเรือ |
| `tripType` | string | ใช่ | `half` / `full` / `night` — เรือต้องมีราคาของทริปนั้น (ไม่เป็น null) |
| `tripDate` | string | ใช่ | `YYYY-MM-DD` ตั้งแต่พรุ่งนี้ (เวลาไทย) ถึง 60 วันข้างหน้า — จองได้ครั้งละหนึ่งวัน |
| `guests` | integer | ใช่ | 1 ถึง `boats.seats` |
| `addons` | string[] | ไม่ | id ของบริการเสริม: `gear` (฿500/คน), `lunch` (฿250/คน), `photo` (฿1,500/ทริป) |

**Responses**

| Status | เงื่อนไข |
|--------|----------|
| `201 Created` | สร้างสำเร็จ — คืน row ที่สร้าง |
| `400 Bad Request` | field ไม่ถูกต้อง, วันที่อยู่นอกช่วง, จำนวนคนเกิน, add-on ไม่รู้จัก หรือเรือไม่รับทริปประเภทนั้น |
| `401 Unauthorized` | ยังไม่ได้ล็อกอิน |
| `404 Not Found` | ไม่มีเรือที่ `boatId` นี้ |
| `409 Conflict` | เรือลำนี้มีคนจองวันนั้นแล้ว (unique index `bookings_boat_date_active`), เรือปิดรับจอง (`boats.active = false`) หรือ admin ปิดรับจองวันนั้น (`boat_closures`) |

UI อยู่ที่ `/boats/[id]` — ถ้ายังไม่ล็อกอิน ปุ่มจองจะพาไป `/login?callbackUrl=/boats/[id]`

### `PATCH /api/bookings/[id]`

เปลี่ยนสถานะคำขอจอง — ต้องล็อกอิน (ตรวจ `auth()` แล้ว `isAdmin()` อ่าน `users.role` จาก DB)

**Request body**: `{ "status": "confirmed" | "cancelled" }`

การเปลี่ยนที่อนุญาต (เช็คเจ้าของ + สถานะเดิมใน `WHERE` ของ UPDATE เดียว):

| ผู้เรียก | เป้าหมาย | เงื่อนไข |
|----------|----------|----------|
| admin | `confirmed` | รายการใดก็ได้ที่เป็น `pending` |
| admin | `cancelled` | รายการใดก็ได้ที่เป็น `pending` หรือ `confirmed` |
| ลูกค้า | `cancelled` | เฉพาะรายการของตัวเอง (`userId` = session) ที่ยังเป็น `pending` |

รายการที่ `cancelled` แล้วเปลี่ยนกลับไม่ได้ — วันนั้นถูกปล่อยว่างแล้ว (unique index ไม่นับรายการที่ยกเลิก) อาจมีคนอื่นจองไปแล้ว

| Status | เงื่อนไข |
|--------|----------|
| `200 OK` | สำเร็จ — คืน row ที่แก้แล้ว |
| `400 Bad Request` | `status` ไม่ใช่ `confirmed` / `cancelled` |
| `401 Unauthorized` | ยังไม่ได้ล็อกอิน |
| `403 Forbidden` | ไม่ใช่ admin แต่ส่ง `status: "confirmed"` |
| `404 Not Found` | ไม่มีคำขอจองที่ `id` นี้ หรือ (ลูกค้า) เป็นรายการของคนอื่น — ตอบเหมือนกันเพื่อไม่บอกว่ามีอยู่ |
| `409 Conflict` | สถานะปัจจุบันเปลี่ยนแบบนั้นไม่ได้ (เช่น ยืนยันรายการที่ยกเลิกแล้ว หรือลูกค้ายกเลิกรายการที่ยืนยันแล้ว) |

UI อยู่ที่ `/admin`

---

## Endpoints สำหรับเรือ (Boats) — admin เท่านั้น

### `POST /api/boats`

เพิ่มเรือ — ตรวจ `auth()` แล้ว `isAdmin()` (อ่าน `users.role` จาก DB)

**Request body**

| Field | Type | จำเป็น | คำอธิบาย |
|-------|------|--------|----------|
| `name`, `kind`, `captain` | string | ใช่ | ชื่อเรือ, ประเภทเรือ, ชื่อกัปตัน (ตัดช่องว่างหัวท้าย) |
| `port` | string | ใช่ | ต้องเป็น id ใน `PORTS` (`สัตหีบ`, `หัวหิน`, `ภูเก็ต`, `เกาะช้าง`) |
| `lengthM` | integer | ใช่ | 1–200 (เมตร) |
| `seats` | integer | ใช่ | 1–100 |
| `description`, `engine`, `equipment` | string | ไม่ | ค่าว่างเก็บเป็น `null` |
| `tags` | string[] | ไม่ | ต้องอยู่ใน `BOAT_TAGS` (`หลังคากันแดด`, `ห้องน้ำ`, `โซนาร์`, `ที่นอน`, `ไฟล่อหมึก`) |
| `priceHalf`, `priceFull`, `priceNight` | integer \| "" \| null | อย่างน้อย 1 | ราคาเหมาลำ (บาท) จำนวนเต็ม > 0 — ว่าง / null = ไม่รับทริปแบบนั้น |

| Status | เงื่อนไข |
|--------|----------|
| `201 Created` | สร้างสำเร็จ — คืน row ที่สร้าง |
| `400 Bad Request` | field ไม่ถูกต้อง หรือไม่มีราคาเลยสักแบบ |
| `401 Unauthorized` | ยังไม่ได้ล็อกอิน |
| `403 Forbidden` | ไม่ใช่ admin |

### `PATCH /api/boats/[id]`

แก้ไขเรือ — body และการตรวจสอบเหมือน `POST /api/boats` (ส่งทุก field มาแทนค่าเดิม) ราคาที่บันทึกไว้ในคำขอจองเดิมไม่เปลี่ยนตาม

| Status | เงื่อนไข |
|--------|----------|
| `200 OK` | แก้ไขสำเร็จ — คืน row ที่แก้แล้ว |
| `400 Bad Request` | เงื่อนไขเดียวกับ `POST` |
| `401 Unauthorized` | ยังไม่ได้ล็อกอิน |
| `403 Forbidden` | ไม่ใช่ admin |
| `404 Not Found` | ไม่มีเรือที่ `id` นี้ |

UI อยู่ที่ `/admin/boats/new` และ `/admin/boats/[id]` (ลิงก์จากตารางเรือในหน้า `/admin`)

> body ของ `POST` / `PATCH /api/boats` ไม่มี `active` — เรือใหม่เปิดรับจองเสมอ และการแก้ไขไม่เปลี่ยนสถานะ ใช้ endpoint ด้านล่างแทน

### `PATCH /api/boats/[id]/active`

เปิด / ปิดรับจอง (admin เท่านั้น) — ใช้แทนการลบเรือ คำขอจองเดิมไม่ถูกแก้หรือยกเลิก

**Request body**: `{ "active": true | false }`

| Status | เงื่อนไข |
|--------|----------|
| `200 OK` | สำเร็จ — คืน `{ id, active }` |
| `400 Bad Request` | `active` ไม่ใช่ boolean |
| `401 Unauthorized` | ยังไม่ได้ล็อกอิน |
| `403 Forbidden` | ไม่ใช่ admin |
| `404 Not Found` | ไม่มีเรือที่ `id` นี้ |

UI: ปุ่ม "ปิดรับจอง" (กดยืนยันอีกครั้ง) / "เปิดรับจอง" ในตารางเรือหน้า `/admin` และหน้าแก้ไขเรือ

### `POST /api/boats/[id]/closures`

ปิดรับจองเป็นรายวัน (admin เท่านั้น) — หนึ่งแถวต่อวันในตาราง `boat_closures` วันที่ปิดอยู่แล้วข้ามไป (ไม่ error)

**Request body**: `{ "from": "YYYY-MM-DD", "to"?: "YYYY-MM-DD", "reason"?: string }` — ไม่ส่ง `to` = ปิดวันเดียว

| Status | เงื่อนไข |
|--------|----------|
| `201 Created` | คืน `{ created, skipped }` (จำนวนวันที่เพิ่มใหม่ / ที่ปิดอยู่แล้ว) |
| `400 Bad Request` | วันที่ไม่ถูกต้อง, ไม่อยู่ในช่วงพรุ่งนี้ถึง 60 วันข้างหน้า, `to` < `from` หรือเกิน 31 วันต่อครั้ง |
| `401` / `403` | ยังไม่ได้ล็อกอิน / ไม่ใช่ admin |
| `404 Not Found` | ไม่มีเรือที่ `id` นี้ |

### `DELETE /api/boats/[id]/closures/[closureId]`

เปิดรับจองวันนั้นกลับ (ลบแถวใน `boat_closures`) — admin เท่านั้น

| Status | เงื่อนไข |
|--------|----------|
| `204 No Content` | ลบสำเร็จ |
| `401` / `403` | ยังไม่ได้ล็อกอิน / ไม่ใช่ admin |
| `404 Not Found` | ไม่มีวันปิดนี้ของเรือลำนี้ |

UI: หัวข้อ "วันปิดรับจอง" ในหน้า `/admin/boats/[id]`

---

## Endpoints สำหรับ Item Maintenance Request (IMR)

endpoint นี้เปิดให้ระบบภายนอกดึงข้อมูลได้โดยตรง ไม่ผูกกับ session ของ NextAuth

---

### `GET /api/imr`

คืนรายการ item maintenance request แบบ paginate พร้อมตัวเลขสรุป

**Query parameters**

| Param | Type | จำเป็น | ค่าเริ่มต้น | คำอธิบาย |
|-------|------|--------|-------------|----------|
| `page` | number | ไม่ | `1` | หน้าที่ต้องการ |
| `limit` | number | ไม่ | `20` | จำนวนรายการต่อหน้า |
| `requesterEmailId` | string | ไม่ | — | ใช้คำนวณ `myRequestCount`; ไม่มี session ผูกกับ user เพราะ endpoint นี้เปิดให้ระบบอื่นเรียกได้โดยตรง ถ้าไม่ส่งมาจะได้ `0` |

**Response** (`200 OK`)

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "imrNumber": "IMR-000001",
        "itemCount": 3,
        "buyerInfo": [{ "buyer_code": "B001", "buyer_name": "บริษัท เอ จำกัด" }],
        "requestedAt": "2026-07-01T00:00:00.000Z",
        "lastUpdatedAt": "2026-07-02T00:00:00.000Z",
        "requestStatus": "PENDING",
        "submittedAsRole": "buyer",
        "requesterEmailId": "someone@example.com",
        "requestedByUserName": "สมชาย"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "pendingMaintenanceRequestCount": 1,
    "processedAndCompletedRequestCount": 0,
    "myRequestCount": 0
  }
}
```

**นิยามตัวเลขสรุป** (ปรับได้ที่ค่าคงที่ด้านบนของ `app/api/imr/route.ts`)

| ฟิลด์ | นิยาม |
|-------|-------|
| `pendingMaintenanceRequestCount` | จำนวนแถวที่ `requestStatus` เป็น `PENDING`, `PROCESSING`, หรือ `REVIEW_REQUESTED` |
| `processedAndCompletedRequestCount` | จำนวนแถวที่ `requestStatus` เป็น `PROCESSING` หรือ `COMPLETED` |
| `myRequestCount` | จำนวนแถวที่ `requesterEmailId` ตรงกับ query param `requesterEmailId` |

---

## Environment variables

| ตัวแปร | จำเป็น | คำอธิบาย |
|--------|--------|----------|
| `DATABASE_URL` | ใช่ | Neon PostgreSQL pooled connection string |
| `AUTH_SECRET` | ใช่ | ค่า hex 64 ตัวอักษรสำหรับ sign JWT tokens |

---

## Database schema

### `users`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | text | PRIMARY KEY | `gen_random_uuid()` |
| `name` | text | nullable | — |
| `email` | text | UNIQUE, NOT NULL | — |
| `password` | text | NOT NULL | — |
| `createdAt` | timestamp | NOT NULL | `now()` |

> ตาราง `crops` และ `plots` (ระบบฟาร์มเดิม) ถูก drop แล้วใน migration `0008`

### `boats`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | text | PRIMARY KEY | `crypto.randomUUID()` |
| `name` | text | NOT NULL | — |
| `port` | text | NOT NULL | — |
| `lengthM` | integer | NOT NULL | — |
| `seats` | integer | NOT NULL | — |
| `kind` | text | NOT NULL | — |
| `captain` | text | NOT NULL | — |
| `description` / `engine` / `equipment` | text | nullable | — |
| `tags` | text[] | NOT NULL | `'{}'` |
| `priceHalf` / `priceFull` / `priceNight` | integer | nullable (null = ไม่รับทริปแบบนั้น) | — |
| `active` | boolean | NOT NULL (false = ปิดรับจอง) | `true` |
| `createdAt` | timestamp | NOT NULL | `now()` |

### `bookings`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | text | PRIMARY KEY | `crypto.randomUUID()` |
| `userId` | text | NOT NULL, FK → `users.id` (ON DELETE CASCADE) | — |
| `boatId` | text | NOT NULL, FK → `boats.id` (ON DELETE CASCADE) | — |
| `tripType` | enum `trip_type` (`half`, `full`, `night`) | NOT NULL | — |
| `tripDate` | date | NOT NULL | — |
| `guests` | integer | NOT NULL | — |
| `addons` | text[] | NOT NULL | `'{}'` |
| `total` / `deposit` | integer | NOT NULL | — |
| `status` | enum `booking_status` (`pending`, `confirmed`, `cancelled`) | NOT NULL | `'pending'` |
| `createdAt` | timestamp | NOT NULL | `now()` |

Unique index `bookings_boat_date_active` บน (`boatId`, `tripDate`) WHERE `status <> 'cancelled'`

### `item_maintenance_requests`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | text | PRIMARY KEY | `crypto.randomUUID()` |
| `imrNumber` | text | UNIQUE, NOT NULL | — |
| `itemCount` | integer | NOT NULL | `0` |
| `buyerInfo` | jsonb (`{ buyer_code, buyer_name }[]`) | nullable | — |
| `requestStatus` | enum `item_maintenance_request_status` | NOT NULL | `PENDING` |
| `submittedAsRole` | text | nullable | — |
| `requesterEmailId` | text | nullable | — |
| `requestedByUserName` | text | nullable | — |
| `submittedAt` | timestamp | nullable | — |
| `lastUpdatedAt` | timestamp | nullable | — |
| `createdAt` | timestamp | NOT NULL | `now()` |

**Enum `item_maintenance_request_status`**: `PENDING` \| `PROCESSING` \| `REVIEW_REQUESTED` \| `COMPLETED` \| `FAILED` \| `REJECTED`

---

## Session

**กลยุทธ์**: JWT (stateless)
**อายุ**: 30 วัน (ค่าเริ่มต้นของ NextAuth)

**ชื่อ cookie** (NextAuth v5 / authjs):

| Cookie | ใช้งานเมื่อ |
|--------|------------|
| `authjs.session-token` | HTTP (development) |
| `__Secure-authjs.session-token` | HTTPS (production) |

เข้าถึง session ได้ฝั่ง server ผ่าน `auth()` จาก `@/auth` และฝั่ง client ผ่าน `useSession()` จาก `next-auth/react`

---

## Route protection — proxy.ts

`proxy.ts` ที่ root ของโปรเจคทำหน้าที่ตรวจสอบ session cookie ก่อน request เข้าถึง Server Component

**ไฟล์**: `proxy.ts` (Next.js 16 — เดิมชื่อ `middleware.ts`)
**ฟังก์ชัน**: `export function proxy` (เดิมชื่อ `middleware`)

**พฤติกรรม**:

| เงื่อนไข | ผลลัพธ์ |
|----------|---------|
| มี session cookie + เข้า `/login` หรือ `/register` | redirect → `/` |
| กรณีอื่นๆ | `NextResponse.next()` |

**matcher ที่ครอบคลุม**: `/login`, `/register` (หน้า `/dashboard` ถูกนำออกแล้ว ตอนนี้ไม่มีหน้าที่ต้องล็อกอินถึงเข้าได้)

> proxy ตรวจแค่ว่า cookie มีอยู่หรือไม่ (fast check) การ validate JWT จริงทำใน Server Component ด้วย `auth()` อีกชั้นหนึ่ง
