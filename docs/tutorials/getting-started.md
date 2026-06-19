# บทเรียน: รันโปรเจค auth-101 และสร้างผู้ใช้คนแรก

ในบทเรียนนี้ เราจะติดตั้งโปรเจค เชื่อมต่อฐานข้อมูล และสร้างบัญชีผู้ใช้ที่ใช้งานได้จริง เมื่อจบบทเรียน คุณจะมีแอปที่รันได้พร้อมระบบ register และ login

## สิ่งที่ต้องมี

- Node.js เวอร์ชัน 20 ขึ้นไป
- บัญชี [Neon](https://neon.tech) (ใช้ฟรีได้)
- Git

---

## ขั้นตอนที่ 1: Clone โปรเจค

```bash
git clone https://github.com/your-username/auth-101.git
cd auth-101
```

## ขั้นตอนที่ 2: ติดตั้ง dependencies

```bash
npm install
```

รอสักครู่ขณะที่แพ็คเกจถูกดาวน์โหลด

## ขั้นตอนที่ 3: สร้างฐานข้อมูล Neon

1. เข้าไปที่ [neon.tech](https://neon.tech) แล้ว sign in
2. คลิก **New Project** ตั้งชื่อว่า `auth-101`
3. หลังสร้างเสร็จ คลิก **Connection string**
4. คัดลอก **pooled connection** URL (ขึ้นต้นด้วย `postgresql://...`)

## ขั้นตอนที่ 4: ตั้งค่า environment variables

สร้างไฟล์ `.env` ที่ root ของโปรเจค:

```bash
cp .env.example .env
```

> ถ้าไม่มี `.env.example` ให้สร้างไฟล์ `.env` ขึ้นมาใหม่เลย

เปิดไฟล์ `.env` แล้วใส่ค่าสองตัวนี้:

```env
DATABASE_URL=postgresql://...   # วาง Neon connection string ที่คัดลอกไว้
AUTH_SECRET=                    # จะสร้างในขั้นตอนถัดไป
```

สร้าง `AUTH_SECRET` ด้วยคำสั่งนี้:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

นำผลลัพธ์ที่ได้ไปวางเป็นค่าของ `AUTH_SECRET`

## ขั้นตอนที่ 5: สร้างตารางในฐานข้อมูล

```bash
npm run db:push
```

จะเห็น output ประมาณนี้:

```
[✓] Changes applied
```

คำสั่งนี้สร้างตาราง `users` ใน Neon database ของคุณ

## ขั้นตอนที่ 6: เริ่มต้น development server

```bash
npm run dev
```

จะเห็น:

```
▲ Next.js 16.x.x
- Local: http://localhost:3000
```

## ขั้นตอนที่ 7: สมัครสมาชิกคนแรก

1. เปิด [http://localhost:3000/register](http://localhost:3000/register) ในเบราว์เซอร์
2. กรอก **ชื่อ**, **อีเมล** และ **รหัสผ่าน**
3. คลิก **Register**
4. ระบบจะพาไปที่หน้า login

## ขั้นตอนที่ 8: เข้าสู่ระบบ

1. กรอกอีเมลและรหัสผ่านที่เพิ่งสมัครไว้
2. คลิก **Log in**
3. ระบบจะพาไปที่ `/dashboard`

คุณจะเห็นหน้า 404 ซึ่งเป็นเรื่องปกติ เพราะหน้า dashboard ยังไม่ได้สร้าง แต่การ authentication ทำงานสำเร็จแล้ว

---

คุณติดตั้งโปรเจค เชื่อมฐานข้อมูลจริง และทดสอบ register + login ครบวงจรสำเร็จแล้ว ขั้นตอนต่อไปดูได้ที่ [วิธีเพิ่มหน้า protected](../how-to/add-protected-page.md)
