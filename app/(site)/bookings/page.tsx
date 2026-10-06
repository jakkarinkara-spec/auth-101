import Link from 'next/link';
import { redirect } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/app/db/index';
import { boats, bookings } from '@/app/db/schema';
import { addonLabel, baht, bangkokToday, portLabel, thaiDate, tripLabel, TRIPS } from '@/app/lib/boats';
import { SiteHeader, SiteNav, heading } from '../_components/ui';
import { STATUS_BADGE, badge } from '../_components/styles';
import CancelRequest from './cancel-request';

type Row = Awaited<ReturnType<typeof loadBookings>>[number];

// คำขอจองของผู้ใช้ที่ล็อกอิน (ดูอย่างเดียว) — ไม่เลือกคอลัมน์ที่ไม่ใช้ และกรองด้วย userId ของ session เสมอ
function loadBookings(userId: string) {
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
      createdAt: bookings.createdAt,
      boatId: boats.id,
      boatName: boats.name,
      boatPort: boats.port,
      boatActive: boats.active,
    })
    .from(bookings)
    .innerJoin(boats, eq(bookings.boatId, boats.id))
    .where(eq(bookings.userId, userId))
    .orderBy(desc(bookings.tripDate), desc(bookings.createdAt));
}

const STATUS_NOTE = {
  pending: 'รอกัปตันยืนยันทาง LINE',
  confirmed: 'ยืนยันแล้ว — ชำระส่วนที่เหลือที่ท่าเรือ',
  cancelled: 'คำขอนี้ถูกยกเลิก',
} as const;

export default async function MyBookingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/bookings');

  const rows = await loadBookings(session.user.id);
  const today = bangkokToday();
  // กำลังจะถึง = ยังไม่ถึงวันและไม่ถูกยกเลิก เรียงวันใกล้สุดก่อน / ที่เหลือเรียงล่าสุดก่อน
  const upcoming = rows.filter((r) => r.tripDate >= today && r.status !== 'cancelled').reverse();
  const history = rows.filter((r) => !(r.tripDate >= today && r.status !== 'cancelled'));

  return (
    <>
      <SiteHeader>
        <SiteNav active="bookings" />
      </SiteHeader>

      <main className="px-6 pt-12 pb-24">
        <div className="mx-auto flex max-w-[960px] flex-col gap-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-[15px] text-(--nl-muted)">{session.user.name ?? session.user.email}</p>
              <h1 className={`${heading} text-[44px] leading-tight`}>การจองของฉัน</h1>
            </div>
            <Link href="/boats" className="rounded-xl bg-(--nl-teal) px-5 py-3 font-semibold text-white hover:bg-(--nl-teal-dk)">
              จองเรือเพิ่ม
            </Link>
          </div>

          {rows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed border-[#B7C7CB] bg-white p-12 text-center">
              <p className="text-[17px] text-(--nl-muted)">ยังไม่มีการจอง</p>
              <Link href="/boats" className="font-semibold text-(--nl-teal) hover:text-(--nl-teal-dk)">
                เลือกเรือที่ใช่สำหรับทริปแรก →
              </Link>
            </div>
          ) : (
            <>
              <BookingSection title="ทริปที่กำลังจะถึง" rows={upcoming} today={today} empty="ไม่มีทริปที่กำลังจะถึง" />
              {history.length > 0 && <BookingSection title="ที่ผ่านมา / ยกเลิก" rows={history} today={today} />}
            </>
          )}

          <p className="text-sm leading-[1.6] text-(--nl-muted)">
            คำขอที่ยังรอยืนยันยกเลิกเองได้ที่ปุ่ม &quot;ยกเลิกคำขอ&quot; — ทริปที่ยืนยันแล้ว ถ้าต้องการเลื่อนหรือยกเลิก ติดต่อทาง LINE [LINE ID]
            — ยกเลิกฟรีก่อนออกเรือ 72 ชม. หากคลื่นลมแรงจนออกเรือไม่ได้
            เลื่อนวันหรือคืนเงินเต็มจำนวน
          </p>
        </div>
      </main>
    </>
  );
}

