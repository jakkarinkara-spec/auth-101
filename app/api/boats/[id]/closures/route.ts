import { auth } from "@/auth";
import { db } from "@/app/db/index";
import { boatClosures, boats } from "@/app/db/schema";
import { canManageBoat } from "@/app/lib/admin";
import { BOOKING_WINDOW_DAYS, addDays, bangkokToday, isYmd } from "@/app/lib/boats";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

// ปิดได้ครั้งละไม่เกินกี่วัน (from–to รวมหัวท้าย)
const MAX_RANGE_DAYS = 31;

// ปิดรับจองช่วงวันที่ (admin หรือเจ้าของเรือ) — หนึ่งแถวต่อวัน วันที่ปิดอยู่แล้วข้ามไป (ไม่ error)
// คำขอจองที่มีอยู่แล้วในวันนั้นไม่ถูกยกเลิก — admin จัดการเองในหน้า /admin
export async function POST(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  // admin หรือเจ้าของเรือลำนี้ (เช็คจาก boats.owner_id)
  if (!(await canManageBoat(session.user.id, id))) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const from = b?.from;
  const to = b?.to ?? from; // ไม่ส่ง to = ปิดวันเดียว
  const reason = typeof b?.reason === "string" && b.reason.trim() ? b.reason.trim() : null;

  if (!isYmd(from) || !isYmd(to)) {
    return NextResponse.json({ message: "from / to must be YYYY-MM-DD" }, { status: 400 });
  }
  const today = bangkokToday();
  if (from <= today || to > addDays(today, BOOKING_WINDOW_DAYS) || to < from) {
    return NextResponse.json(
      { message: `Dates must be from tomorrow to ${BOOKING_WINDOW_DAYS} days ahead, and to ≥ from` },
      { status: 400 },
    );
  }

  const dates: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) dates.push(d);
  if (dates.length > MAX_RANGE_DAYS) {
    return NextResponse.json({ message: `At most ${MAX_RANGE_DAYS} days at a time` }, { status: 400 });
  }

  const [boat] = await db.select({ id: boats.id }).from(boats).where(eq(boats.id, id)).limit(1);
  if (!boat) {
    return NextResponse.json({ message: "Boat not found" }, { status: 404 });
  }

  const created = await db
    .insert(boatClosures)
    .values(dates.map((date) => ({ boatId: id, date, reason })))
    .onConflictDoNothing({ target: [boatClosures.boatId, boatClosures.date] })
    .returning({ date: boatClosures.date });

  return NextResponse.json({ created: created.length, skipped: dates.length - created.length }, { status: 201 });
}
