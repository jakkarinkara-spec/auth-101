import { cache } from 'react';
import { db } from '@/app/db/index';
import { usersTable } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

// role ไม่ได้อยู่ใน JWT — อ่านจาก DB ทุกครั้ง จะได้มีผลทันทีเมื่อเปลี่ยน role
// cache(): SiteNav กับหน้า /admin เรียกใน request เดียวกัน query แค่ครั้งเดียว
export const isAdmin = cache(async (userId: string): Promise<boolean> => {
  const [user] = await db
    .select({ role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  return user?.role === 'admin';
});
