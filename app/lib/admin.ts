import { cache } from 'react';
import { db } from '@/app/db/index';
import { boats, ownerProfiles, usersTable } from '@/app/db/schema';
import { and, eq, isNotNull, or } from 'drizzle-orm';

// owner_profiles ที่รอ admin ตรวจ: ใบสมัคร (pending) + คำขอแก้ไขของเจ้าของเรือที่อนุมัติแล้ว (มี pending_data)
// ใช้ทั้งรายการ /admin/owners และตัวเลขในเมนู / หน้าภาพรวม
export const OWNER_REVIEW_WHERE = or(
  eq(ownerProfiles.status, 'pending'),
  and(eq(ownerProfiles.status, 'approved'), isNotNull(ownerProfiles.pendingData)),
);

// ข้อมูลบัญชีล่าสุดจาก DB (ชื่อ / อีเมล / role) — JWT เก็บค่าตอนล็อกอิน ถ้าแก้ชื่อหรือเปลี่ยน role จะไม่อัปเดตจนล็อกอินใหม่
// cache(): หลาย component เรียกใน request เดียวกัน query แค่ครั้งเดียว
export const getAccount = cache(async (userId: string) => {
  const [user] = await db
    .select({ name: usersTable.name, email: usersTable.email, role: usersTable.role, phones: usersTable.phones })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  return user ?? null;
});

export const getRole = async (userId: string) => (await getAccount(userId))?.role ?? null;

export const isAdmin = async (userId: string): Promise<boolean> => (await getRole(userId)) === 'admin';

// สิทธิ์จัดการเรือหนึ่งลำ (วันปิด / เปิด-ปิดเรือ / ยืนยัน-ยกเลิกคำขอจอง) = admin หรือเป็นเจ้าของเรือลำนั้นจริง
// เช็คจาก boats.owner_id เสมอ — role "owner" ใช้แค่แสดงเมนู ไม่ได้ให้สิทธิ์กับเรือทุกลำ
export async function canManageBoat(userId: string, boatId: string): Promise<boolean> {
  if (await isAdmin(userId)) return true;
  const [own] = await db
    .select({ id: boats.id })
    .from(boats)
    .where(and(eq(boats.id, boatId), eq(boats.ownerId, userId)))
    .limit(1);
  return Boolean(own);
}

// subquery id ของเรือที่ผู้ใช้เป็นเจ้าของ — ใช้ใน WHERE ... IN (...) ให้เช็คสิทธิ์ใน statement เดียวกับการแก้ข้อมูล
export const ownedBoatIds = (userId: string) => db.select({ id: boats.id }).from(boats).where(eq(boats.ownerId, userId));
