import Link from 'next/link';
import { and, asc, count, desc, eq, gte, ne, sum } from 'drizzle-orm';
import { db } from '@/app/db/index';
import { boats, bookings, usersTable } from '@/app/db/schema';
import { TRIPS, addonLabel, baht, bangkokToday, boatPrice, thaiDate, tripLabel } from '@/app/lib/boats';
import { firstParam, type SearchParams } from '@/app/lib/search';
import { heading } from '../_components/ui';
import { STATUS_BADGE } from '../_components/styles';
import BookingActions from './booking-actions';
import ActiveToggle from './boats/active-toggle';
import { AdminHeader, NotAdmin, adminSession } from './guard';

const STATUS_TABS = [
  { id: 'pending', label: 'รอยืนยัน' },
  { id: 'confirmed', label: 'ยืนยันแล้ว' },
  { id: 'cancelled', label: 'ยกเลิก' },
  { id: 'all', label: 'ทั้งหมด' },
] as const;
type Tab = (typeof STATUS_TABS)[number]['id'];



export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await adminSession('/admin');
  if (!user) return <NotAdmin />;
  const header = <AdminHeader />;

  const statusParam = firstParam((await searchParams).status);
  const tab: Tab = STATUS_TABS.some((t) => t.id === statusParam) ? (statusParam as Tab) : 'pending';
  const today = bangkokToday();
  const upcoming = gte(bookings.tripDate, today);

  const [[pending], [confirmed], list, boatList, boatLoad] = await Promise.all([
    db.select({ n: count() }).from(bookings).where(and(eq(bookings.status, 'pending'), upcoming)),
    db.select({ n: count(), total: sum(bookings.total) }).from(bookings).where(and(eq(bookings.status, 'confirmed'), upcoming)),
    db
      // เลือกคอลัมน์เอง — ไม่ดึง password hash ของ users ติดมากับ join
      .select({
        id: bookings.id,
        tripDate: bookings.tripDate,
        tripType: bookings.tripType,
        guests: bookings.guests,
        addons: bookings.addons,
        total: bookings.total,
        deposit: bookings.deposit,
        status: bookings.status,
        createdAt: bookings.createdAt,
        boatName: boats.name,
        boatPort: boats.port,
        userName: usersTable.name,
        userEmail: usersTable.email,
      })
      .from(bookings)
      .innerJoin(boats, eq(bookings.boatId, boats.id))
      .innerJoin(usersTable, eq(bookings.userId, usersTable.id))
      .where(tab === 'all' ? undefined : eq(bookings.status, tab))
      .orderBy(tab === 'cancelled' || tab === 'all' ? desc(bookings.tripDate) : asc(bookings.tripDate), asc(bookings.createdAt)),
    // เปิดรับจองก่อน แล้วเรียงตามวันที่เพิ่ม
    db.select().from(boats).orderBy(desc(boats.active), asc(boats.createdAt)),
    db
      .select({ boatId: bookings.boatId, n: count() })
      .from(bookings)
      .where(and(ne(bookings.status, 'cancelled'), upcoming))
      .groupBy(bookings.boatId),
  ]);
  const upcomingByBoat = new Map(boatLoad.map((b) => [b.boatId, b.n]));

  const stats = [
    { label: 'คำขอรอยืนยัน', value: String(pending.n), note: 'ทริปที่ยังไม่ถึงวัน' },
    { label: 'ทริปที่ยืนยันแล้ว', value: String(confirmed.n), note: 'ตั้งแต่วันนี้เป็นต้นไป' },
    { label: 'ยอดจองที่ยืนยันแล้ว', value: baht(Number(confirmed.total ?? 0)), note: 'รวมทริปที่ยังไม่ถึงวัน' },
    {
      label: 'เรือเปิดรับจอง',
      value: String(boatList.filter((b) => b.active).length),
      note: `จากทั้งหมด ${boatList.length} ลำ`,
    },
  ];

  return (
    <>
      {header}
      <main className="px-6 pt-12 pb-24">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-10">
          <div className="flex flex-col gap-2">
            <p className="text-[15px] text-(--nl-muted)">ผู้ดูแลระบบ · {user.name ?? user.email}</p>
            <h1 className={`${heading} text-[44px] leading-tight`}>แดชบอร์ด</h1>
          </div>

          {/* Stats */}
          <section aria-label="สรุป" className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col gap-1 rounded-[20px] border border-(--nl-line) bg-white p-6">
                <span className="text-[15px] text-(--nl-muted)">{s.label}</span>
                <span className={`${heading} text-[34px] leading-tight`}>{s.value}</span>
                <span className="text-[13px] text-(--nl-muted)">{s.note}</span>
              </div>
            ))}
          </section>

          {/* Bookings */}
          <section aria-label="คำขอจอง" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className={`${heading} text-[28px]`}>คำขอจอง</h2>
              <div role="group" aria-label="สถานะ" className="flex flex-wrap gap-2">
                {STATUS_TABS.map((t) => (
                  <Link
                    key={t.id}
                    href={t.id === 'pending' ? '/admin' : `/admin?status=${t.id}`}
                    aria-current={t.id === tab ? 'true' : undefined}
                    scroll={false}
                    className={`flex min-h-10 items-center rounded-full border px-4 text-[15px] font-semibold ${
                      t.id === tab ? 'border-(--nl-navy) bg-(--nl-navy) text-white' : 'border-(--nl-field) bg-white hover:border-(--nl-navy)'
                    }`}
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>

            {list.length === 0 ? (
              <p className="rounded-[20px] border border-dashed border-[#B7C7CB] bg-white p-12 text-center text-(--nl-muted)">
                ไม่มีคำขอจองในสถานะนี้
              </p>
            ) : (
              <div className="overflow-x-auto rounded-[20px] border border-(--nl-line) bg-white">
                <table className="w-full min-w-[860px] text-left text-[15px]">
                  <thead className="border-b border-(--nl-divider) text-[13px] text-(--nl-muted)">
                    <tr>
                      <th className="px-5 py-3 font-medium">วันออกเรือ</th>
                      <th className="px-5 py-3 font-medium">เรือ / ทริป</th>
                      <th className="px-5 py-3 font-medium">ลูกค้า</th>
                      <th className="px-5 py-3 font-medium">คน / บริการเสริม</th>
                      <th className="px-5 py-3 text-right font-medium">ยอดรวม / มัดจำ</th>
                      <th className="px-5 py-3 font-medium">สถานะ</th>
                      <th className="px-5 py-3 text-right font-medium">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((b) => {
                      const past = b.tripDate < today;
                      const badge = STATUS_BADGE[b.status];
                      return (
                        <tr key={b.id} className={`border-b border-(--nl-divider) last:border-0 ${past ? 'text-(--nl-muted)' : ''}`}>
                          <td className="px-5 py-4 align-top">
                            <div className="font-semibold">{thaiDate(b.tripDate)}</div>
                            {past && <div className="text-[13px]">ผ่านไปแล้ว</div>}
                          </td>
                          <td className="px-5 py-4 align-top">
                            <div className="font-semibold">{b.boatName}</div>
                            <div className="text-[13px] text-(--nl-muted)">
                              {tripLabel(b.tripType)} · ท่าเรือ{b.boatPort}
                            </div>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <div>{b.userName ?? '—'}</div>
                            <div className="text-[13px] text-(--nl-muted)">{b.userEmail}</div>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <div>{b.guests} คน</div>
                            <div className="text-[13px] text-(--nl-muted)">{b.addons.length ? b.addons.map(addonLabel).join(', ') : '—'}</div>
                          </td>
                          <td className="px-5 py-4 text-right align-top tabular-nums">
                            <div className="font-semibold">{baht(b.total)}</div>
                            <div className="text-[13px] text-(--nl-muted)">มัดจำ {baht(b.deposit)}</div>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[13px] font-semibold ${badge.className}`}>{badge.label}</span>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <BookingActions id={b.id} status={b.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Boats */}
          <section id="boats" aria-label="เรือ" className="flex scroll-mt-6 flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className={`${heading} text-[28px]`}>เรือ</h2>
              <Link href="/admin/boats/new" className="rounded-xl bg-(--nl-teal) px-5 py-2.5 font-semibold text-white hover:bg-(--nl-teal-dk)">
                + เพิ่มเรือ
              </Link>
            </div>
            <div className="overflow-x-auto rounded-[20px] border border-(--nl-line) bg-white">
              <table className="w-full min-w-[980px] text-left text-[15px]">
                <thead className="border-b border-(--nl-divider) text-[13px] text-(--nl-muted)">
                  <tr>
                    <th className="px-5 py-3 font-medium">เรือ</th>
                    <th className="px-5 py-3 font-medium">ท่าเรือ</th>
                    <th className="px-5 py-3 font-medium">รับได้</th>
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
                  {boatList.map((b) => (
                    <tr key={b.id} className={`border-b border-(--nl-divider) last:border-0 ${b.active ? '' : 'bg-[#F7F9F9] text-(--nl-muted)'}`}>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/boats/${b.id}`} className="font-semibold text-(--nl-teal) hover:text-(--nl-teal-dk)">
                            {b.name}
                          </Link>
                          {!b.active && (
                            <span className="rounded-full bg-[#EDF1F1] px-2 py-0.5 text-[12px] font-semibold text-[#6B7C84]">ปิดรับจอง</span>
                          )}
                        </div>
                        <div className="text-[13px] text-(--nl-muted)">
                          {b.kind} · กัปตัน{b.captain}
                        </div>
                      </td>
                      <td className="px-5 py-4">{b.port}</td>
                      <td className="px-5 py-4">{b.seats} คน</td>
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
          </section>
        </div>
      </main>
    </>
  );
}
