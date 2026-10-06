import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/app/db/index';
import { ownerProfiles } from '@/app/db/schema';
import { safeCallbackUrl } from '@/app/lib/redirect';
import { firstParam, type SearchParams } from '@/app/lib/search';
import { heading } from '../../_components/ui';
import ProfileForm from './profile-form';

// ข้อมูลส่วนตัวเจ้าของเรือ — ต้องกรอกก่อนสมัครเป็นเจ้าของเรือ (?next= = หน้าที่จะไปต่อหลังบันทึก)
export default async function OwnerProfilePage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) redirect('/login?callbackUrl=/owner/profile');

  const nextParam = firstParam((await searchParams).next);
  // บันทึกแล้วไปหน้า next (ค่าเริ่มต้น = แดชบอร์ดเจ้าของเรือ ซึ่งแสดงสถานะใบสมัคร)
  const next = (nextParam ? safeCallbackUrl(nextParam, '') : '') || '/owner';

  const [profile] = await db.select().from(ownerProfiles).where(eq(ownerProfiles.userId, user.id)).limit(1);

  return (
    <div className="flex max-w-[760px] flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className={`${heading} text-[40px] leading-tight`}>ข้อมูลเจ้าของเรือ</h1>
            <p className="text-[17px] leading-[1.7] text-(--nl-muted)">
              {profile
                ? 'ข้อมูลสำหรับติดต่อและยืนยันตัวตน'
                : 'ขั้นที่ 1 ของการเป็นเจ้าของเรือ — บันทึกแล้วส่งให้ผู้ดูแลระบบตรวจและอนุมัติ จากนั้นจึงขอเพิ่มเรือได้'}
            </p>
            {profile && (
              <p
                className={`rounded-xl px-4 py-3 text-[15px] ${
                  profile.status === 'approved'
                    ? 'bg-(--nl-tint) text-(--nl-teal-dk)'
                    : profile.status === 'pending'
                      ? 'bg-(--nl-accent-soft) text-[#9A4A00]'
                      : 'bg-[#FDECEC] text-[#B42318]'
                }`}
              >
                {profile.status === 'approved'
                  ? 'อนุมัติแล้ว — ถ้าแก้ชื่อ เบอร์โทร หรือที่อยู่ ต้องรอผู้ดูแลระบบตรวจใหม่ (ระหว่างนั้นขอเพิ่มเรือไม่ได้)'
                  : profile.status === 'pending'
                    ? 'รอผู้ดูแลระบบตรวจสอบ'
                    : `ไม่ผ่านการอนุมัติ — แก้ไขแล้วบันทึกเพื่อส่งตรวจใหม่${profile.rejectReason ? ` · เหตุผล: ${profile.rejectReason}` : ''}`}
              </p>
            )}
          </div>
          <ProfileForm
            next={next}
            defaultEmail={user.email ?? 'you@example.com'}
            initial={{
              fullName: profile?.fullName ?? user.name ?? '',
              phone: profile?.phone ?? '',
              address: profile?.address ?? '',
              contactEmail: profile?.contactEmail ?? '',
            }}
          />
    </div>
  );
}
