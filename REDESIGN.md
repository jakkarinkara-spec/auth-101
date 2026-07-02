# UI/UX Redesign — Auth 101

## Design System

**Style:** Glassmorphism Dark Mode  
**Primary accent:** Indigo → Violet gradient  
**Background:** `#030712` (deep navy-black) with decorative gradient orbs  
**Cards:** `backdrop-blur-xl bg-white/[0.04] border border-white/10`  
**Font:** Geist Sans

---

## Files Changed

### `app/globals.css`
- เปลี่ยน CSS variable `--background` เป็น `#030712` (dark ตลอด)
- ลบ `@media (prefers-color-scheme: dark)` ออก เพราะ design เป็น dark ทั้งหมด
- อัปเดต font-family ให้ใช้ `--font-geist-sans`

### `app/layout.tsx`
- เปลี่ยน `title` จาก "Create Next App" → "Auth 101"
- เปลี่ยน `description` ให้สื่อถึง project จริง

### `app/page.tsx` (Homepage)
- ออกแบบใหม่ทั้งหมดจาก boilerplate → Landing Page จริง
- Hero section พร้อม gradient text
- Badge แสดง tech stack
- CTA 2 ปุ่ม: Sign in / Create account
- Feature cards 3 ใบ (NextAuth, Drizzle, Next.js) พร้อม SVG icon

### `app/login/page.tsx`
- UI ใหม่ทั้งหมด (logic เดิมครบ)
- Glass card กลางจอ
- Gradient button พร้อม loading spinner
- Error state ปรับ style ใหม่
- เพิ่ม `Suspense` boundary รอบ `useSearchParams()` (required ใน Next.js App Router)
- เพิ่ม `autoComplete` attribute บน inputs

### `app/register/page.tsx`
- UI ใหม่ทั้งหมด (logic เดิมครบ)
- Violet accent (แตกต่างจาก login ที่ใช้ indigo)
- เพิ่ม helper text "Minimum 6 characters"
- เพิ่ม `autoComplete` attribute บน inputs

### `app/components/navbar.tsx` *(ไฟล์ใหม่)*
- Global Navbar render ใน `app/layout.tsx` — ปรากฏทุกหน้า
- `async` Server Component — ตรวจ session ด้วย `auth()`
- **มี session:** แสดงชื่อ user + ปุ่ม Sign out (inline Server Action)
- **ไม่มี session:** แสดงปุ่ม Sign in + Get started
- Position `fixed top-0` — เป็น glassmorphism bar (`bg-[#030712]/80 backdrop-blur-xl`)

### `app/dashboard/page.tsx` *(ไฟล์ใหม่)*
- Server Component — ดึง session ด้วย `auth()`
- Redirect ไป `/login` ถ้าไม่ได้ login
- ลบ inline `<header>` ออก — sign out ย้ายไปอยู่ใน global Navbar แล้ว
- เพิ่ม `pt-16` บน outer div เพื่อ offset fixed Navbar
- แสดง user avatar (initials), name, email, user ID
- Session info: strategy (JWT), provider (Credentials), status (Authenticated)
- Stack tags แสดง tech ที่ใช้

---

### `proxy.ts` *(ไฟล์ใหม่)*
- Next.js 16 เปลี่ยน `middleware.ts` → `proxy.ts` (deprecated ใน v16.0.0)
- ตรวจ session cookie (`authjs.session-token` / `__Secure-authjs.session-token`)
- `/dashboard/*` → redirect `/login` ถ้าไม่มี session cookie
- `/login`, `/register` → redirect `/dashboard` ถ้ามี session แล้ว
- Matcher: `['/dashboard/:path*', '/login', '/register']`

---

## Architecture Notes

- ทุกหน้ายังคง logic เดิมทั้งหมด — เปลี่ยนแค่ visual layer
- Dashboard เป็น Server Component, login/register เป็น Client Component ตามเดิม
- ไม่เพิ่ม dependency ใหม่ — ใช้ Tailwind CSS v4 ที่มีอยู่แล้ว
- Route protection 2 ชั้น: proxy (cookie check) + Server Component (full JWT verify)
- Navbar auth logic: `auth()` ถูก cache ต่อ request — การ call ทั้งใน Navbar และ dashboard/page ไม่มี overhead เพิ่ม
- Sign out Server Action อยู่ใน Navbar ไม่ใช่ใน dashboard page อีกต่อไป
