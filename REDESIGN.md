# UI/UX Redesign — Auth 101

> **อัปเดต 2026-10-05:** ปัจจุบันใช้ธีม **modern minimal** (ดู "UI Design" ใน `PROJECT_OVERVIEW.md`) — เนื้อหาด้านล่างเป็นบันทึกของ redesign รอบแรก (glassmorphism) เก็บไว้เป็นประวัติ

## Design System

**Style:** Glassmorphism — Light + Dark Mode  
**Primary accent:** Indigo → Violet gradient (คงเดิมทั้ง 2 theme)  
**Background:** Light `#f8fafc` / Dark `#030712` (deep navy-black) — ทั้งคู่มี decorative gradient orbs  
**Cards:** `backdrop-blur-xl` + `bg-black/[0.02] border-black/10` (light) / `bg-white/[0.04] border-white/10` (dark)  
**Font:** Geist Sans

---

## Files Changed

### `app/globals.css`
- เพิ่ม `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));` — ผูก Tailwind's `dark:` variant เข้ากับ attribute `data-theme="dark"` แทน default (`prefers-color-scheme`) เพื่อให้ toggle เองได้
- `:root` เป็นค่า light (`--background: #f8fafc`), `[data-theme="dark"]` override เป็นค่า dark (`--background: #030712`)
- อัปเดต font-family ให้ใช้ `--font-geist-sans`

### `app/layout.tsx`
- เปลี่ยน `title` จาก "Create Next App" → "Auth 101"
- เปลี่ยน `description` ให้สื่อถึง project จริง
- เพิ่ม `data-theme="dark"` + `suppressHydrationWarning` บน `<html>`
- เพิ่ม inline `<script>` ใน `<head>` อ่านค่าจาก `localStorage` (หรือ `prefers-color-scheme` ถ้าไม่มีค่าเก็บไว้) แล้ว set attribute `data-theme` ก่อน browser paint — ป้องกัน flash ของ theme ผิดตอนโหลดหน้า (pattern ตาม [Next.js 16 — Preventing Flash guide](node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md))

### `app/page.tsx` (Homepage)
- ออกแบบใหม่ทั้งหมดจาก boilerplate → Landing Page จริง
- Hero section พร้อม gradient text
- Badge แสดง tech stack
- CTA 2 ปุ่ม: Sign in / Create account
- Feature cards 3 ใบ (NextAuth, Drizzle, Next.js) พร้อม SVG icon
- ทุก background/border/text แปลงเป็นคู่ light + `dark:` แล้ว

### `app/login/page.tsx`
- UI ใหม่ทั้งหมด (logic เดิมครบ)
- Glass card กลางจอ
- Gradient button พร้อม loading spinner
- Error state ปรับ style ใหม่
- เพิ่ม `Suspense` boundary รอบ `useSearchParams()` (required ใน Next.js App Router)
- เพิ่ม `autoComplete` attribute บน inputs
- ทุก background/border/text แปลงเป็นคู่ light + `dark:` แล้ว

### `app/register/page.tsx`
- UI ใหม่ทั้งหมด (logic เดิมครบ)
- Violet accent (แตกต่างจาก login ที่ใช้ indigo)
- เพิ่ม helper text "Minimum 6 characters"
- เพิ่ม `autoComplete` attribute บน inputs
- ทุก background/border/text แปลงเป็นคู่ light + `dark:` แล้ว

### `app/components/navbar.tsx` *(ไฟล์ใหม่)*
- Global Navbar render ใน `app/layout.tsx` — ปรากฏทุกหน้า
- `async` Server Component — ตรวจ session ด้วย `auth()`
- **มี session:** แสดงชื่อ user + ปุ่ม Sign out (inline Server Action)
- **ไม่มี session:** แสดงปุ่ม Sign in + Get started
- เพิ่ม `<ThemeToggle />` ต่อท้ายทุก state (login/logout)
- Position `fixed top-0` — เป็น glassmorphism bar, รองรับทั้ง 2 theme (`bg-slate-50/80` light / `dark:bg-[#030712]/80` dark)

### `app/components/theme-toggle.tsx` *(ไฟล์ใหม่)*
- ปุ่มไอคอน sun/moon สำหรับสลับ theme — วางใน Navbar
- คลิก → toggle attribute `data-theme` บน `<html>` + บันทึกค่าลง `localStorage`
- **ออกแบบให้ไม่มี React state ควบคุม icon** — ใช้ CSS ล้วน (`dark:hidden` / `hidden dark:block`) ให้ icon ไหนแสดงขึ้นกับ `data-theme` ปัจจุบันโดยตรง
  - เหตุผล: ถ้าใช้ `useState` เพื่อสลับ icon จะเกิด hydration mismatch ได้ — server render ค่า default (`dark`) แต่ inline script อาจเปลี่ยนเป็น `light` ไปแล้วก่อน React hydrate
  - CSS-only ทำให้ output ตรงกันเสมอไม่ว่า server จะ render state ไหน ปลอดภัย 100%

### `app/dashboard/page.tsx` *(ไฟล์ใหม่)*
- Server Component — ดึง session ด้วย `auth()`
- Redirect ไป `/login` ถ้าไม่ได้ login
- ลบ inline `<header>` ออก — sign out ย้ายไปอยู่ใน global Navbar แล้ว
- เพิ่ม `pt-16` บน outer div เพื่อ offset fixed Navbar
- แสดง user avatar (initials), name, email, user ID
- Session info: strategy (JWT), provider (Credentials), status (Authenticated)
- Stack tags แสดง tech ที่ใช้
- ทุก background/border/text แปลงเป็นคู่ light + `dark:` แล้ว

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
- Light/Dark mode: ใช้ `data-theme` attribute (ไม่ใช่ `.dark` class) — ตรงกับ pattern ที่ Next.js 16 docs แนะนำ
- ทุกสีที่ hardcode ไว้เป็น dark-only เดิม ถูกแปลงเป็นคู่ light (default) + `dark:` (override) ทั่วทั้งแอป — ไม่มีสีที่ hardcode เหลืออยู่
