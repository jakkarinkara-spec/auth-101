import { asc, eq } from 'drizzle-orm';
import { db } from '@/app/db/index';
import { ownerApplications, ownerProfiles, usersTable } from '@/app/db/schema';
import { TRIPS, baht, boatPrice } from '@/app/lib/boats';
import { heading } from '../../_components/ui';
import { REQUEST_KIND } from '../../_components/styles';
import ApplicationActions from '../application-actions';
import { RequestKindBadge, RequestKindLegend } from '../request-kind';
import { adminSession } from '../guard';

// /admin/boat-requests — คำขอเพิ่มเรือที่รออนุมัติรายลำ (ขั้นที่ 2) พร้อมสถานะการอนุมัติตัวบุคคลของผู้ส่ง
export default async function AdminBoatRequests() {
  if (!(await adminSession('/admin/boat-requests'))) return null;

  const applications = await db
    .select({
      id: ownerApplications.id,
      phone: ownerApplications.phone,
      note: ownerApplications.note,
      createdAt: ownerApplications.createdAt,
      boat: ownerApplications.boatData,
      userName: usersTable.name,
      userEmail: usersTable.email,
      fullName: ownerProfiles.fullName,
      address: ownerProfiles.address,
      contactEmail: ownerProfiles.contactEmail,
      ownerStatus: ownerProfiles.status,
    })
    .from(ownerApplications)
    .innerJoin(usersTable, eq(ownerApplications.userId, usersTable.id))
    .leftJoin(ownerProfiles, eq(ownerApplications.userId, ownerProfiles.userId))
    .where(eq(ownerApplications.status, 'pending'))
    .orderBy(asc(ownerApplications.createdAt));

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className={`${heading} text-[40px] leading-tight`}>คำขอเพิ่มเรือ</h1>
        <p className="text-[15px] text-(--nl-muted)">
          ขั้นที่ 2: อนุมัติรายลำ — อนุมัติแล้วระบบสร้างเรือตามข้อมูลนี้ โดยผู้ส่งเป็นเจ้าของ (แก้ข้อมูลภายหลังได้ที่หน้าแก้ไขเรือ) ผู้ส่งต้องผ่านการอนุมัติตัวบุคคลก่อน
        </p>
      </div>
      <RequestKindLegend kinds={[{ kind: 'create', label: 'เพิ่มเรือใหม่', note: 'อนุมัติแล้วระบบสร้างเรือลำใหม่' }]} />
      {applications.length === 0 ? (
        <p className="rounded-[20px] border border-dashed border-[#B7C7CB] bg-white p-10 text-center text-(--nl-muted)">ไม่มีคำขอที่รออนุมัติ</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {applications.map((a) => (
            <li
              key={a.id}
              className={`flex flex-wrap items-start justify-between gap-4 rounded-[16px] border border-l-4 border-(--nl-line) bg-white px-5 py-4 ${REQUEST_KIND.create.bar}`}
            >
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <RequestKindBadge kind="create" label="เพิ่มเรือใหม่" />
                  <span className="font-semibold">{a.fullName ?? a.userName ?? '—'}</span>
                  <span className="text-[15px] text-(--nl-muted)">บัญชี {a.userEmail}</span>
                  {a.ownerStatus !== 'approved' && <span className="text-sm font-semibold text-[#B42318]">ยังไม่ได้อนุมัติตัวบุคคล</span>}
                </div>
                <span className="text-[15px]">
                  โทร {a.phone}
                  {a.contactEmail && ` · อีเมลติดต่อ ${a.contactEmail}`}
                </span>
                {a.address && <span className="text-sm whitespace-pre-line text-(--nl-muted)">ที่อยู่: {a.address}</span>}
                <div className="mt-1 flex flex-col gap-0.5 rounded-xl bg-(--nl-bg) px-3.5 py-2.5 text-[15px]">
                  <span>
                    เรือ <strong>{a.boat.name}</strong> · ท่าเรือ{a.boat.port} · {a.boat.kind} · ยาว {a.boat.lengthM} ม. · รับ {a.boat.seats} คน
                  </span>
                  <span className="text-sm text-(--nl-muted)">
                    กัปตัน{a.boat.captain}
                    {a.boat.tags.length > 0 && ` · ${a.boat.tags.join(', ')}`}
                  </span>
                  <span className="text-sm text-(--nl-muted)">
                    {TRIPS.map((t) => {
                      const price = boatPrice(a.boat, t.id);
                      return `${t.label} ${price === null ? '—' : baht(price)}`;
                    }).join(' · ')}
                  </span>
                  {a.boat.description && <span className="text-sm text-(--nl-muted)">{a.boat.description}</span>}
                </div>
                {a.note && <span className="text-sm text-(--nl-muted)">หมายเหตุ: {a.note}</span>}
                <span className="text-[13px] text-(--nl-muted)">
                  ส่งเมื่อ {a.createdAt.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', timeZone: 'Asia/Bangkok' })}
                </span>
              </div>
              <ApplicationActions url={`/api/owner-applications/${a.id}`} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
