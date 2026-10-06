import Link from 'next/link';
import { and, asc, count, desc, eq, gte, inArray, ne } from 'drizzle-orm';
import { db } from '@/app/db/index';
import { boats, bookings } from '@/app/db/schema';
import { ownedBoatIds } from '@/app/lib/admin';
import { bangkokToday } from '@/app/lib/boats';
import { heading } from '../../_components/ui';
import { badge } from '../../_components/styles';
import ActiveToggle from '../../admin/boats/active-toggle';
import { approvedOwnerContext } from '../guard';

const card = 'rounded-[20px] border border-(--nl-line) bg-white';

// /owner/boats — เรือที่ผู้ใช้เป็นเจ้าของ: เปิด / ปิดรับจอง + ลิงก์จัดการวันปิด
export default async function OwnerBoats() {
  const { user } = await approvedOwnerContext('/owner/boats');

  const [myBoats, load] = await Promise.all([
    db.select().from(boats).where(eq(boats.ownerId, user.id)).orderBy(desc(boats.active), asc(boats.createdAt)),
    db
      .select({ boatId: bookings.boatId, n: count() })
      .from(bookings)
      .where(and(inArray(bookings.boatId, ownedBoatIds(user.id)), ne(bookings.status, 'cancelled'), gte(bookings.tripDate, bangkokToday())))
      .groupBy(bookings.boatId),
  ]);
  const upcomingByBoat = new Map(load.map((l) => [l.boatId, l.n]));

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className={`${heading} text-[40px] leading-tight`}>เรือของฉัน</h1>
        <Link href="/owner/boat-requests/new" className="rounded-xl bg-(--nl-teal) px-5 py-2.5 font-semibold text-white hover:bg-(--nl-teal-dk)">
          + ขอเพิ่มเรือ
        </Link>
      </div>

      {myBoats.length === 0 ? (
        <div className={`${card} flex flex-col items-start gap-2 border-dashed p-8`}>
          <p className="text-(--nl-muted)">ยังไม่มีเรือในระบบ — ส่งคำขอเพิ่มเรือ แล้วรอผู้ดูแลระบบอนุมัติรายลำ</p>
          <Link href="/owner/boat-requests/new" className="font-semibold text-(--nl-teal) hover:text-(--nl-teal-dk)">
            ขอเพิ่มเรือ →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
          {myBoats.map((b) => (
            <article key={b.id} className={`${card} flex flex-col gap-4 p-6 ${b.active ? '' : 'opacity-80'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={`/boats/${b.id}`} className={`${heading} text-[24px] hover:text-(--nl-teal)`}>
                  {b.name}
                </Link>
                <span className={`${badge} ${b.active ? 'bg-(--nl-tint) text-(--nl-teal-dk)' : 'bg-[#EDF1F1] text-[#6B7C84]'}`}>
                  {b.active ? 'เปิดรับจอง' : 'ปิดรับจอง'}
                </span>
              </div>
              <p className="text-[15px] text-(--nl-muted)">
                ท่าเรือ{b.port} · รับ {b.seats} คน · คำขอที่ยังไม่ถึงวัน {upcomingByBoat.get(b.id) ?? 0} รายการ
              </p>
              <div className="mt-auto flex flex-wrap items-start justify-between gap-3 border-t border-(--nl-divider) pt-4">
                <Link
                  href={`/owner/boats/${b.id}`}
                  className="rounded-lg border border-(--nl-field) bg-white px-3 py-1.5 text-sm hover:border-(--nl-teal) hover:text-(--nl-teal)"
                >
                  จัดการวันปิดรับจอง
                </Link>
                <ActiveToggle id={b.id} active={b.active} upcoming={upcomingByBoat.get(b.id) ?? 0} />
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
