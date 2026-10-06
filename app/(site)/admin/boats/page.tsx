import Link from 'next/link';
import { and, asc, count, desc, eq, gte, ne } from 'drizzle-orm';
import { db } from '@/app/db/index';
import { boats, bookings, usersTable } from '@/app/db/schema';
import { TRIPS, baht, bangkokToday, boatPrice } from '@/app/lib/boats';
import { heading } from '../../_components/ui';
import ActiveToggle from './active-toggle';
import RemoveOwner from '../remove-owner';
import { adminSession } from '../guard';

// /admin/boats — เรือทั้งหมด (เปิดรับจองก่อน) + เพิ่ม / แก้ไข / เปิด-ปิด / ถอดเจ้าของ
export default async function AdminBoats() {
  if (!(await adminSession('/admin/boats'))) return null;

  const [boatList, boatLoad] = await Promise.all([
    db
      .select({ boat: boats, ownerEmail: usersTable.email })
      .from(boats)
      .leftJoin(usersTable, eq(boats.ownerId, usersTable.id))
      .orderBy(desc(boats.active), asc(boats.createdAt)),
    db
      .select({ boatId: bookings.boatId, n: count() })
      .from(bookings)
      .where(and(ne(bookings.status, 'cancelled'), gte(bookings.tripDate, bangkokToday())))
      .groupBy(bookings.boatId),
  ]);
  const upcomingByBoat = new Map(boatLoad.map((b) => [b.boatId, b.n]));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className={`${heading} text-[40px] leading-tight`}>เรือ</h1>
        <Link href="/admin/boats/new" className="rounded-xl bg-(--nl-teal) px-5 py-2.5 font-semibold text-white hover:bg-(--nl-teal-dk)">
          + เพิ่มเรือ
        </Link>
      </div>
      <div className="overflow-x-auto rounded-[20px] border border-(--nl-line) bg-white">
        <table className="w-full min-w-[1120px] text-left text-[15px]">
          <thead className="border-b border-(--nl-divider) text-[13px] text-(--nl-muted)">
            <tr>
              <th className="px-5 py-3 font-medium">เรือ</th>
              <th className="px-5 py-3 font-medium">ท่าเรือ</th>
              <th className="px-5 py-3 font-medium">รับได้</th>
              <th className="px-5 py-3 font-medium">เจ้าของ</th>
              {TRIPS.map((t) => (
                <th key={t.id} className="px-5 py-3 text-right font-medium">
                  {t.label}
                </th>
              ))}
              <th className="px-5 py-3 text-right font-medium">จองที่ยังไม่ถึงวัน</th>
              <th className="px-5 py-3 text-right font-medium">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {boatList.map(({ boat: b, ownerEmail }) => (
              <tr key={b.id} className={`border-b border-(--nl-divider) last:border-0 ${b.active ? '' : 'bg-[#F7F9F9] text-(--nl-muted)'}`}>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/boats/${b.id}`} className="font-semibold text-(--nl-teal) hover:text-(--nl-teal-dk)">
                      {b.name}
                    </Link>
                    {!b.active && <span className="rounded-full bg-[#EDF1F1] px-2 py-0.5 text-[12px] font-semibold text-[#6B7C84]">ปิดรับจอง</span>}
                  </div>
                  <div className="text-[13px] text-(--nl-muted)">
                    {b.kind} · กัปตัน{b.captain}
                  </div>
                </td>
                <td className="px-5 py-4">{b.port}</td>
                <td className="px-5 py-4">{b.seats} คน</td>
                <td className="px-5 py-4 align-top">
                  {ownerEmail ? (
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-sm">{ownerEmail}</span>
                      <RemoveOwner boatId={b.id} />
                    </div>
                  ) : (
                    <span className="text-(--nl-muted)">—</span>
                  )}
                </td>
                {TRIPS.map((t) => {
                  const price = boatPrice(b, t.id);
                  return (
                    <td key={t.id} className="px-5 py-4 text-right tabular-nums">
                      {price === null ? <span className="text-(--nl-muted)">—</span> : baht(price)}
                    </td>
                  );
                })}
                <td className="px-5 py-4 text-right tabular-nums">{upcomingByBoat.get(b.id) ?? 0}</td>
                <td className="px-5 py-4 align-top">
                  <div className="flex items-start justify-end gap-2">
                    <Link
                      href={`/admin/boats/${b.id}`}
                      className="rounded-lg border border-(--nl-field) bg-white px-3 py-1.5 text-sm text-(--nl-ink) hover:border-(--nl-teal) hover:text-(--nl-teal)"
                    >
                      แก้ไข
                    </Link>
                    <ActiveToggle id={b.id} active={b.active} upcoming={upcomingByBoat.get(b.id) ?? 0} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
