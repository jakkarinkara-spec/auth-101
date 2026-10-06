import { auth } from "@/auth";
import { db } from "@/app/db/index";
import { boatClosures } from "@/app/db/schema";
import { isAdmin } from "@/app/lib/admin";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string; closureId: string }> };

// เปิดรับจองวันนั้นกลับ = ลบวันปิด (admin เท่านั้น)
export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (!(await isAdmin(session.user.id))) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id, closureId } = await params;
  const [deleted] = await db
    .delete(boatClosures)
    .where(and(eq(boatClosures.id, closureId), eq(boatClosures.boatId, id)))
    .returning({ id: boatClosures.id });
  if (!deleted) {
    return NextResponse.json({ message: "Closure not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
