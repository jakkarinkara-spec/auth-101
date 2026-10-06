import { auth } from "@/auth";
import { db } from "@/app/db/index";
import { ownerProfiles } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { parseOwnerProfile } from "./validate";

// บันทึก / แก้ไขข้อมูลส่วนตัวเจ้าของเรือ = ส่งใบสมัครให้ admin ตรวจ (หนึ่งแถวต่อผู้ใช้ — upsert)
// userId มาจาก session เสมอ แก้ข้อมูลของคนอื่นไม่ได้
// สถานะหลังบันทึก:
//   ใหม่ / เคยถูกปฏิเสธ → pending (รอตรวจ)
//   อนุมัติแล้ว + แก้ชื่อ / เบอร์ / ที่อยู่ → pending (ตรวจตัวตนใหม่) — แก้แค่อีเมลติดต่อ สถานะคงเดิม
// ประเภทคำขอ (ให้ admin แยกสี): ใหม่ = new, แก้หลังอนุมัติ = edit, ส่งใหม่หลังถูกปฏิเสธ = resubmit
//   แก้ซ้ำระหว่างรอตรวจ → ประเภทเดิม
export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const parsed = parseOwnerProfile(await req.json().catch(() => null));
  if ("error" in parsed) {
    return NextResponse.json({ message: parsed.error }, { status: 400 });
  }
  const data = parsed.data;

  const [existing] = await db.select().from(ownerProfiles).where(eq(ownerProfiles.userId, userId)).limit(1);
  const identityUnchanged =
    existing && existing.fullName === data.fullName && existing.phone === data.phone && existing.address === data.address;
  const keepApproved = existing?.status === "approved" && identityUnchanged;

  const requestType = !existing
    ? ("new" as const)
    : keepApproved || existing.status === "pending"
      ? existing.requestType
      : existing.status === "approved"
        ? ("edit" as const)
        : ("resubmit" as const);

  const values = {
    ...data,
    status: keepApproved ? ("approved" as const) : ("pending" as const),
    requestType,
    decidedAt: keepApproved ? existing.decidedAt : null,
    updatedAt: new Date(),
  };
  const [profile] = await db
    .insert(ownerProfiles)
    .values({ userId, ...values })
    .onConflictDoUpdate({ target: ownerProfiles.userId, set: values })
    .returning();
  return NextResponse.json(profile);
}
