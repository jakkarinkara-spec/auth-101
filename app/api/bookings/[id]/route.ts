import { auth } from "@/auth";
import { db } from "@/app/db/index";
import { boats, bookings } from "@/app/db/schema";
import { isAdmin, ownedBoatIds } from "@/app/lib/admin";
import { and, eq, inArray, ne, or } from "drizzle-orm";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

// เปลี่ยนสถานะคำขอจอง
//   admin:        pending → confirmed, pending/confirmed → cancelled (ทุกรายการ)
//   เจ้าของเรือ:   เหมือน admin แต่เฉพาะคำขอของเรือที่ตัวเองเป็นเจ้าของ (boats.owner_id)
//   ลูกค้า:       pending → cancelled เฉพาะคำขอของตัวเอง
// ไม่ให้ดึงรายการที่ยกเลิกแล้วกลับมา — วันนั้นถูกปล่อยว่างแล้ว อาจมีคนอื่นจองไปแล้ว (จะชน unique index)
// เงื่อนไขทั้งหมด (สิทธิ์ + สถานะเดิม) อยู่ใน WHERE ของ UPDATE เดียว จึงไม่มีช่องว่างระหว่างอ่านกับเขียน
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

  // ทุกเงื่อนไขอ้าง bookings.id = id
  const mine = inArray(bookings.boatId, ownedBoatIds(userId)); // คำขอของเรือที่ผู้ใช้เป็นเจ้าของ
  const fromStatus = status === "confirmed" ? eq(bookings.status, "pending") : ne(bookings.status, "cancelled");
  const allowed = admin
    ? fromStatus
    : status === "confirmed"
      ? and(mine, fromStatus)
      : or(and(mine, fromStatus), and(eq(bookings.userId, userId), eq(bookings.status, "pending")));

  const [updated] = await db
    .update(bookings)
    .set({ status })
    .where(and(eq(bookings.id, id), allowed))
    .returning();
  if (updated) return NextResponse.json(updated);

  // ไม่มีแถวถูกแก้ — คนที่เกี่ยวข้อง (admin / ลูกค้าเจ้าของคำขอ / เจ้าของเรือ) ได้ 409 ที่เหลือได้ 404 (ไม่บอกว่ารายการมีอยู่)
  const [existing] = await db
    .select({ status: bookings.status, userId: bookings.userId, ownerId: boats.ownerId })
    .from(bookings)
    .innerJoin(boats, eq(bookings.boatId, boats.id))
    .where(eq(bookings.id, id))
    .limit(1);
  const related = existing && (admin || existing.userId === userId || existing.ownerId === userId);
  if (!related) {
    return NextResponse.json({ message: "Booking not found" }, { status: 404 });
  }
  return NextResponse.json({ message: `Cannot change a ${existing.status} booking to ${status}` }, { status: 409 });
}
