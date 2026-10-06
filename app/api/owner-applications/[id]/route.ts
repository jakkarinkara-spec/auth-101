import { auth } from "@/auth";
import { db } from "@/app/db/index";
import { boats, ownerApplications, ownerProfiles, usersTable } from "@/app/db/schema";
import { isAdmin } from "@/app/lib/admin";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { parseBoatBody } from "../../boats/validate";

type Ctx = { params: Promise<{ id: string }> };

// admin อนุมัติ / ปฏิเสธคำขอเป็นเจ้าของเรือ
// อนุมัติ — ลำดับสำคัญ (neon-http ไม่มี interactive transaction):
//   1. เปลี่ยนคำขอเป็น approved เฉพาะถ้ายังเป็น pending (UPDATE ... WHERE status = 'pending') — กันอนุมัติซ้ำ / สร้างเรือซ้ำ
//   2. สร้างเรือจาก boat_data โดย owner_id = ผู้สมัคร แล้วเก็บ id ไว้ที่คำขอ
//   3. role → owner เฉพาะถ้าเดิมเป็น user (admin ไม่ถูกลดสิทธิ์)
export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (!(await isAdmin(session.user.id))) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await req.json().catch(() => null)) as { action?: unknown; reason?: unknown } | null;
  const action = body?.action;
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ message: "action must be approve or reject" }, { status: 400 });
  }
  // ไม่อนุมัติต้องบอกเหตุผล — ผู้ส่งเห็นในหน้า /owner/boat-requests
  const reason = typeof body?.reason === "string" ? body.reason.trim().slice(0, 500) : "";
  if (action === "reject" && !reason) {
    return NextResponse.json({ message: "Reason is required when rejecting" }, { status: 400 });
  }

  // อนุมัติเรือได้เฉพาะเมื่อผู้สมัครผ่านการอนุมัติตัวบุคคลแล้ว (ขั้นที่ 1)
  if (action === "approve") {
    const [owner] = await db
      .select({ status: ownerProfiles.status })
      .from(ownerApplications)
      .innerJoin(ownerProfiles, eq(ownerApplications.userId, ownerProfiles.userId))
      .where(eq(ownerApplications.id, id))
      .limit(1);
    if (owner?.status !== "approved") {
      return NextResponse.json({ message: "Applicant is not an approved owner yet" }, { status: 409 });
    }
  }

  // 1. ปิดคำขอ (ตัวกันหลัก — มีแค่ request เดียวที่ได้แถวกลับมา)
  const [decided] = await db
    .update(ownerApplications)
    .set({ status: action === "approve" ? "approved" : "rejected", rejectReason: action === "reject" ? reason : null, decidedAt: new Date() })
    .where(and(eq(ownerApplications.id, id), eq(ownerApplications.status, "pending")))
    .returning({ userId: ownerApplications.userId, boatData: ownerApplications.boatData });
  if (!decided) {
    const [existing] = await db.select({ status: ownerApplications.status }).from(ownerApplications).where(eq(ownerApplications.id, id)).limit(1);
    if (!existing) return NextResponse.json({ message: "Application not found" }, { status: 404 });
    return NextResponse.json({ message: `Application is already ${existing.status}` }, { status: 409 });
  }
  if (action === "reject") return NextResponse.json({ id, status: "rejected" });

  // 2. สร้างเรือ — ตรวจ boat_data ซ้ำด้วยกฎปัจจุบัน (เผื่อกฎเปลี่ยนหลังผู้ใช้ส่ง)
  const parsed = parseBoatBody(decided.boatData);
  if ("error" in parsed) {
    // ข้อมูลใช้ไม่ได้แล้ว — คืนสถานะเป็น pending ให้ admin ตัดสินใจใหม่ (ปฏิเสธ)
    await db.update(ownerApplications).set({ status: "pending", decidedAt: null }).where(eq(ownerApplications.id, id));
    return NextResponse.json({ message: `Boat data is invalid: ${parsed.error}` }, { status: 400 });
  }
  const [boat] = await db
    .insert(boats)
    .values({ ...parsed.data, ownerId: decided.userId })
    .returning({ id: boats.id });
  await db.update(ownerApplications).set({ boatId: boat.id }).where(eq(ownerApplications.id, id));

  // 3. role
  await db
    .update(usersTable)
    .set({ role: "owner" })
    .where(and(eq(usersTable.id, decided.userId), eq(usersTable.role, "user")));

  return NextResponse.json({ id, status: "approved", boatId: boat.id });
}
