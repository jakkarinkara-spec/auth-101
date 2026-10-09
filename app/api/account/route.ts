import { auth } from "@/auth";
import { db } from "@/app/db/index";
import { ownerProfiles, usersTable } from "@/app/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

// ต้องตรงกับ NAME_MAX ใน app/(site)/account/account-forms.tsx
const NAME_MAX = 200;

// แก้ชื่อบัญชีของผู้ใช้ที่ล็อกอิน (อีเมลแก้ไม่ได้ — ใช้ล็อกอิน) — มีผลทันที ไม่ต้องรอ admin อนุมัติ
// ชื่อบัญชี = ชื่อเจ้าของเรือ → อัปเดต owner_profiles.full_name ตาม โดยไม่เปลี่ยนสถานะการอนุมัติ
// และอัปเดตชื่อใน approved_data ด้วย (ไม่ให้หน้า admin แสดงชื่อเป็นสิ่งที่ "เปลี่ยน" ในคำขอแก้ไขครั้งหน้า)
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = (await req.json().catch(() => null)) as { name?: unknown } | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
  }
  if (name.length > NAME_MAX) {
    return NextResponse.json({ message: `Name must be at most ${NAME_MAX} characters` }, { status: 400 });
  }

  const [current] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!current) {
    return NextResponse.json({ message: "Account not found" }, { status: 404 });
  }
  if (current.name === name) {
    return NextResponse.json({ message: "Name is unchanged" }, { status: 409 });
  }

  const [user] = await db.update(usersTable).set({ name }).where(eq(usersTable.id, userId)).returning({ name: usersTable.name });

  await db
    .update(ownerProfiles)
    .set({
      fullName: name,
      approvedData: sql`case when ${ownerProfiles.approvedData} is null then null else jsonb_set(${ownerProfiles.approvedData}, '{fullName}', to_jsonb(${name}::text)) end`,
    })
    .where(eq(ownerProfiles.userId, userId));

  return NextResponse.json({ name: user.name });
}
