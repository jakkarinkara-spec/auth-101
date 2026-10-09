import Link from 'next/link';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/app/db/index';
import { ownerProfiles, usersTable } from '@/app/db/schema';
import { heading } from '../../_components/ui';
import { REQUEST_KIND, type RequestKind } from '../../_components/styles';
import ApplicationActions from '../application-actions';
import { RequestKindBadge, RequestKindLegend } from '../request-kind';
import { adminSession } from '../guard';
import { OWNER_REVIEW_WHERE } from '@/app/lib/admin';

// owner_profiles.request_type → ประเภทคำขอที่ใช้กำหนดสี
const KIND: Record<'new' | 'edit' | 'resubmit', RequestKind> = { new: 'create', edit: 'edit', resubmit: 'resubmit' };
const LABEL = { new: 'สมัครใหม่', edit: 'แก้ไขข้อมูล', resubmit: 'ส่งใหม่หลังไม่ผ่าน' };
// ชื่อไม่อยู่ในรายการ — เปลี่ยนชื่อบัญชีได้ทันทีโดยไม่ต้องตรวจ
const FIELDS = [
  { key: 'phone', label: 'โทร' },
  { key: 'address', label: 'ที่อยู่' },
  { key: 'contactEmail', label: 'อีเมลติดต่อ' },
] as const;
type Identity = { phone: string; address: string; contactEmail?: string | null };

