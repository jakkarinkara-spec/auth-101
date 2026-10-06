import { auth } from "@/auth";
import { db } from "@/app/db/index";
import { boats } from "@/app/db/schema";
import { isAdmin } from "@/app/lib/admin";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

// เปิด / ปิดรับจอง (admin เท่านั้น) — ใช้แทนการลบเรือ: คำขอจองเดิมไม่ถูกแตะ
// ปิดแล้ว: ไม่แสดงในหน้าเว็บ, POST /api/bookings ตอบ 409
export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (!(await isAdmin(session.user.id))) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await req.json().catch(() => null)) as { active?: unknown } | null;
  if (typeof body?.active !== "boolean") {
    return NextResponse.json({ message: "active must be true or false" }, { status: 400 });
  }

  const [boat] = await db
    .update(boats)
    .set({ active: body.active })
    .where(eq(boats.id, id))
    .returning({ id: boats.id, active: boats.active });
  if (!boat) {
    return NextResponse.json({ message: "Boat not found" }, { status: 404 });
  }
  return NextResponse.json(boat);
}
