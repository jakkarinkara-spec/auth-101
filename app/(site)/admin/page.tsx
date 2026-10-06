import Link from 'next/link';
import { and, count, eq, gte, sum } from 'drizzle-orm';
import { db } from '@/app/db/index';
import { boats, bookings, ownerApplications, ownerProfiles } from '@/app/db/schema';
import { baht, bangkokToday } from '@/app/lib/boats';
import { heading } from '../_components/ui';
import { adminSession } from './guard';

const card = 'rounded-[20px] border border-(--nl-line) bg-white';

// /admin — ภาพรวม: ตัวเลขสรุป + งานที่รอดำเนินการ (ลิงก์ไปหัวข้อใน sidebar)
export default async function AdminOverview() {
  if (!(await adminSession('/admin'))) return null; // layout แสดงข้อความแจ้งแล้ว

  const today = bangkokToday();
  const upcoming = gte(bookings.tripDate, today);
  const [[pending], [confirmed], [boatCount], [activeBoats], [owners], [requests]] = await Promise.all([
    db.select({ n: count() }).from(bookings).where(and(eq(bookings.status, 'pending'), upcoming)),
    db.select({ n: count(), total: sum(bookings.total) }).from(bookings).where(and(eq(bookings.status, 'confirmed'), upcoming)),
    db.select({ n: count() }).from(boats),
    db.select({ n: count() }).from(boats).where(eq(boats.active, true)),
    db.select({ n: count() }).from(ownerProfiles).where(eq(ownerProfiles.status, 'pending')),
    db.select({ n: count() }).from(ownerApplications).where(eq(ownerApplications.status, 'pending')),
  ]);

  const stats = [
    { label: 'คำขอรอยืนยัน', value: String(pending.n), note: 'ทริปที่ยังไม่ถึงวัน' },
    { label: 'ทริปที่ยืนยันแล้ว', value: String(confirmed.n), note: 'ตั้งแต่วันนี้เป็นต้นไป' },
    { label: 'ยอดจองที่ยืนยันแล้ว', value: baht(Number(confirmed.total ?? 0)), note: 'รวมทริปที่ยังไม่ถึงวัน' },
    { label: 'เรือเปิดรับจอง', value: String(activeBoats.n), note: `จากทั้งหมด ${boatCount.n} ลำ` },
  ];
  const todos = [
    { href: '/admin/bookings', label: 'คำขอจองรอยืนยัน', n: pending.n },
    { href: '/admin/owners', label: 'ผู้สมัครเจ้าของเรือรออนุมัติ', n: owners.n },
    { href: '/admin/boat-requests', label: 'คำขอเพิ่มเรือรออนุมัติ', n: requests.n },
  ];

  return (
    <>
      <h1 className={`${heading} text-[40px] leading-tight`}>ภาพรวม</h1>

      <section aria-label="สรุป" className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`${card} flex flex-col gap-1 p-6`}>
            <span className="text-[15px] text-(--nl-muted)">{s.label}</span>
            <span className={`${heading} text-[34px] leading-tight`}>{s.value}</span>
            <span className="text-[13px] text-(--nl-muted)">{s.note}</span>
          </div>
        ))}
      </section>

      <section aria-label="งานที่รอดำเนินการ" className="flex flex-col gap-4">
        <h2 className={`${heading} text-[26px]`}>งานที่รอดำเนินการ</h2>
        <ul className={`${card} divide-y divide-(--nl-divider)`}>
          {todos.map((t) => (
            <li key={t.href}>
              <Link href={t.href} className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-(--nl-bg)">
                <span className={t.n ? 'font-semibold' : 'text-(--nl-muted)'}>{t.label}</span>
                <span className="flex items-center gap-3">
                  <span
                    className={`min-w-8 rounded-full px-2.5 py-0.5 text-center text-sm font-semibold ${
                      t.n ? 'bg-(--nl-accent-soft) text-[#9A4A00]' : 'bg-(--nl-bg) text-(--nl-muted)'
                    }`}
                  >
                    {t.n}
                  </span>
                  <span className="text-(--nl-muted)" aria-hidden="true">
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
