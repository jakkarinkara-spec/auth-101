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

เมื่อสำเร็จ จะตั้งค่า JWT session cookie และ redirect ไปที่ `callbackUrl` (ค่าเริ่มต้น: `/dashboard`)
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

## Endpoints สำหรับ Crops

---

### `POST /api/crops`

สร้าง crop ใหม่ ต้องล็อกอินก่อน (ตรวจ session ด้วย `auth()` ใน route handler)

**Request body**

| Field | Type | จำเป็น | คำอธิบาย |
|-------|------|--------|----------|
| `name` | string | ไม่ | ชื่อพืช — ค่าว่างจะเก็บเป็น `null` |
| `dayGrow` | integer | ใช่ | จำนวนวันที่ใช้ปลูก ต้องเป็นจำนวนเต็ม 1–2147483647 |

**Responses**

| Status | เงื่อนไข |
|--------|----------|
| `201 Created` | สร้างสำเร็จ — คืน row ที่สร้าง (`id`, `name`, `dayGrow`, `createdAt`) |
| `400 Bad Request` | `dayGrow` ไม่ใช่จำนวนเต็มบวก |
| `401 Unauthorized` | ยังไม่ได้ล็อกอิน |

UI สำหรับสร้างและดูรายการอยู่ที่ `/dashboard/crops`

---

## Endpoints สำหรับแปลงปลูก (Plots)

---

### `POST /api/plots`

สร้างแปลงปลูกใหม่ ต้องล็อกอินก่อน (ตรวจ session ด้วย `auth()` ใน route handler)

**Request body**

| Field | Type | จำเป็น | คำอธิบาย |
|-------|------|--------|----------|
| `name` | string | ใช่ | ชื่อแปลง |
| `areaRai` | string/number | ไม่ | ขนาดแปลง (ไร่) มากกว่า 0 ปัดเป็นทศนิยม 2 ตำแหน่ง |
| `location` | string | ไม่ | ที่ตั้งแปลง |
| `cropId` | string | ไม่ | `id` ของ crop ที่มีอยู่จริง |
| `plantedAt` | string | ไม่ | วันที่ปลูก รูปแบบ `YYYY-MM-DD` |

ค่าว่างของ field ที่ไม่บังคับจะเก็บเป็น `null`

**Responses**

| Status | เงื่อนไข |
|--------|----------|
| `201 Created` | สร้างสำเร็จ — คืน row ที่สร้าง |
| `400 Bad Request` | ไม่มี `name`, `areaRai` ไม่ถูกต้อง, `plantedAt` ไม่ใช่วันที่ หรือ `cropId` ไม่มีอยู่จริง |
| `401 Unauthorized` | ยังไม่ได้ล็อกอิน |

UI สำหรับสร้างและดูรายการอยู่ที่ `/dashboard/plots` (แสดงวันเก็บเกี่ยวโดยประมาณ = `plantedAt` + `crops.dayGrow`)

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

### `crops`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | text | PRIMARY KEY | `gen_random_uuid()` |
| `name` | text | nullable | — |
| `dayGrow` | integer | NOT NULL | — |
| `createdAt` | timestamp | NOT NULL | `now()` |

### `plots`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | text | PRIMARY KEY | `crypto.randomUUID()` |
| `name` | text | NOT NULL | — |
| `areaRai` | numeric(10,2) | nullable | — |
| `location` | text | nullable | — |
| `cropId` | text | nullable, FK → `crops.id` (ON DELETE SET NULL) | — |
| `plantedAt` | date | nullable | — |
| `createdAt` | timestamp | NOT NULL | `now()` |

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
| มี session cookie + เข้า `/login` หรือ `/register` | redirect → `/dashboard` |
| ไม่มี session cookie + เข้า `/dashboard/*` | redirect → `/login` |
| กรณีอื่นๆ | `NextResponse.next()` |

**matcher ที่ครอบคลุม**: `/dashboard/:path*`, `/login`, `/register`

> proxy ตรวจแค่ว่า cookie มีอยู่หรือไม่ (fast check) การ validate JWT จริงทำใน Server Component ด้วย `auth()` อีกชั้นหนึ่ง
