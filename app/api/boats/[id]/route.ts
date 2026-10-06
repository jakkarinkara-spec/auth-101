import { auth } from "@/auth";
import { db } from "@/app/db/index";
import { boats } from "@/app/db/schema";
import { isAdmin } from "@/app/lib/admin";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { parseBoatBody } from "../validate";

type Ctx = { params: Promise<{ id: string }> };

// แก้ไขเรือ (admin เท่านั้น) — ส่งทุก field มาแทนค่าเดิม (เหมือนตอนเพิ่ม)
// คำขอจองเดิมไม่ถูกแก้ราคาตาม — ราคาที่บันทึกไว้ใน bookings คงเดิม
export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (!(await isAdmin(session.user.id))) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const parsed = parseBoatBody(await req.json().catch(() => null));
  if ("error" in parsed) {
    return NextResponse.json({ message: parsed.error }, { status: 400 });
  }

  const [boat] = await db.update(boats).set(parsed.data).where(eq(boats.id, id)).returning();
  if (!boat) {
    return NextResponse.json({ message: "Boat not found" }, { status: 404 });
  }
  return NextResponse.json(boat);
}
