import { auth } from "@/auth";
import { db } from "@/app/db/index";
import { crops } from "@/app/db/schema";
import { NextResponse } from "next/server";

// ค่าสูงสุดของ Postgres integer — เกินนี้ insert จะ error เป็น 500
const MAX_INT = 2147483647;

// สร้าง crop ใหม่ — /api/* ไม่ได้อยู่ใน matcher ของ proxy.ts จึงต้องเช็ค session ที่นี่เอง
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const dayGrow = Number(body?.dayGrow);

  if (!Number.isInteger(dayGrow) || dayGrow < 1 || dayGrow > MAX_INT) {
    return NextResponse.json(
      { message: "Days to grow must be a whole number greater than 0" },
      { status: 400 },
    );
  }

  const [crop] = await db
    .insert(crops)
    .values({ name: name || null, dayGrow })
    .returning();

  return NextResponse.json(crop, { status: 201 });
}
