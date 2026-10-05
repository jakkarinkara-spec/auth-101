import { auth } from "@/auth";
import { db } from "@/app/db/index";
import { crops, plots } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// numeric(10,2) เก็บได้สูงสุด 8 หลักหน้าจุด — เกินนี้ insert จะ error เป็น 500
const MAX_AREA = 99999999.99;

// สร้างแปลงปลูกใหม่ — /api/* ไม่ได้อยู่ใน matcher ของ proxy.ts จึงต้องเช็ค session ที่นี่เอง
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const name = str(body?.name);
  const location = str(body?.location);
  const cropId = str(body?.cropId);
  const plantedAt = str(body?.plantedAt);
  const areaInput = str(body?.areaRai);

  if (!name) {
    return NextResponse.json({ message: "Plot name is required" }, { status: 400 });
  }

  const area = areaInput ? Number(areaInput) : null;
  if (area !== null && (!Number.isFinite(area) || area <= 0 || area > MAX_AREA)) {
    return NextResponse.json({ message: "Area must be a number greater than 0" }, { status: 400 });
  }

  if (plantedAt && (!/^\d{4}-\d{2}-\d{2}$/.test(plantedAt) || isNaN(Date.parse(plantedAt)))) {
    return NextResponse.json({ message: "Planted date must be a valid date" }, { status: 400 });
  }

  // ตรวจว่า crop มีอยู่จริง ไม่งั้น FK จะ error เป็น 500
  if (cropId) {
    const [crop] = await db.select({ id: crops.id }).from(crops).where(eq(crops.id, cropId)).limit(1);
    if (!crop) {
      return NextResponse.json({ message: "Selected crop does not exist" }, { status: 400 });
    }
  }

  const [plot] = await db
    .insert(plots)
    .values({
      name,
      areaRai: area === null ? null : area.toFixed(2),
      location: location || null,
      cropId: cropId || null,
      plantedAt: plantedAt || null,
    })
    .returning();

  return NextResponse.json(plot, { status: 201 });
}
