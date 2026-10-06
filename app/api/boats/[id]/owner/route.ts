import { auth } from "@/auth";
import { db } from "@/app/db/index";
import { boats } from "@/app/db/schema";
import { isAdmin } from "@/app/lib/admin";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

// admin ถอดเจ้าของเรือ (owner_id → null) — สิทธิ์ของเจ้าของเดิมกับเรือลำนี้หมดทันที เพราะทุกจุดเช็คจาก owner_id
// การตั้งเจ้าของใหม่ทำผ่านการอนุมัติคำขอ (/api/owner-applications/[id]) เท่านั้น
export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (!(await isAdmin(session.user.id))) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const [boat] = await db.update(boats).set({ ownerId: null }).where(eq(boats.id, id)).returning({ id: boats.id });
  if (!boat) return NextResponse.json({ message: "Boat not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
