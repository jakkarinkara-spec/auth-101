This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.



Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
1. สร้าง migration จาก schema
ทุกครั้งที่แก้ไฟล์ app/db/schema.ts (เพิ่ม/ลบ/แก้ table หรือ column) ให้รันคำสั่งนี้เพื่อสร้างไฟล์ SQL migration
bashnpx drizzle-kit generate
จะได้ไฟล์ .sql ใหม่อยู่ใน folder drizzle/
2. รัน migration เข้าฐานข้อมูลจริง
bashnpx drizzle-kit migrate
คำสั่งนี้จะเอา SQL ที่ generate ไว้ไปรันกับฐานข้อมูล Neon จริงๆ ตามที่ตั้งไว้ใน DATABASE_URL
3. (ทางเลือก) push schema ตรงๆ โดยไม่สร้างไฟล์ migration
เหมาะกับช่วง dev ที่อยากลองไปก่อน ไม่ต้องเก็บ migration history
bashnpx drizzle-kit push
4. เปิด Drizzle Studio ดูข้อมูลในฐานข้อมูล
bashnpx drizzle-kit studio
จะเปิด local web UI (ปกติที่ https://local.drizzle.studio) ให้ดูตาราง ดูข้อมูล แก้ไขข้อมูลได้แบบ GUI
ทุกคำสั่งนี้จะอ่าน config จากไฟล์ drizzle.config.ts ที่ root โปรเจกต์ ดังนั้นต้องเช็คให้แน่ใจว่า schema path ใน config ตรงกับที่ไฟล์อยู่จริง (ของคุณคือ ./app/db/schema.ts) และ .env มี DATABASE_URL ที่ถูกต้องอยู่แล้ว
ถ้าอยากให้เพิ่ม script สั้นๆใน package.json เพื่อไม่ต้องพิมพ์ npx drizzle-kit ... ทุกครั้ง บอกได้ครับ จะเพิ่มแบบนี้ให้
json"scripts": {
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:push": "drizzle-kit push",
  "db:studio": "drizzle-kit studio"
}