import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/app/db/index';
import { ownerApplications } from '@/app/db/schema';
import { heading } from '../../_components/ui';
import { APP_STATUS, badge } from '../../_components/styles';
import { approvedOwnerContext } from '../guard';

// /owner/boat-requests — คำขอเพิ่มเรือของผู้ใช้ + สถานะ (รออนุมัติ / อนุมัติแล้ว / ไม่อนุมัติ)
export default async function OwnerBoatRequests() {
  const { user } = await approvedOwnerContext('/owner/boat-requests');

  const apps = await db
    .select({
      id: ownerApplications.id,
      status: ownerApplications.status,
      createdAt: ownerApplications.createdAt,
      decidedAt: ownerApplications.decidedAt,
      rejectReason: ownerApplications.rejectReason,
      boat: ownerApplications.boatData,
      boatId: ownerApplications.boatId,
    })
    .from(ownerApplications)
    .where(eq(ownerApplications.userId, user.id))
    .orderBy(desc(ownerApplications.createdAt));

  const date = (d: Date) => d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', timeZone: 'Asia/Bangkok' });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className={`${heading} text-[40px] leading-tight`}>คำขอเพิ่มเรือ</h1>
          <p className="text-[15px] text-(--nl-muted)">ผู้ดูแลระบบตรวจและอนุมัติรายลำ — อนุมัติแล้วเรือขึ้นในเมนู &quot;เรือของฉัน&quot; และเปิดรับจองทันที</p>
        </div>
        <Link href="/owner/boat-requests/new" className="rounded-xl bg-(--nl-teal) px-5 py-2.5 font-semibold text-white hover:bg-(--nl-teal-dk)">
          + ขอเพิ่มเรือ
        </Link>
      </div>

      {apps.length === 0 ? (
        <p className="rounded-[20px] border border-dashed border-[#B7C7CB] bg-white p-10 text-center text-(--nl-muted)">ยังไม่มีคำขอเพิ่มเรือ</p>
      ) : (
        <ul className="divide-y divide-(--nl-divider) rounded-[20px] border border-(--nl-line) bg-white">
          {apps.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span>
                  <strong>{a.boat.name}</strong>{' '}
                  <span className="text-sm text-(--nl-muted)">
                    · ท่าเรือ{a.boat.port} · {a.boat.kind} · รับ {a.boat.seats} คน
                  </span>
                </span>
                <span className="text-[13px] text-(--nl-muted)">
                  ส่งเมื่อ {date(a.createdAt)}
                  {a.decidedAt && ` · ตัดสินเมื่อ ${date(a.decidedAt)}`}
                </span>
                {a.status === 'rejected' && a.rejectReason && (
                  <span className="mt-1 rounded-lg bg-[#FDECEC] px-3 py-2 text-sm text-[#B42318]">
                    <strong>เหตุผลที่ไม่อนุมัติ:</strong> {a.rejectReason}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {a.boatId && (
                  <Link href={`/owner/boats/${a.boatId}`} className="text-sm font-semibold text-(--nl-teal) hover:text-(--nl-teal-dk)">
                    จัดการเรือ →
                  </Link>
                )}
                <span className={`${badge} ${APP_STATUS[a.status].className}`}>{APP_STATUS[a.status].label}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
