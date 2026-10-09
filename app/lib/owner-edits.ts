import { and, eq, isNotNull, sql } from 'drizzle-orm';
import { db } from '@/app/db/index';
import { ownerProfileEdits, ownerProfiles } from '@/app/db/schema';

export type OwnerEditDecision =
  | { action: 'approve'; by: string }
  | { action: 'reject'; by: string; reason: string }
  | { action: 'cancel' }; // เจ้าของเรือยกเลิกเอง

const STATUS = { approve: 'approved', reject: 'rejected', cancel: 'cancelled' } as const;

// ปิดคำขอแก้ข้อมูลเจ้าของเรือที่ค้างอยู่ (owner_profiles.pending_data) แล้วบันทึกลงประวัติ owner_profile_edits
//   approve → ใช้ค่าที่ขอแก้, reject → ทิ้งคำขอ + เหตุผล, cancel → ทิ้งคำขอ — สถานะยัง approved ทุกกรณี
// อ่านคำขอก่อน (approve เขียนทับคอลัมน์หลัก และทุกกรณีล้าง pending_data — RETURNING ให้ค่าเดิมไม่ได้)
// แล้ว UPDATE โดยเช็ค updated_at ตรงกับที่อ่าน กันคำขอเปลี่ยนระหว่างนั้น (ยกเลิก / ส่งใหม่ / admin อีกคนตัดสิน)
// คืน false = ไม่มีคำขอค้างอยู่ (หรือถูกปิดไปก่อนแล้ว)
export async function closeOwnerEdit(userId: string, d: OwnerEditDecision): Promise<boolean> {
  const [cur] = await db
    .select({
      phone: ownerProfiles.phone,
      address: ownerProfiles.address,
      contactEmail: ownerProfiles.contactEmail,
      pendingData: ownerProfiles.pendingData,
      updatedAt: ownerProfiles.updatedAt,
    })
    .from(ownerProfiles)
    .where(and(eq(ownerProfiles.userId, userId), eq(ownerProfiles.status, 'approved'), isNotNull(ownerProfiles.pendingData)))
    .limit(1);
  const requested = cur?.pendingData;
  if (!cur || !requested) return false;

  const set =
    d.action === 'approve'
      ? {
          phone: requested.phone,
          address: requested.address,
          contactEmail: requested.contactEmail,
          approvedData: sql`jsonb_build_object('fullName', ${ownerProfiles.fullName}, 'phone', ${requested.phone}::text, 'address', ${requested.address}::text)`,
          pendingData: null,
          rejectReason: null,
          decidedAt: new Date(),
        }
      : d.action === 'reject'
        ? { pendingData: null, rejectReason: d.reason, decidedAt: new Date() }
        : { pendingData: null, updatedAt: new Date() };
  const [closed] = await db
    .update(ownerProfiles)
    .set(set)
    .where(
      and(
        eq(ownerProfiles.userId, userId),
        eq(ownerProfiles.status, 'approved'),
        isNotNull(ownerProfiles.pendingData),
        eq(ownerProfiles.updatedAt, cur.updatedAt),
      ),
    )
    .returning({ userId: ownerProfiles.userId });
  if (!closed) return false;

  // บันทึกประวัติหลัง UPDATE สำเร็จ (neon-http ไม่มี transaction — ถ้า insert พลาด คำขอยังถูกตัดสินแล้ว แค่ไม่มีในประวัติ)
  try {
    await db.insert(ownerProfileEdits).values({
      userId,
      before: { phone: cur.phone, address: cur.address, contactEmail: cur.contactEmail },
      requested: { phone: requested.phone, address: requested.address, contactEmail: requested.contactEmail },
      status: STATUS[d.action],
      rejectReason: d.action === 'reject' ? d.reason : null,
      decidedBy: d.action === 'cancel' ? null : d.by,
      submittedAt: cur.updatedAt,
    });
  } catch (err) {
    console.error('owner_profile_edits insert failed', err);
  }
  return true;
}
