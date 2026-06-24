# วิธีเพิ่มหน้าที่ต้องล็อกอินก่อนเข้า

คู่มือนี้แสดงวิธีสร้างหน้าใหม่ที่เฉพาะผู้ใช้ที่ล็อกอินแล้วเท่านั้นเข้าได้ ผู้ใช้ที่ยังไม่ล็อกอินจะถูก redirect ไปที่ `/login`

**เงื่อนไขเบื้องต้น:** โปรเจครันอยู่ใน local และมีผู้ใช้ที่สมัครแล้วอย่างน้อยหนึ่งคน

---

## ขั้นตอน

### 1. สร้างไฟล์หน้า

สร้างไฟล์ `app/dashboard/page.tsx`:

```tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <p>ยินดีต้อนรับ, {session.user?.name}</p>
    </main>
  )
}
```

### 2. ทดสอบว่า redirect ทำงาน

1. เปิดหน้าต่าง incognito
2. เข้า `http://localhost:3000/dashboard`
3. ควรถูก redirect ไปที่ `/login`

### 3. ทดสอบว่าเข้าได้เมื่อล็อกอินแล้ว

1. ล็อกอินด้วยบัญชีที่มีอยู่
2. เข้า `http://localhost:3000/dashboard`
3. ควรเห็นข้อความต้อนรับ

---

## ป้องกันหลายหน้าพร้อมกันด้วย proxy

ถ้ามีหลายหน้าที่ต้องป้องกัน เพิ่ม path เข้าไปใน `proxy.ts` ที่ root ของโปรเจค (Next.js 16 เปลี่ยนชื่อจาก `middleware.ts` เป็น `proxy.ts`)

เปิดไฟล์ `proxy.ts` แล้วเพิ่ม path ใน `matcher` และใน if-condition:

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIES = ['authjs.session-token', '__Secure-authjs.session-token']

function hasSession(request: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => request.cookies.has(name))
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthenticated = hasSession(request)

  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // เพิ่ม path ใหม่ที่ต้องการป้องกันที่นี่
  if (!isAuthenticated && (pathname.startsWith('/dashboard') || pathname.startsWith('/settings'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // เพิ่ม path ใหม่ใน matcher ด้วย
  matcher: ['/dashboard/:path*', '/settings/:path*', '/login', '/register'],
}
```

proxy ทำหน้าที่ตรวจ session cookie อย่างรวดเร็วที่ edge — ส่วนการ validate JWT จริงยังต้องทำใน Server Component แต่ละหน้า (ดูขั้นตอนที่ 1)
