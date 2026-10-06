import { auth } from "@/auth";
import { db } from "@/app/db/index";
import { bookings } from "@/app/db/schema";
import { NextResponse } from "next/server";
import { parseBookingBody } from "./validate";

// unique index bookings_boat_date_active ชน = มีคนจองเรือลำนี้วันนั้นไปแล้ว (drizzle ห่อ error ของ pg ไว้ใน cause)
function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; cause?: { code?: string } } | null;
  return e?.code === "23505" || e?.cause?.code === "23505";
}

// ส่งคำขอจองเรือ — /api/* ไม่ได้อยู่ใน matcher ของ proxy.ts จึงต้องเช็ค session ที่นี่เอง
// สถานะเริ่มต้นเป็น pending: ยังไม่มีระบบชำระเงินจริง กัปตัน/admin เป็นคนยืนยัน
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseBookingBody(await req.json().catch(() => null));
  if ("error" in parsed) {
    return NextResponse.json({ message: parsed.error }, { status: parsed.status ?? 400 });
  }

  try {
    const [booking] = await db
      .insert(bookings)
      .values({ ...parsed.data, userId: session.user.id })
      .returning();
    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return NextResponse.json({ message: "This boat is already booked on that date" }, { status: 409 });
    }
    throw err;
  }
}
