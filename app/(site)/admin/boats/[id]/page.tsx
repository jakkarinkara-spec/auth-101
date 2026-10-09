import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, asc, eq, gte, ne } from 'drizzle-orm';
import { db } from '@/app/db/index';
import { boatClosures, boats, bookings } from '@/app/db/schema';
import { BOOKING_WINDOW_DAYS, addDays, bangkokToday } from '@/app/lib/boats';
import ActiveToggle from '../active-toggle';
import Closures from '../closures';
import { heading } from '../../../_components/ui';
import { adminSession } from '../../guard';
import BoatForm from '../boat-form';

type Ctx = { params: Promise<{ id: string }> };

export default async function EditBoatPage({ params }: Ctx) {
  const { id } = await params;
  if (!(await adminSession(`/admin/boats/${id}`))) return null; // layout แสดงข้อความแจ้งแล้ว

  const today = bangkokToday();
  const tomorrow = addDays(today, 1);
  const [[boat], activeBookings, closureRows] = await Promise.all([
    db.select().from(boats).where(eq(boats.id, id)).limit(1),
    // คำขอที่ยังไม่ยกเลิกและยังไม่ถึงวัน — ใช้นับ + เตือนวันปิดที่มีคนจองอยู่แล้ว
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
  if (!boat) notFound();

  const bookedDates = new Set(activeBookings.map((b) => b.date));
  const closures = closureRows.map((c) => ({ ...c, booked: bookedDates.has(c.date) }));

  return (
    <div className="mx-auto flex w-full max-w-[880px] flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-[15px] text-(--nl-muted)">
              <Link href="/admin/boats" className="text-(--nl-teal) hover:text-(--nl-teal-dk)">
                เรือ
              </Link>{' '}
              / แก้ไขเรือ
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
          <BoatForm
            boat={{
              id: boat.id,
              name: boat.name,
              port: boat.port,
              lengthM: boat.lengthM,
              seats: boat.seats,
              kind: boat.kind,
              captain: boat.captain,
              description: boat.description,
              engine: boat.engine,
              equipment: boat.equipment,
              tags: boat.tags,
              priceHalf: boat.priceHalf,
              priceFull: boat.priceFull,
              priceNight: boat.priceNight,
            }}
          />
    </div>
  );
}
