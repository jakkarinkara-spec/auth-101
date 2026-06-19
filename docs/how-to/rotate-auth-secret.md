# วิธี rotate AUTH_SECRET

ควร rotate secret เมื่อมีความเสี่ยงว่า secret อาจถูกเปิดเผย หรือเป็นส่วนหนึ่งของการรักษาความปลอดภัยตามกำหนดเวลา การ rotate จะทำให้ session ทั้งหมดที่มีอยู่หมดอายุ — ผู้ใช้ทุกคนจะต้องล็อกอินใหม่

**เงื่อนไขเบื้องต้น:** มีสิทธิ์เข้าถึงการตั้งค่า environment ของ production

---

## ขั้นตอน

### 1. สร้าง secret ใหม่

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. อัปเดต environment variable

**Local development** — แก้ไขไฟล์ `.env`:

```env
AUTH_SECRET=<ค่าใหม่>
```

**Production** — อัปเดต secret ใน environment settings ของ hosting provider (Vercel, Railway ฯลฯ) แล้ว redeploy

### 3. รีสตาร์ท server

```bash
# development
npm run dev

# production — trigger redeploy ผ่าน CI/CD pipeline หรือ provider dashboard
```

### 4. ตรวจสอบว่า session เก่าถูกยกเลิกแล้ว

เปิดหน้าต่าง incognito แล้วเข้าหน้าที่ต้องล็อกอิน ควรถูก redirect ไปที่ `/login` ซึ่งยืนยันว่า session เก่าใช้งานไม่ได้แล้ว

---

ผู้ใช้ทุกคนถูก logout แล้ว พวกเขาสามารถล็อกอินใหม่ได้ด้วยอีเมลและรหัสผ่านเดิม ข้อมูลบัญชีไม่มีการสูญหาย
