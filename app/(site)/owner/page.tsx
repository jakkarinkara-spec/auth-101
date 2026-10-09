import Link from 'next/link';
import { and, count, eq, gte, inArray, sum } from 'drizzle-orm';
import { db } from '@/app/db/index';
import { boats, bookings, ownerApplications } from '@/app/db/schema';
import { ownedBoatIds } from '@/app/lib/admin';
import { baht, bangkokToday } from '@/app/lib/boats';
import { heading } from '../_components/ui';
import { APP_STATUS, badge } from '../_components/styles';
import { ownerContext } from './guard';

const card = 'rounded-[20px] border border-(--nl-line) bg-white';

// /owner — ยังไม่ผ่านการอนุมัติตัวบุคคล: สถานะใบสมัคร / ผ่านแล้ว: ภาพรวม (ตัวเลขสรุป + งานที่รอ)
export default async function OwnerOverview() {
  const { user, profile, approved } = await ownerContext('/owner');

  // ===== ยังไม่ผ่านขั้นที่ 1 =====
  if (!approved) {
    const state = !profile
      ? {
          title: 'สมัครเป็นเจ้าของเรือ',
          text: 'ขั้นที่ 1: กรอกข้อมูลส่วนตัว (เบอร์โทร ที่อยู่ — ใช้ชื่อที่ลงทะเบียนเป็นชื่อเจ้าของเรือ) ให้ผู้ดูแลระบบตรวจและอนุมัติ — อนุมัติแล้วจึงส่งคำขอเพิ่มเรือได้',
          action: 'กรอกข้อมูลส่วนตัว →',
        }
      : profile.status === 'pending'
        ? {
            title: 'รอผู้ดูแลระบบตรวจสอบ',
            text: 'ได้รับข้อมูลแล้ว ผู้ดูแลระบบจะติดต่อตามเบอร์ที่ให้ไว้เพื่อยืนยันตัวตน — อนุมัติแล้วหน้านี้จะเปลี่ยนเป็นแดชบอร์ดเจ้าของเรือ',
            action: 'ดู / แก้ไขข้อมูลส่วนตัว',
          }
        : {
            title: 'ใบสมัครไม่ผ่านการอนุมัติ',
            text: 'ตรวจข้อมูลให้ถูกต้องแล้วบันทึกใหม่เพื่อส่งให้ผู้ดูแลระบบตรวจอีกครั้ง หรือติดต่อทาง LINE [LINE ID]',
            action: 'แก้ไขแล้วส่งใหม่ →',
          };
    return (
      <>
        <h1 className={`${heading} text-[40px] leading-tight`}>เจ้าของเรือ</h1>
        <ol className="grid gap-3 text-[15px] sm:grid-cols-2">
          <li className={`${card} flex gap-3 p-4 ${profile?.status === 'pending' ? 'border-(--nl-accent)' : ''}`}>
            <span className={`${heading} text-[22px] text-(--nl-teal)`}>1</span>
            <span>
              <strong>อนุมัติตัวบุคคล</strong>
              <br />
              <span className="text-(--nl-muted)">กรอกข้อมูลส่วนตัว รอผู้ดูแลระบบยืนยันตัวตน</span>
            </span>
          </li>
          <li className={`${card} flex gap-3 p-4 opacity-60`}>
            <span className={`${heading} text-[22px] text-(--nl-teal)`}>2</span>
            <span>
              <strong>ขอเพิ่มเรือทีละลำ</strong>
              <br />
              <span className="text-(--nl-muted)">ส่งข้อมูลเรือ รออนุมัติรายลำ แล้วรับคำขอจองได้</span>
            </span>
          </li>
        </ol>
        <section className={`${card} flex flex-col items-start gap-3 p-8`}>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className={`${heading} text-[24px]`}>{state.title}</h2>
            {profile && <span className={`${badge} ${APP_STATUS[profile.status].className}`}>{APP_STATUS[profile.status].label}</span>}
          </div>
          <p className="leading-[1.7] text-(--nl-muted)">{state.text}</p>
          {profile?.status === 'rejected' && profile.rejectReason && (
            <p className="w-full rounded-xl bg-[#FDECEC] px-4 py-3 text-[15px] text-[#B42318]">
              <strong>เหตุผลจากผู้ดูแลระบบ:</strong> {profile.rejectReason}
            </p>
          )}
          <Link href="/owner/profile" className="mt-1 rounded-xl bg-(--nl-teal) px-5 py-3 font-semibold text-white hover:bg-(--nl-teal-dk)">
            {state.action}
          </Link>
        </section>
      </>
    );
  }

  // ===== ภาพรวม =====
  const today = bangkokToday();
  const mine = inArray(bookings.boatId, ownedBoatIds(user.id));
  const upcoming = gte(bookings.tripDate, today);
  const [[pending], [confirmed], [boatCount], [activeBoats], [requests]] = await Promise.all([
    db.select({ n: count() }).from(bookings).where(and(mine, eq(bookings.status, 'pending'), upcoming)),
    db.select({ n: count(), total: sum(bookings.total) }).from(bookings).where(and(mine, eq(bookings.status, 'confirmed'), upcoming)),
    db.select({ n: count() }).from(boats).where(eq(boats.ownerId, user.id)),
    db.select({ n: count() }).from(boats).where(and(eq(boats.ownerId, user.id), eq(boats.active, true))),
    db.select({ n: count() }).from(ownerApplications).where(and(eq(ownerApplications.userId, user.id), eq(ownerApplications.status, 'pending'))),
  ]);

  const stats = [
    { label: 'คำขอจองรอยืนยัน', value: String(pending.n), note: 'ทริปที่ยังไม่ถึงวัน' },
    { label: 'ทริปที่ยืนยันแล้ว', value: String(confirmed.n), note: 'ตั้งแต่วันนี้เป็นต้นไป' },
    { label: 'ยอดจองที่ยืนยันแล้ว', value: baht(Number(confirmed.total ?? 0)), note: 'รวมทริปที่ยังไม่ถึงวัน' },
    { label: 'เรือเปิดรับจอง', value: String(activeBoats.n), note: `จากทั้งหมด ${boatCount.n} ลำ` },
  ];
  const todos = [
    { href: '/owner/bookings', label: 'คำขอจองรอยืนยัน', n: pending.n },
    { href: '/owner/boat-requests', label: 'คำขอเพิ่มเรือที่รอผู้ดูแลระบบอนุมัติ', n: requests.n },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className={`${heading} text-[40px] leading-tight`}>ภาพรวม</h1>
        <Link href="/owner/boat-requests/new" className="rounded-xl bg-(--nl-teal) px-5 py-2.5 font-semibold text-white hover:bg-(--nl-teal-dk)">
          + ขอเพิ่มเรือ
        </Link>
      </div>

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

      <p className="text-sm text-(--nl-muted)">
        ต้องการแก้ไขข้อมูลเรือหรือราคา ติดต่อผู้ดูแลระบบ — เจ้าของเรือจัดการได้เฉพาะคำขอจอง วันปิดรับจอง และการเปิด / ปิดเรือ
      </p>
    </>
  );
}
