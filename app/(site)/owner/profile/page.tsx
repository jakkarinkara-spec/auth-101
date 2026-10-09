import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { getAccount } from '@/app/lib/admin';
import { db } from '@/app/db/index';
import { ownerProfiles } from '@/app/db/schema';
import { safeCallbackUrl } from '@/app/lib/redirect';
import { firstParam, type SearchParams } from '@/app/lib/search';
import { heading } from '../../_components/ui';
import CancelEditRequest from './cancel-edit-request';
import ProfileForm from './profile-form';

const EDIT_FIELDS = [
  { key: 'phone', label: 'โทร' },
  { key: 'address', label: 'ที่อยู่' },
  { key: 'contactEmail', label: 'อีเมลติดต่อ' },
] as const;

// ข้อมูลส่วนตัวเจ้าของเรือ — ต้องกรอกก่อนสมัครเป็นเจ้าของเรือ (?next= = หน้าที่จะไปต่อหลังบันทึก)
export default async function OwnerProfilePage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) redirect('/login?callbackUrl=/owner/profile');

  const nextParam = firstParam((await searchParams).next);
  const [[profile], account] = await Promise.all([
    db.select().from(ownerProfiles).where(eq(ownerProfiles.userId, user.id)).limit(1),
    getAccount(user.id),
  ]);
  const approved = profile?.status === 'approved';
  // บันทึกแล้วไปหน้า next — ใบสมัคร: ค่าเริ่มต้น = แดชบอร์ดเจ้าของเรือ (แสดงสถานะใบสมัคร)
  // อนุมัติแล้ว: อยู่หน้าเดิมให้เห็นสถานะคำขอแก้ไข (เว้นแต่ส่ง ?next= มา)
  const next = (nextParam ? safeCallbackUrl(nextParam, '') : '') || (approved ? null : '/owner');
  // คำขอแก้ไขที่รอตรวจ — ข้อมูลที่ใช้อยู่ยังเป็นคอลัมน์หลัก
  const edit = approved ? profile.pendingData : null;

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-8">
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
                  ? 'อนุมัติแล้ว — ถ้าแก้เบอร์โทร ที่อยู่ หรืออีเมลติดต่อ ต้องส่งให้ผู้ดูแลระบบอนุมัติก่อน ระหว่างรอยังใช้ข้อมูลเดิม (เปลี่ยนชื่อที่หน้าโปรไฟล์ของฉันได้ทันที ไม่ต้องรอ)'
                  : profile.status === 'pending'
                    ? 'รอผู้ดูแลระบบตรวจสอบ'
                    : `ไม่ผ่านการอนุมัติ — แก้ไขแล้วบันทึกเพื่อส่งตรวจใหม่${profile.rejectReason ? ` · เหตุผล: ${profile.rejectReason}` : ''}`}
              </p>
            )}
            {edit ? (
              // มีคำขอรอตรวจ: แสดงข้อมูลที่ใช้อยู่ → ค่าที่ขอแก้ + ปุ่มยกเลิก (ไม่มีฟอร์มจนกว่าจะตัดสิน / ยกเลิก)
              <div className="rounded-xl bg-(--nl-accent-soft) px-4 py-3 text-[15px] text-[#9A4A00]">
                <p className="font-semibold">มีคำขอแก้ไขรอผู้ดูแลระบบอนุมัติ — ระหว่างนี้ยังใช้ข้อมูลเดิม</p>
                <dl className="mt-2 flex flex-col gap-1">
                  {EDIT_FIELDS.map((f) => {
                    const before = profile![f.key] || '—';
                    const after = edit[f.key] || '—';
                    return (
                      <div key={f.key} className="flex flex-wrap gap-x-2">
                        <dt className="font-semibold">{f.label}:</dt>
                        {before === after ? (
                          <dd className="whitespace-pre-line">{after}</dd>
                        ) : (
                          <dd className="flex flex-wrap items-center gap-x-2">
                            <del className="whitespace-pre-line opacity-70">{before}</del>
                            <span aria-hidden="true">→</span>
                            <ins className="font-semibold whitespace-pre-line no-underline">{after}</ins>
                          </dd>
                        )}
                      </div>
                    );
                  })}
                </dl>
                <p className="mt-2 text-[13px]">แก้เพิ่มไม่ได้จนกว่าผู้ดูแลระบบจะตรวจ — ถ้าต้องการเปลี่ยน ให้ยกเลิกคำขอแล้วส่งใหม่</p>
                <CancelEditRequest />
              </div>
            ) : (
              approved &&
              profile.rejectReason && (
                <p className="rounded-xl bg-[#FDECEC] px-4 py-3 text-[15px] text-[#B42318]">
                  คำขอแก้ไขล่าสุดไม่ผ่าน ยังใช้ข้อมูลเดิม · เหตุผล: {profile.rejectReason}
                </p>
              )
            )}
          </div>
          {/* มีคำขอแก้ไขรอตรวจ → ซ่อนฟอร์ม (ส่งใหม่ไม่ได้จนกว่าจะตัดสิน / ยกเลิก) */}
          {!edit && (
            <ProfileForm
              editRequest={approved}
              next={next}
              defaultEmail={user.email ?? 'you@example.com'}
              initial={{
                fullName: account?.name ?? account?.email.split('@')[0] ?? '', // ชื่อที่ลงทะเบียน (แสดงอย่างเดียว — แก้ที่ /account)
                phone: profile?.phone ?? '',
                address: profile?.address ?? '',
                contactEmail: profile?.contactEmail ?? '',
              }}
            />
          )}
    </div>
  );
}
