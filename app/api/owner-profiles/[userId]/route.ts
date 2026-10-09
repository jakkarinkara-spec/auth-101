import { auth } from "@/auth";
import { db } from "@/app/db/index";
import { ownerProfiles, usersTable } from "@/app/db/schema";
import { isAdmin } from "@/app/lib/admin";
import { closeOwnerEdit } from "@/app/lib/owner-edits";
import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ userId: string }> };

// admin อนุมัติ / ปฏิเสธผู้สมัครเป็นเจ้าของเรือ (ขั้นที่ 1 — ตัวบุคคล) หรือคำขอแก้ข้อมูลของเจ้าของเรือที่อนุมัติแล้ว
// ใบสมัคร (status pending): อนุมัติ → approved + role user → owner (admin ไม่ถูกลดสิทธิ์), ปฏิเสธ → rejected
// คำขอแก้ไข (approved + pending_data): อนุมัติ → คัดลอก pending_data ลงคอลัมน์หลัก, ปฏิเสธ → ทิ้ง pending_data ใช้ข้อมูลเดิมต่อ
//   ทั้งสองกรณีสถานะยัง approved
// เงื่อนไขสถานะเช็คใน WHERE ของ UPDATE เดียว (กันกดซ้ำ / แข่งกัน)
export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (!(await isAdmin(session.user.id))) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  const body = (await req.json().catch(() => null)) as { action?: unknown; reason?: unknown } | null;
  const action = body?.action;
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ message: "action must be approve or reject" }, { status: 400 });
  }
  // ไม่อนุมัติต้องบอกเหตุผล — ผู้สมัครเห็นในหน้า /owner และ /owner/profile
  const reason = typeof body?.reason === "string" ? body.reason.trim().slice(0, 500) : "";
  if (action === "reject" && !reason) {
    return NextResponse.json({ message: "Reason is required when rejecting" }, { status: 400 });
  }

  // คำขอแก้ไขของเจ้าของเรือที่อนุมัติแล้ว (บันทึกประวัติใน owner_profile_edits ด้วย)
  const decided = await closeOwnerEdit(
    userId,
    action === "approve" ? { action, by: session.user.id } : { action, by: session.user.id, reason },
  );
  if (decided) return NextResponse.json({ userId, status: "approved" });

  // ใบสมัคร — อนุมัติ: เก็บข้อมูลตัวตนชุดนี้ไว้
  const [profile] = await db
    .update(ownerProfiles)
    .set(
      action === "approve"
        ? {
            status: "approved",
            rejectReason: null,
            decidedAt: new Date(),
            approvedData: sql`jsonb_build_object('fullName', ${ownerProfiles.fullName}, 'phone', ${ownerProfiles.phone}, 'address', ${ownerProfiles.address})`,
          }
        : { status: "rejected", rejectReason: reason, decidedAt: new Date() },
    )
    .where(and(eq(ownerProfiles.userId, userId), eq(ownerProfiles.status, "pending")))
    .returning({ userId: ownerProfiles.userId, status: ownerProfiles.status });
  if (!profile) {
    const [existing] = await db.select({ status: ownerProfiles.status }).from(ownerProfiles).where(eq(ownerProfiles.userId, userId)).limit(1);
    if (!existing) return NextResponse.json({ message: "Profile not found" }, { status: 404 });
    return NextResponse.json({ message: `Profile is already ${existing.status}` }, { status: 409 });
  }

  if (action === "approve") {
    await db.update(usersTable).set({ role: "owner" }).where(and(eq(usersTable.id, userId), eq(usersTable.role, "user")));
  }
  return NextResponse.json(profile);
}
