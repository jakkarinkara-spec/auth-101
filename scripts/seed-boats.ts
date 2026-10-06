// ใส่ข้อมูลเรือตัวอย่างจากดีไซน์ (เว็บเช่าเรือตกปลา.html) — รันซ้ำได้ ลำที่มีชื่อซ้ำจะข้าม
//
//   npm run seed:boats
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { boats } from "../app/db/schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const db = drizzle(url);

const SEED: (typeof boats.$inferInsert)[] = [
  {
    name: "ทะเลคราม",
    port: "สัตหีบ",
    lengthM: 12,
    seats: 10,
    kind: "เรือไฟเบอร์",
    captain: "สมชาย",
    description: "เรือไฟเบอร์ยาว 12 เมตร ดาดฟ้ากว้าง ตกได้รอบลำ กัปตันสมชายออกเรือแถวเกาะคราม–เกาะแสมสาร",
    engine: "[รุ่น / แรงม้า]",
    equipment: "โซนาร์ · GPS",
    tags: ["หลังคากันแดด", "ห้องน้ำ", "โซนาร์"],
    priceHalf: 5000,
    priceFull: 9500,
    priceNight: 13500,
  },
  {
    name: "นาวาทอง",
    port: "หัวหิน",
    lengthM: 9,
    seats: 6,
    kind: "สปีดโบ๊ท",
    captain: "ประเสริฐ",
    tags: ["หลังคากันแดด", "โซนาร์"],
    priceHalf: 4500,
    priceFull: 8500,
  },
  {
    name: "ดาวเหนือ",
    port: "ภูเก็ต",
    lengthM: 15,
    seats: 16,
    kind: "เรือประมงดัดแปลง",
    captain: "อนันต์",
    tags: ["ห้องน้ำ", "ที่นอน", "โซนาร์"],
    priceFull: 14000,
    priceNight: 18000,
  },
  {
    name: "คลื่นเงิน",
    port: "สัตหีบ",
    lengthM: 10,
    seats: 8,
    kind: "เรือหางยาวดัดแปลง",
    captain: "บุญมี",
    tags: ["หลังคากันแดด"],
    priceHalf: 4500,
    priceFull: 8000,
    priceNight: 12000,
  },
  {
    name: "ไข่มุกตะวันออก",
    port: "เกาะช้าง",
    lengthM: 14,
    seats: 12,
    kind: "เรือไม้",
    captain: "วิชัย",
    tags: ["ห้องน้ำ", "ที่นอน", "ไฟล่อหมึก"],
    priceFull: 11000,
    priceNight: 12000,
  },
];

async function main() {
  console.log(`Target DB host: ${new URL(url!).host}`);
  const existing = new Set((await db.select({ name: boats.name }).from(boats)).map((b) => b.name));
  const toInsert = SEED.filter((b) => !existing.has(b.name));
  if (toInsert.length > 0) await db.insert(boats).values(toInsert);
  console.log(`Inserted ${toInsert.length} boats, skipped ${SEED.length - toInsert.length} existing.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
