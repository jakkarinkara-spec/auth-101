import { auth } from "@/auth";
import { db } from "@/app/db/index";
import { ownerApplications, ownerProfiles } from "@/app/db/schema";
import { and, count, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { parseBoatBody } from "../boats/validate";

// ส่งคำขอที่รออนุมัติได้พร้อมกันไม่เกินกี่รายการต่อผู้ใช้ (กันสแปม)
const MAX_PENDING = 3;

// ผู้ใช้ส่งคำขอเป็นเจ้าของเรือ พร้อมข้อมูลเรือของตัวเอง — admin อนุมัติแล้วระบบสร้างเรือให้ที่หน้า /admin
// ต้องผ่านการอนุมัติตัวบุคคล (owner_profiles.status = approved) ก่อน — เบอร์โทรในคำขอคัดลอกมาจากข้อมูลส่วนตัว ณ ตอนส่ง
// body: { boat: <ฟิลด์เดียวกับ POST /api/boats>, note? }
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const [profile] = await db
    .select({ phone: ownerProfiles.phone, status: ownerProfiles.status })
    .from(ownerProfiles)
    .where(eq(ownerProfiles.userId, userId))
    .limit(1);
  if (!profile) {
    return NextResponse.json({ message: "Owner profile is required before applying" }, { status: 409 });
  }
  if (profile.status !== "approved") {
    return NextResponse.json({ message: "Owner is not approved yet" }, { status: 409 });
  }

  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const note = typeof b?.note === "string" && b.note.trim() ? b.note.trim().slice(0, 1000) : null;

  // ตรวจข้อมูลเรือด้วยกฎเดียวกับที่ admin เพิ่มเรือ
  const boat = parseBoatBody(b?.boat);
  if ("error" in boat) {
    return NextResponse.json({ message: boat.error }, { status: 400 });
  }

  const [pending] = await db
    .select({ n: count() })
    .from(ownerApplications)
    .where(and(eq(ownerApplications.userId, userId), eq(ownerApplications.status, "pending")));
  if (pending.n >= MAX_PENDING) {
    return NextResponse.json({ message: `You already have ${MAX_PENDING} pending applications` }, { status: 409 });
  }

  const [application] = await db
    .insert(ownerApplications)
    .values({ userId, boatData: boat.data, phone: profile.phone, note })
    .returning({ id: ownerApplications.id, status: ownerApplications.status });
  return NextResponse.json(application, { status: 201 });
}
