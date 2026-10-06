import { auth } from "@/auth";
import { db } from "@/app/db/index";
import { boats } from "@/app/db/schema";
import { isAdmin } from "@/app/lib/admin";
import { NextResponse } from "next/server";
import { parseBoatBody } from "./validate";

// เพิ่มเรือ (admin เท่านั้น) — /api/* ไม่ได้อยู่ใน matcher ของ proxy.ts จึงต้องเช็ค session ที่นี่เอง
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (!(await isAdmin(session.user.id))) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const parsed = parseBoatBody(await req.json().catch(() => null));
  if ("error" in parsed) {
    return NextResponse.json({ message: parsed.error }, { status: 400 });
  }

  const [boat] = await db.insert(boats).values(parsed.data).returning();
  return NextResponse.json(boat, { status: 201 });
}
