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
| `dayGrow` | text | NOT NULL | — |
| `createdAt` | timestamp | NOT NULL | `now()` |

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
