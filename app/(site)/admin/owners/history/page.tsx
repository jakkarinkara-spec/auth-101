import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '@/app/db/index';
import { ownerProfileEdits, ownerProfiles, usersTable } from '@/app/db/schema';
import { heading } from '../../../_components/ui';
import { badge } from '../../../_components/styles';
import { adminSession } from '../../guard';

const LIMIT = 100;
const FIELDS = [
  { key: 'phone', label: 'โทร' },
  { key: 'address', label: 'ที่อยู่' },
  { key: 'contactEmail', label: 'อีเมลติดต่อ' },
] as const;
const STATUS = {
  approved: { label: 'อนุมัติ', className: 'bg-(--nl-tint) text-(--nl-teal-dk)', bar: 'border-l-(--nl-teal)' },
  rejected: { label: 'ไม่อนุมัติ', className: 'bg-[#FDECEC] text-[#B42318]', bar: 'border-l-[#B42318]' },
  cancelled: { label: 'ยกเลิกโดยเจ้าของเรือ', className: 'bg-[#EDF1F1] text-[#6B7C84]', bar: 'border-l-[#B7C7CB]' },
} as const;

const owner = alias(usersTable, 'owner');
const admin = alias(usersTable, 'admin');

const when = (d: Date) =>
  d.toLocaleString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });

// /admin/owners/history — ประวัติคำขอแก้ข้อมูลเจ้าของเรือที่ตัดสินแล้ว (อนุมัติ / ไม่อนุมัติ / เจ้าของเรือยกเลิก)
// ใหม่สุดก่อน — คำขอที่ยังรอตรวจอยู่ที่ /admin/owners
export default async function OwnerEditHistory() {
  if (!(await adminSession('/admin/owners/history'))) return null;

  const rows = await db
    .select({
      id: ownerProfileEdits.id,
      before: ownerProfileEdits.before,
      requested: ownerProfileEdits.requested,
      status: ownerProfileEdits.status,
      rejectReason: ownerProfileEdits.rejectReason,
      submittedAt: ownerProfileEdits.submittedAt,
      decidedAt: ownerProfileEdits.decidedAt,
      ownerName: ownerProfiles.fullName,
      ownerEmail: owner.email,
      adminName: admin.name,
      adminEmail: admin.email,
    })
    .from(ownerProfileEdits)
    .innerJoin(owner, eq(ownerProfileEdits.userId, owner.id))
    .leftJoin(ownerProfiles, eq(ownerProfileEdits.userId, ownerProfiles.userId))
    .leftJoin(admin, eq(ownerProfileEdits.decidedBy, admin.id))
    .orderBy(desc(ownerProfileEdits.decidedAt))
    .limit(LIMIT);

  return (
    <>
      <div className="flex flex-col gap-2">
        <p className="text-[15px] text-(--nl-muted)">
          <Link href="/admin/owners" className="text-(--nl-teal) hover:text-(--nl-teal-dk)">
            ผู้สมัครเจ้าของเรือ
          </Link>{' '}
          / ประวัติคำขอแก้ไข
        </p>
        <h1 className={`${heading} text-[40px] leading-tight`}>ประวัติคำขอแก้ไข</h1>
        <p className="text-[15px] text-(--nl-muted)">
          คำขอแก้เบอร์ / ที่อยู่ / อีเมลติดต่อของเจ้าของเรือที่ตัดสินแล้ว ใหม่สุดก่อน (แสดง {LIMIT} รายการล่าสุด)
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-[20px] border border-dashed border-[#B7C7CB] bg-white p-10 text-center text-(--nl-muted)">ยังไม่มีประวัติคำขอแก้ไข</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((r) => {
            const s = STATUS[r.status];
            const changed = FIELDS.filter((f) => (r.before[f.key] ?? '') !== (r.requested[f.key] ?? ''));
            return (
              <li key={r.id} className={`flex flex-col gap-2 rounded-[16px] border border-l-4 border-(--nl-line) bg-white px-5 py-4 ${s.bar}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`${badge} ${s.className}`}>{s.label}</span>
                  <span className="font-semibold">{r.ownerName ?? r.ownerEmail}</span>
                  <span className="text-[15px] text-(--nl-muted)">บัญชี {r.ownerEmail}</span>
                </div>

                <dl className="flex flex-col gap-1 rounded-xl bg-(--nl-bg) px-3.5 py-2.5 text-[15px]">
                  {changed.map((f) => (
                    <div key={f.key} className="flex flex-wrap gap-x-2">
                      <dt className="font-semibold">{f.label}:</dt>
                      <dd className="flex flex-wrap items-center gap-x-2">
                        <del className="whitespace-pre-line text-(--nl-muted)">{r.before[f.key] || '—'}</del>
                        <span aria-hidden="true">→</span>
                        <ins className="font-semibold whitespace-pre-line no-underline">{r.requested[f.key] || '—'}</ins>
                      </dd>
                    </div>
                  ))}
                </dl>

                {r.status === 'rejected' && r.rejectReason && (
                  <p className="rounded-xl bg-[#FDECEC] px-3.5 py-2.5 text-[15px] text-[#B42318]">
                    <strong>เหตุผล:</strong> {r.rejectReason}
                  </p>
                )}

                <span className="text-[13px] text-(--nl-muted)">
                  ส่งคำขอ {when(r.submittedAt)} · {r.status === 'cancelled' ? 'ยกเลิก' : 'ตัดสิน'} {when(r.decidedAt)}
                  {r.status !== 'cancelled' && ` โดย ${r.adminName ?? r.adminEmail ?? 'ผู้ดูแลระบบ (ลบบัญชีแล้ว)'}`}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
