import { auth } from "@/auth";
import { db } from "@/app/db/index";
import { bookings } from "@/app/db/schema";
import { isAdmin } from "@/app/lib/admin";
import { and, eq, ne } from "drizzle-orm";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

// เปลี่ยนสถานะคำขอจอง
//   admin:  pending → confirmed, pending/confirmed → cancelled (ทุกรายการ)
//   ลูกค้า: pending → cancelled เฉพาะรายการของตัวเอง — ยืนยันแล้วต้องติดต่อ / ให้ admin ยกเลิก
// ไม่ให้ดึงรายการที่ยกเลิกแล้วกลับมา — วันนั้นถูกปล่อยว่างแล้ว อาจมีคนอื่นจองไปแล้ว (จะชน unique index)
// เงื่อนไขทั้งหมด (เจ้าของ + สถานะเดิม) อยู่ใน WHERE ของ UPDATE เดียว จึงไม่มีช่องว่างระหว่างอ่านกับเขียน
export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const admin = await isAdmin(userId);

  const { id } = await params;
  const body = (await req.json().catch(() => null)) as { status?: unknown } | null;
  const status = body?.status;
  if (status !== "confirmed" && status !== "cancelled") {
    return NextResponse.json({ message: "Status must be confirmed or cancelled" }, { status: 400 });
  }
  if (!admin && status !== "cancelled") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const allowed = admin
    ? and(eq(bookings.id, id), status === "confirmed" ? eq(bookings.status, "pending") : ne(bookings.status, "cancelled"))
    : and(eq(bookings.id, id), eq(bookings.userId, userId), eq(bookings.status, "pending"));
  const [updated] = await db.update(bookings).set({ status }).where(allowed).returning();
  if (updated) return NextResponse.json(updated);

  // ไม่มีแถวถูกแก้ — แยกว่าไม่มีรายการนี้ (หรือเป็นของคนอื่น ตอบ 404 เหมือนกัน ไม่บอกว่ามีอยู่) หรือสถานะเปลี่ยนแบบนั้นไม่ได้
  const [existing] = await db
    .select({ status: bookings.status, userId: bookings.userId })
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1);
  if (!existing || (!admin && existing.userId !== userId)) {
    return NextResponse.json({ message: "Booking not found" }, { status: 404 });
  }
  return NextResponse.json({ message: `Cannot change a ${existing.status} booking to ${status}` }, { status: 409 });
}