// /admin/owners — ผู้สมัครเป็นเจ้าของเรือที่รออนุมัติตัวบุคคล (ขั้นที่ 1) + คำขอแก้ข้อมูลของเจ้าของเรือที่อนุมัติแล้ว
// สีแยกประเภท: สมัครใหม่ (เขียว) / แก้ไขข้อมูลหลังอนุมัติ (ส้ม — แสดงค่าเดิม → ค่าใหม่) / ส่งใหม่หลังไม่ผ่าน (ฟ้า)
export default async function AdminOwners() {
  if (!(await adminSession('/admin/owners'))) return null;

  const applicants = await db
    .select({
      userId: ownerProfiles.userId,
      fullName: ownerProfiles.fullName,
      phone: ownerProfiles.phone,
      address: ownerProfiles.address,
      contactEmail: ownerProfiles.contactEmail,
      requestType: ownerProfiles.requestType,
      approvedData: ownerProfiles.approvedData,
      pendingData: ownerProfiles.pendingData,
      rejectReason: ownerProfiles.rejectReason,
      updatedAt: ownerProfiles.updatedAt,
      userEmail: usersTable.email,
    })
    .from(ownerProfiles)
    .innerJoin(usersTable, eq(ownerProfiles.userId, usersTable.id))
    .where(OWNER_REVIEW_WHERE)
    .orderBy(asc(ownerProfiles.updatedAt));

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className={`${heading} text-[40px] leading-tight`}>ผู้สมัครเจ้าของเรือ</h1>
          <Link
            href="/admin/owners/history"
            className="rounded-xl border border-(--nl-line) bg-white px-4 py-2 text-[15px] font-semibold text-(--nl-teal) hover:bg-(--nl-bg)"
          >
            ประวัติคำขอแก้ไข →
          </Link>
        </div>
        <p className="text-[15px] text-(--nl-muted)">
          ขั้นที่ 1: อนุมัติตัวบุคคล — อนุมัติแล้วผู้สมัครเป็นเจ้าของเรือและส่งคำขอเพิ่มเรือได้ (เจ้าของจะเห็นชื่อและอีเมลลูกค้าที่จองเรือตัวเอง) ตรวจตัวตนจากเบอร์โทรก่อนอนุมัติ
        </p>
      </div>
      <RequestKindLegend
        kinds={[
          { kind: 'create', label: 'สมัครใหม่', note: 'ยังไม่เคยอนุมัติ' },
          { kind: 'edit', note: 'เจ้าของเรือแก้เบอร์ / ที่อยู่ / อีเมลติดต่อ — ระหว่างรอใช้ข้อมูลเดิม' },
          { kind: 'resubmit', note: 'เคยถูกปฏิเสธ แล้วแก้ไขส่งมาใหม่' },
        ]}
      />
      {applicants.length === 0 ? (
        <p className="rounded-[20px] border border-dashed border-[#B7C7CB] bg-white p-10 text-center text-(--nl-muted)">ไม่มีผู้สมัครหรือคำขอแก้ไขที่รออนุมัติ</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {applicants.map((p) => {
            // คำขอแก้ไข: ข้อมูลที่ใช้อยู่ → pending_data
            // (แถวแบบเก่าที่แก้แล้วกลับเป็น pending: ข้อมูลที่เคยอนุมัติ → คอลัมน์หลัก — ไม่มีอีเมลติดต่อให้เทียบ)
            const live: Identity = { phone: p.phone, address: p.address, contactEmail: p.contactEmail };
            const kind = p.pendingData ? 'edit' : KIND[p.requestType];
            const [before, after]: [Identity | null, Identity] = p.pendingData
              ? [live, p.pendingData]
              : [p.requestType === 'edit' ? p.approvedData : null, live];
            const changed = before ? FIELDS.filter((f) => f.key in before && (before[f.key] ?? '') !== (after[f.key] ?? '')) : [];
            return (
              <li
                key={p.userId}
                className={`flex flex-wrap items-start justify-between gap-4 rounded-[16px] border border-l-4 border-(--nl-line) bg-white px-5 py-4 ${REQUEST_KIND[kind].bar}`}
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <RequestKindBadge kind={kind} label={p.pendingData ? LABEL.edit : LABEL[p.requestType]} />
                    <span className="font-semibold">{p.fullName}</span>
                    <span className="text-[15px] text-(--nl-muted)">บัญชี {p.userEmail}</span>
                  </div>

                  {/* คำขอแก้ไข: ค่าที่เคยอนุมัติ → ค่าใหม่ */}
                  {changed.length > 0 && (
                    <dl className="mt-1 flex flex-col gap-1 rounded-xl bg-(--nl-accent-soft) px-3.5 py-2.5 text-[15px]">
                      {changed.map((f) => (
                        <div key={f.key} className="flex flex-wrap gap-x-2">
                          <dt className="font-semibold">{f.label}:</dt>
                          <dd className="flex flex-wrap items-center gap-x-2">
                            <del className="text-(--nl-muted)">{before![f.key] || '—'}</del>
                            <span aria-hidden="true">→</span>
                            <ins className="font-semibold text-[#9A4A00] no-underline">{after[f.key] || '—'}</ins>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  {/* ส่งใหม่หลังไม่ผ่าน: เหตุผลที่ไม่อนุมัติครั้งก่อน ให้ตรวจว่าแก้แล้วหรือยัง */}
                  {p.requestType === 'resubmit' && p.rejectReason && (
                    <p className="mt-1 rounded-xl bg-[#E5EFFA] px-3.5 py-2.5 text-[15px] text-[#1F5A9E]">
                      <strong>ไม่ผ่านครั้งก่อนเพราะ:</strong> {p.rejectReason}
                    </p>
                  )}

                  <span className="text-[15px]">
                    โทร {after.phone}
                    {after.contactEmail && ` · อีเมลติดต่อ ${after.contactEmail}`}
                  </span>
                  <span className="text-sm whitespace-pre-line text-(--nl-muted)">ที่อยู่: {after.address}</span>
                  <span className="text-[13px] text-(--nl-muted)">
                    ส่ง / แก้ไขล่าสุด{' '}
                    {p.updatedAt.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', timeZone: 'Asia/Bangkok' })}
                  </span>
                </div>
                <ApplicationActions url={`/api/owner-profiles/${p.userId}`} />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
