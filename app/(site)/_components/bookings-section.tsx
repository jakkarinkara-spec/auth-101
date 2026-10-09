import Link from 'next/link';
import { and, asc, desc, eq, type SQL } from 'drizzle-orm';
import { db } from '@/app/db/index';
import { boats, bookings, usersTable } from '@/app/db/schema';
import { addonLabel, baht, thaiDate, tripLabel } from '@/app/lib/boats';
import { STATUS_BADGE, badge, heading } from './styles';
import BookingActions from './booking-actions';

// ตารางคำขอจอง + แท็บสถานะ — ใช้ทั้งหน้า /admin (ทุกเรือ) และ /owner (เฉพาะเรือของตัวเอง)

export const STATUS_TABS = [
  { id: 'pending', label: 'รอยืนยัน' },
  { id: 'confirmed', label: 'ยืนยันแล้ว' },
  { id: 'cancelled', label: 'ยกเลิก' },
  { id: 'all', label: 'ทั้งหมด' },
] as const;
export type Tab = (typeof STATUS_TABS)[number]['id'];

export const parseTab = (v: string): Tab => (STATUS_TABS.some((t) => t.id === v) ? (v as Tab) : 'pending');

// scope = เงื่อนไขขอบเขต (เช่น เฉพาะเรือของเจ้าของ) — เลือกคอลัมน์เอง ไม่ดึง password hash ของ users ติดมากับ join
export function loadBookingRows(tab: Tab, scope?: SQL) {
  return db
    .select({
      id: bookings.id,
      tripDate: bookings.tripDate,
      tripType: bookings.tripType,
      guests: bookings.guests,
      addons: bookings.addons,
      total: bookings.total,
      deposit: bookings.deposit,
      status: bookings.status,
      boatName: boats.name,
      boatPort: boats.port,
      userName: usersTable.name,
      userEmail: usersTable.email,
      userPhones: usersTable.phones, // เบอร์ติดต่อที่ลูกค้าตั้งไว้ที่ /account
    })
    .from(bookings)
    .innerJoin(boats, eq(bookings.boatId, boats.id))
    .innerJoin(usersTable, eq(bookings.userId, usersTable.id))
    .where(and(scope, tab === 'all' ? undefined : eq(bookings.status, tab)))
    .orderBy(tab === 'cancelled' || tab === 'all' ? desc(bookings.tripDate) : asc(bookings.tripDate), asc(bookings.createdAt));
}

type Row = Awaited<ReturnType<typeof loadBookingRows>>[number];

export function BookingsSection({ tab, rows, today, basePath }: { tab: Tab; rows: Row[]; today: string; basePath: string }) {
  return (
    <section aria-label="คำขอจอง" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={`${heading} text-[28px]`}>คำขอจอง</h2>
        <div role="group" aria-label="สถานะ" className="flex flex-wrap gap-2">
          {STATUS_TABS.map((t) => (
            <Link
              key={t.id}
              href={t.id === 'pending' ? basePath : `${basePath}?status=${t.id}`}
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

      {rows.length === 0 ? (
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
              {rows.map((b) => {
                const past = b.tripDate < today;
                const s = STATUS_BADGE[b.status];
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
                      {b.userPhones.length > 0 && (
                        <div className="text-[13px] text-(--nl-muted)">
                          {b.userPhones.map((p) => (
                            <a key={p} href={`tel:${p.replace(/[^\d+]/g, '')}`} className="mr-2 whitespace-nowrap text-(--nl-teal) hover:underline">
                              ☎ {p}
                            </a>
                          ))}
                        </div>
                      )}
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
                      <span className={`${badge} ${s.className}`}>{s.label}</span>
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
  );
}
