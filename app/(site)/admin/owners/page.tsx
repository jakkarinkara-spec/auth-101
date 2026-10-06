import { asc, eq } from 'drizzle-orm';
import { db } from '@/app/db/index';
import { ownerProfiles, usersTable } from '@/app/db/schema';
import { heading } from '../../_components/ui';
import { REQUEST_KIND, type RequestKind } from '../../_components/styles';
import ApplicationActions from '../application-actions';
import { RequestKindBadge, RequestKindLegend } from '../request-kind';
import { adminSession } from '../guard';

// owner_profiles.request_type → ประเภทคำขอที่ใช้กำหนดสี
const KIND: Record<'new' | 'edit' | 'resubmit', RequestKind> = { new: 'create', edit: 'edit', resubmit: 'resubmit' };
const LABEL = { new: 'สมัครใหม่', edit: 'แก้ไขข้อมูล', resubmit: 'ส่งใหม่หลังไม่ผ่าน' };
const FIELDS = [
  { key: 'fullName', label: 'ชื่อ' },
  { key: 'phone', label: 'โทร' },
  { key: 'address', label: 'ที่อยู่' },
] as const;

// /admin/owners — ผู้สมัครเป็นเจ้าของเรือที่รออนุมัติตัวบุคคล (ขั้นที่ 1)
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
      rejectReason: ownerProfiles.rejectReason,
      updatedAt: ownerProfiles.updatedAt,
      userEmail: usersTable.email,
    })
    .from(ownerProfiles)
    .innerJoin(usersTable, eq(ownerProfiles.userId, usersTable.id))
    .where(eq(ownerProfiles.status, 'pending'))
    .orderBy(asc(ownerProfiles.updatedAt));

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className={`${heading} text-[40px] leading-tight`}>ผู้สมัครเจ้าของเรือ</h1>
        <p className="text-[15px] text-(--nl-muted)">
          ขั้นที่ 1: อนุมัติตัวบุคคล — อนุมัติแล้วผู้สมัครเป็นเจ้าของเรือและส่งคำขอเพิ่มเรือได้ (เจ้าของจะเห็นชื่อและอีเมลลูกค้าที่จองเรือตัวเอง) ตรวจตัวตนจากเบอร์โทรก่อนอนุมัติ
        </p>
      </div>
      <RequestKindLegend
        kinds={[
          { kind: 'create', label: 'สมัครใหม่', note: 'ยังไม่เคยอนุมัติ' },
          { kind: 'edit', note: 'เจ้าของเรือแก้ชื่อ / เบอร์ / ที่อยู่ — ตรวจตัวตนใหม่' },
          { kind: 'resubmit', note: 'เคยถูกปฏิเสธ แล้วแก้ไขส่งมาใหม่' },
        ]}
      />
      {applicants.length === 0 ? (
        <p className="rounded-[20px] border border-dashed border-[#B7C7CB] bg-white p-10 text-center text-(--nl-muted)">ไม่มีผู้สมัครที่รออนุมัติ</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {applicants.map((p) => {
            const kind = KIND[p.requestType];
            const changed = p.requestType === 'edit' && p.approvedData ? FIELDS.filter((f) => p.approvedData![f.key] !== p[f.key]) : [];
            return (
              <li
                key={p.userId}
                className={`flex flex-wrap items-start justify-between gap-4 rounded-[16px] border border-l-4 border-(--nl-line) bg-white px-5 py-4 ${REQUEST_KIND[kind].bar}`}
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <RequestKindBadge kind={kind} label={LABEL[p.requestType]} />
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
                            <del className="text-(--nl-muted)">{p.approvedData![f.key]}</del>
                            <span aria-hidden="true">→</span>
                            <ins className="font-semibold text-[#9A4A00] no-underline">{p[f.key]}</ins>
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
                    โทร {p.phone}
                    {p.contactEmail && ` · อีเมลติดต่อ ${p.contactEmail}`}
                  </span>
                  <span className="text-sm whitespace-pre-line text-(--nl-muted)">ที่อยู่: {p.address}</span>
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