function BookingSection({ title, rows, today, empty }: { title: string; rows: Row[]; today: string; empty?: string }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className={`${heading} text-[26px]`}>{title}</h2>
      {rows.length === 0 ? (
        <p className="rounded-[20px] border border-(--nl-line) bg-white p-8 text-center text-(--nl-muted)">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map((r) => (
            <BookingCard key={r.id} r={r} past={r.tripDate < today} />
          ))}
        </ul>
      )}
    </section>
  );
}

function BookingCard({ r, past }: { r: Row; past: boolean }) {
  const status = STATUS_BADGE[r.status];
  const dim = past || r.status === 'cancelled';
  const time = TRIPS.find((t) => t.id === r.tripType)?.time;

  return (
    <li className={`flex flex-col gap-4 rounded-[20px] border border-(--nl-line) bg-white p-6 sm:flex-row sm:items-start ${dim ? 'opacity-75' : ''}`}>
      {/* วันที่ */}
      <div
        className={`flex w-full flex-none flex-row items-center gap-3 rounded-[14px] px-4 py-3 sm:w-[104px] sm:flex-col sm:gap-0 ${
          dim ? 'bg-[#EDF1F1] text-[#6B7C84]' : 'bg-(--nl-navy) text-white'
        }`}
      >
        <span className="text-[13px]">{thaiDate(r.tripDate, { weekday: 'short' })}</span>
        <span className={`${heading} text-[32px] leading-none ${r.status === 'cancelled' ? 'line-through' : ''}`}>
          {thaiDate(r.tripDate, { day: 'numeric' })}
        </span>
        <span className="text-[13px]">{thaiDate(r.tripDate, { month: 'short', year: '2-digit' })}</span>
      </div>

      {/* รายละเอียด */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {r.boatActive ? (
            <Link href={`/boats/${r.boatId}`} className={`${heading} text-[22px] text-(--nl-ink) hover:text-(--nl-teal)`}>
              {r.boatName}
            </Link>
          ) : (
            <span className={`${heading} text-[22px]`}>{r.boatName}</span>
          )}
          <span className={`${badge} ${status.className}`}>{status.label}</span>
          {past && r.status !== 'cancelled' && <span className="text-[13px] text-(--nl-muted)">ผ่านไปแล้ว</span>}
        </div>
        <p className="text-[15px] text-(--nl-muted)">
          {tripLabel(r.tripType)}
          {time ? ` (${time})` : ''} · ท่าเรือ{portLabel(r.boatPort)} · {r.guests} คน
        </p>
        <p className="text-[15px] text-(--nl-muted)">บริการเสริม: {r.addons.length ? r.addons.map(addonLabel).join(', ') : 'ไม่มี'}</p>
        {!past && <p className="text-[15px] text-(--nl-label)">{STATUS_NOTE[r.status]}</p>}
        {/* ยกเลิกเองได้เฉพาะคำขอที่ยังรอยืนยันและยังไม่ถึงวัน — API เช็คซ้ำ (เจ้าของ + สถานะ pending) */}
        {!past && r.status === 'pending' && <CancelRequest id={r.id} />}
        <p className="text-[13px] text-(--nl-muted)">
          ส่งคำขอเมื่อ {r.createdAt.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', timeZone: 'Asia/Bangkok' })}
        </p>
      </div>

      {/* ราคา */}
      <div className="flex flex-row justify-between gap-1 border-t border-(--nl-divider) pt-3 text-right sm:flex-col sm:border-0 sm:pt-0">
        <span className="text-[13px] text-(--nl-muted)">รวมทั้งหมด</span>
        <span className={`${heading} text-[24px] tabular-nums`}>{baht(r.total)}</span>
        <span className="text-[13px] text-(--nl-muted) tabular-nums">มัดจำ {baht(r.deposit)}</span>
      </div>
    </li>
  );
}
