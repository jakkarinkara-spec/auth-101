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

## ป้องกันหลายหน้าพร้อมกันด้วย middleware

ถ้ามีหลายหน้าที่ต้องป้องกัน ใช้ middleware แทนการเพิ่ม `auth()` ในแต่ละหน้า

สร้างไฟล์ `middleware.ts` ที่ root ของโปรเจค:

```ts
export { auth as middleware } from '@/auth'

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*'],
}
```

middleware นี้จะ redirect ผู้ใช้ที่ยังไม่ล็อกอินสำหรับทุก path ที่ตรงกับ `matcher` โดยไม่ต้องแก้ไขแต่ละหน้า

ปลายทางของ redirect คือ `pages.signIn` ใน `auth.ts` ซึ่งในโปรเจคนี้ตั้งไว้ที่ `/login` อยู่แล้ว
