import { cache } from 'react';
import { db } from '@/app/db/index';
import { boats, usersTable } from '@/app/db/schema';
import { and, eq } from 'drizzle-orm';

// role ไม่ได้อยู่ใน JWT — อ่านจาก DB ทุกครั้ง จะได้มีผลทันทีเมื่อเปลี่ยน role
// cache(): หลาย component เรียกใน request เดียวกัน query แค่ครั้งเดียว
export const getRole = cache(async (userId: string) => {
  const [user] = await db
    .select({ role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  return user?.role ?? null;
});

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
