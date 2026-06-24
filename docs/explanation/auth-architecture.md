# ทำความเข้าใจสถาปัตยกรรม authentication

เอกสารนี้อธิบายเหตุผลเบื้องหลังการตัดสินใจออกแบบระบบ authentication ของ auth-101 ว่าทำไมถึงสร้างแบบนี้ และมีข้อแลกเปลี่ยนอะไรบ้าง

## ทำไมถึงใช้ JWT session แทน database session

NextAuth รองรับสองกลยุทธ์สำหรับ session คือ `jwt` และ `database` โปรเจคนี้เลือกใช้ `jwt`

ด้วย `database` session NextAuth จะสร้าง session record ในฐานข้อมูลทุกครั้งที่ล็อกอิน และตรวจสอบ record นั้นทุก request ฐานข้อมูลเป็นแหล่งความจริง — สามารถยกเลิก session ได้ทันทีโดยลบ record ทิ้ง

ด้วย `jwt` session ข้อมูล session ถูกเข้ารหัสไว้ใน cookie ที่มีลายเซ็น ไม่มีตาราง session server ตรวจสอบลายเซ็นในแต่ละ request โดยไม่ต้องแตะฐานข้อมูล

โปรเจคนี้เลือก JWT เพราะลด database query หนึ่งครั้งต่อ request และทำให้ schema เรียบง่ายขึ้น ข้อแลกเปลี่ยนคือ JWT ไม่สามารถยกเลิกได้ก่อนหมดอายุ หากบัญชีผู้ใช้ถูกโจมตี ทางเดียวที่แก้ได้คือ rotate `AUTH_SECRET` ซึ่งจะ logout ผู้ใช้ทุกคน สำหรับโปรเจคเพื่อการเรียนรู้นี้ถือว่ายอมรับได้ ระบบ production ที่ต้องการยกเลิก session รายคนควรใช้กลยุทธ์ `database` แทน

## ทำไมถึงใช้ bcrypt สำหรับ hash รหัสผ่าน

รหัสผ่านถูก hash ด้วย bcrypt ที่ 10 rounds ก่อนเก็บลงฐานข้อมูล bcrypt ถูกออกแบบให้ช้าโดยตั้งใจ — 10 rounds หมายความว่าแต่ละ hash ใช้เวลาประมาณ 100ms บน hardware ทั่วไป ความช้านี้คือคุณสมบัติด้านความปลอดภัย มันทำให้การโจมตีแบบ brute-force มีค่าใช้จ่ายสูง

ค่า cost factor (10 rounds) จะเพิ่มเวลาคำนวณเป็นสองเท่าต่อแต่ละ round ที่เพิ่มขึ้น ค่า 10 เป็นค่าเริ่มต้นที่ใช้ได้จริงในปัจจุบัน เร็วพอที่ผู้ใช้ไม่รู้สึกถึงความล่าช้าตอน register และช้าพอที่จะต้านทานการโจมตีแบบ offline ได้

## ทำไมถึงใช้ Neon PostgreSQL

โปรเจคใช้ Neon ซึ่งเป็น serverless PostgreSQL provider HTTP adapter ของ Neon (`@neondatabase/serverless`) ช่วยให้ query ฐานข้อมูลได้จาก serverless runtime (Vercel Edge Functions, Cloudflare Workers) ที่ไม่สามารถสร้าง TCP connection แบบถาวรได้

สำหรับโปรเจคที่ deploy บน Vercel เรื่องนี้สำคัญมาก `pg` แบบดั้งเดิมจะล้มเหลวหรือทำงานผิดปกติใน serverless environment adapter ของ Neon ส่ง query ผ่าน HTTP แลกกับ latency เล็กน้อยเพื่อให้ใช้งานได้

## ทำไมถึงใช้การป้องกัน 2 ชั้น (proxy + Server Component)

โปรเจคนี้ป้องกัน route ด้วยสองชั้น แทนที่จะใช้ชั้นเดียว เหตุผลมาจากข้อจำกัดของแต่ละชั้น

**ชั้นที่ 1 — proxy.ts (edge)**

`proxy.ts` รันที่ edge ก่อน request จะเข้าถึง application จริง มันตรวจแค่ว่า session cookie มีอยู่หรือไม่ — ไม่มีการ verify ลายเซ็น ไม่ query ฐานข้อมูล ทำให้เร็วมากและไม่เพิ่ม latency

ข้อจำกัด: edge runtime ไม่สามารถ import `auth()` จาก NextAuth ได้โดยตรงในทุกกรณี และการตรวจ cookie อย่างเดียวไม่ปลอดภัยเพียงพอ เพราะ cookie อาจถูกแก้ไขหรือหมดอายุแล้วแต่ยังมีชื่ออยู่

**ชั้นที่ 2 — Server Component (auth())**

`dashboard/page.tsx` เรียก `auth()` ซึ่ง verify ลายเซ็น JWT จริงๆ ถ้า cookie ถูกแก้ไข หมดอายุ หรือ `AUTH_SECRET` ถูก rotate แล้ว `auth()` จะคืนค่า `null` และ redirect ไปที่ `/login`

**ทำไมต้องสองชั้น**

ชั้น proxy กรองคำขอที่ชัดเจนออกไปก่อน (ไม่มี cookie เลย) โดยไม่ต้องรัน application code ชั้น Server Component จัดการกับกรณีที่ละเอียดกว่า (cookie มีแต่ JWT ไม่ valid) ทั้งสองชั้นร่วมกันทำให้ระบบทั้งเร็วและปลอดภัย

## request ล็อกอินไหลผ่านระบบอย่างไร

เมื่อผู้ใช้กดปุ่ม login:

1. เบราว์เซอร์เรียก `signIn('credentials', { email, password })` ผ่าน NextAuth client SDK
2. NextAuth ส่งการเรียกไปยังฟังก์ชัน `authorize` ใน `auth.ts`
3. `authorize` query ตาราง `users` ด้วย email
4. ถ้าพบผู้ใช้ bcrypt เปรียบเทียบรหัสผ่านที่ส่งมากับ hash ที่เก็บไว้
5. ถ้าตรงกัน `authorize` คืนค่า user object NextAuth sign JWT ที่มี id, email และ name ของผู้ใช้
6. JWT ถูกตั้งเป็น cookie ใน response
7. เบราว์เซอร์ redirect ไปที่ `/dashboard`

สำหรับ request ถัดไปที่เข้าหน้า protected `auth()` อ่านและตรวจสอบลายเซ็นของ cookie ถ้าถูกต้องจะคืนค่า session ถ้า cookie หายหรือลายเซ็นไม่ถูกต้อง `auth()` คืนค่า `null` และหน้านั้น redirect ไปที่ `/login`

## ทำไมถึงมีตาราง crops

ตาราง `crops` ใน schema ไม่เกี่ยวข้องกับ authentication ดูเหมือนจะเป็นการทดลองในช่วงต้นหรือ placeholder สำหรับ feature ในอนาคต — อาจเป็น domain model ของแอปจัดการพืชผลที่ระบบ auth นี้ถูกสร้างมาเพื่อป้องกัน ขณะนี้ยังไม่ได้ถูกใช้งานโดย route หรือ component ใดๆ
