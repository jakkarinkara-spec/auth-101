import { auth } from "@/auth";
import { db } from "@/app/db/index";
import { ownerProfiles, usersTable } from "@/app/db/schema";
import { isAdmin } from "@/app/lib/admin";
import { closeOwnerEdit } from "@/app/lib/owner-edits";
import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { parseOwnerProfile } from "./validate";

// บันทึก / แก้ไขข้อมูลส่วนตัวเจ้าของเรือ = ส่งให้ admin ตรวจ (หนึ่งแถวต่อผู้ใช้ — upsert)
// userId มาจาก session เสมอ แก้ข้อมูลของคนอื่นไม่ได้
// ใหม่ / รอตรวจ / เคยถูกปฏิเสธ → บันทึกลงคอลัมน์หลัก สถานะ pending (ใบสมัคร)
// อนุมัติแล้ว → ไม่แตะข้อมูลเดิม: เก็บค่าที่แก้ใน pending_data รอ admin อนุมัติ (สถานะยัง approved ใช้งานต่อได้)
//   มีคำขอค้างอยู่ → ส่งใหม่ไม่ได้ (409) ต้องรอ admin ตัดสิน หรือยกเลิกคำขอก่อน (DELETE)
//   ค่าเหมือนข้อมูลที่ใช้อยู่ → 400 ไม่มีอะไรให้ส่ง
//   (ชื่อ = ชื่อบัญชี เปลี่ยนที่ /account ได้ทันทีโดยไม่ต้องรอตรวจ)
// ประเภทคำขอ (ให้ admin แยกสี): ใหม่ = new, แก้หลังอนุมัติ = edit, ส่งใหม่หลังถูกปฏิเสธ = resubmit
//   แก้ซ้ำระหว่างรอตรวจ → ประเภทเดิม
export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  // admin สมัครเป็นเจ้าของเรือไม่ได้ (เพิ่ม / จัดการเรือได้ที่ /admin/boats อยู่แล้ว)
  if (await isAdmin(userId)) {
    return NextResponse.json({ message: "Admins cannot apply as boat owners" }, { status: 403 });
  }

  // ชื่อเจ้าของเรือใช้ชื่อที่ลงทะเบียนเสมอ (อ่านจาก DB ไม่เชื่อค่าจาก client) — ไม่มีชื่อใช้ส่วนหน้าของอีเมล
  const [account] = await db.select({ name: usersTable.name, email: usersTable.email }).from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  const registeredName = account?.name?.trim() || account?.email.split("@")[0] || "";
  const parsed = parseOwnerProfile(await req.json().catch(() => null), registeredName);
  if ("error" in parsed) {
    return NextResponse.json({ message: parsed.error }, { status: 400 });
  }
  const data = parsed.data;

  const [existing] = await db.select().from(ownerProfiles).where(eq(ownerProfiles.userId, userId)).limit(1);

  if (existing?.status === "approved") {
    if (existing.pendingData) {
      return NextResponse.json({ message: "Edit request is already pending" }, { status: 409 });
    }
    const edit = { phone: data.phone, address: data.address, contactEmail: data.contactEmail };
    if (existing.phone === edit.phone && existing.address === edit.address && existing.contactEmail === edit.contactEmail) {
      return NextResponse.json({ message: "No changes" }, { status: 400 });
    }
    // ส่งคำขอใหม่ = ล้างเหตุผลที่ไม่อนุมัติคำขอแก้ไขครั้งก่อน
    // WHERE pending_data IS NULL กันส่งซ้อนกัน (กดซ้ำ / สองแท็บ)
    const [profile] = await db
      .update(ownerProfiles)
      .set({ pendingData: edit, requestType: "edit", rejectReason: null, updatedAt: new Date() })
      .where(and(eq(ownerProfiles.userId, userId), eq(ownerProfiles.status, "approved"), isNull(ownerProfiles.pendingData)))
      .returning();
    if (!profile) {
      return NextResponse.json({ message: "Edit request is already pending" }, { status: 409 });
    }
    return NextResponse.json(profile);
  }

  const requestType = !existing ? ("new" as const) : existing.status === "pending" ? existing.requestType : ("resubmit" as const);
  const values = { ...data, status: "pending" as const, requestType, pendingData: null, decidedAt: null, updatedAt: new Date() };
  const [profile] = await db
    .insert(ownerProfiles)
    .values({ userId, ...values })
    .onConflictDoUpdate({ target: ownerProfiles.userId, set: values })
    .returning();
  return NextResponse.json(profile);
}

// ยกเลิกคำขอแก้ไขที่รอ admin ตรวจ (เจ้าของเรือที่อนุมัติแล้ว) — กลับไปใช้ข้อมูลเดิม แล้วส่งคำขอใหม่ได้
// บันทึกในประวัติเป็น cancelled — ถ้า admin ตัดสินไปก่อนแล้วจะได้ 404
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (!(await closeOwnerEdit(session.user.id, { action: "cancel" }))) {
    return NextResponse.json({ message: "No pending edit request" }, { status: 404 });
  }
  return NextResponse.json({ cancelled: true });
}
