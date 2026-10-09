import { auth } from "@/auth";
import { db } from "@/app/db/index";
import { usersTable } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { isValidPhone } from "../../owner-profile/validate";

// ต้องตรงกับ PHONES_MAX ใน app/(site)/account/account-forms.tsx
const PHONES_MAX = 3;

// ตั้งเบอร์ติดต่อของผู้ใช้ที่ล็อกอิน (ส่งรายการทั้งหมดมาแทนของเดิม) — 0–3 เบอร์, รูปแบบถูกต้อง, ไม่ซ้ำกัน
// body: { phones: string[] }  — ช่องว่างถูกตัดทิ้ง
export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = (await req.json().catch(() => null)) as { phones?: unknown } | null;
  if (!Array.isArray(body?.phones) || body.phones.some((p) => typeof p !== "string")) {
    return NextResponse.json({ message: "phones must be an array of strings" }, { status: 400 });
  }
  const phones = (body.phones as string[]).map((p) => p.trim()).filter(Boolean);

  if (phones.length > PHONES_MAX) {
    return NextResponse.json({ message: `At most ${PHONES_MAX} phone numbers` }, { status: 400 });
  }
  const invalid = phones.find((p) => !isValidPhone(p));
  if (invalid) {
    return NextResponse.json({ message: `Phone number is invalid: ${invalid}` }, { status: 400 });
  }
  // ซ้ำ = ตัวเลขเหมือนกัน (081-234-5678 กับ 0812345678 คือเบอร์เดียวกัน)
  const digits = phones.map((p) => p.replace(/\D/g, ""));
  if (new Set(digits).size !== digits.length) {
    return NextResponse.json({ message: "Duplicate phone numbers" }, { status: 400 });
  }

  const [current] = await db.select({ phones: usersTable.phones }).from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!current) {
    return NextResponse.json({ message: "Account not found" }, { status: 404 });
  }
  if (current.phones.length === phones.length && current.phones.every((p, i) => p === phones[i])) {
    return NextResponse.json({ message: "Phones are unchanged" }, { status: 409 });
  }

  const [user] = await db.update(usersTable).set({ phones }).where(eq(usersTable.id, userId)).returning({ phones: usersTable.phones });
  return NextResponse.json(user);
}
