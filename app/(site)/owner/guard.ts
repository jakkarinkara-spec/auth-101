import { cache } from 'react';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/app/db/index';
import { ownerProfiles } from '@/app/db/schema';

// ข้อมูลส่วนตัว / สถานะใบสมัครของผู้ใช้ (cache ต่อ request — layout กับหน้าใช้ query เดียวกัน)
export const getOwnerProfile = cache(async (userId: string) => {
  const [profile] = await db.select().from(ownerProfiles).where(eq(ownerProfiles.userId, userId)).limit(1);
  return profile ?? null;
});

// ต้นทุกหน้าใต้ /owner — ไม่ล็อกอิน → login แล้วกลับมาหน้าเดิม
export async function ownerContext(path: string) {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) redirect(`/login?callbackUrl=${encodeURIComponent(path)}`);
  const profile = await getOwnerProfile(user.id);
  return { user: { ...user, id: user.id }, profile, approved: profile?.status === 'approved' };
}

// หน้าที่ต้องผ่านการอนุมัติตัวบุคคลแล้ว (คำขอจอง / เรือ / คำขอเพิ่มเรือ) — ยังไม่ผ่านกลับไปหน้าสถานะใบสมัคร
// หมายเหตุ: สิทธิ์กับเรือแต่ละลำยังเช็คจาก boats.owner_id เสมอ (ทั้งหน้าและ API)
export async function approvedOwnerContext(path: string) {
  const ctx = await ownerContext(path);
  if (!ctx.approved) redirect('/owner');
  return ctx;
}
