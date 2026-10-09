import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, asc, eq, gte, ne } from 'drizzle-orm';
import { db } from '@/app/db/index';
import { boatClosures, boats, bookings } from '@/app/db/schema';
import { BOOKING_WINDOW_DAYS, addDays, bangkokToday } from '@/app/lib/boats';
import { heading } from '../../../_components/ui';
import { approvedOwnerContext } from '../../guard';
import ActiveToggle from '../../../admin/boats/active-toggle';
import Closures from '../../../admin/boats/closures';

type Ctx = { params: Promise<{ id: string }> };

// เจ้าของเรือจัดการวันปิดรับจอง + เปิด/ปิดเรือ — เช็คความเป็นเจ้าของที่ server (ไม่ใช่เจ้าของ = 404)
export default async function OwnerBoatPage({ params }: Ctx) {
  const { id } = await params;
  const { user } = await approvedOwnerContext(`/owner/boats/${id}`);

  const [boat] = await db
    .select()
    .from(boats)
    .where(and(eq(boats.id, id), eq(boats.ownerId, user.id)))
    .limit(1);
  if (!boat) notFound();

  const today = bangkokToday();
  const tomorrow = addDays(today, 1);
  const [activeBookings, closureRows] = await Promise.all([
    db
      .select({ date: bookings.tripDate })
      .from(bookings)
      .where(and(eq(bookings.boatId, id), ne(bookings.status, 'cancelled'), gte(bookings.tripDate, today))),
    db
      .select({ id: boatClosures.id, date: boatClosures.date, reason: boatClosures.reason })
      .from(boatClosures)
      .where(and(eq(boatClosures.boatId, id), gte(boatClosures.date, tomorrow)))
      .orderBy(asc(boatClosures.date)),
  ]);
  const bookedDates = new Set(activeBookings.map((b) => b.date));
  const closures = closureRows.map((c) => ({ ...c, booked: bookedDates.has(c.date) }));

  return (
    <div className="mx-auto flex w-full max-w-[880px] flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-[15px] text-(--nl-muted)">
              <Link href="/owner/boats" className="text-(--nl-teal) hover:text-(--nl-teal-dk)">
                เรือของฉัน
              </Link>{' '}
              / {boat.name}
            </p>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className={`${heading} text-[40px] leading-tight`}>{boat.name}</h1>
                <span
                  className={`rounded-full px-2.5 py-1 text-[13px] font-semibold ${
                    boat.active ? 'bg-(--nl-tint) text-(--nl-teal-dk)' : 'bg-[#EDF1F1] text-[#6B7C84]'
                  }`}
                >
                  {boat.active ? 'เปิดรับจอง' : 'ปิดรับจอง'}
                </span>
              </div>
              <div className="flex items-start gap-4">
                <Link href={`/boats/${boat.id}`} className="py-1.5 font-semibold text-(--nl-teal) hover:text-(--nl-teal-dk)">
                  ดูหน้าเรือ →
                </Link>
                <ActiveToggle id={boat.id} active={boat.active} upcoming={activeBookings.length} />
              </div>
            </div>
          </div>
          <Closures boatId={boat.id} closures={closures} minDate={tomorrow} maxDate={addDays(today, BOOKING_WINDOW_DAYS)} />
    </div>
  );
}
