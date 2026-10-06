import { notFound } from 'next/navigation';
import { and, eq, gte, lte, ne } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/app/db/index';
import { boatClosures, boats, bookings } from '@/app/db/schema';
import { CALENDAR_DAYS, TRIPS, addDays, bangkokToday, boatPrice, isTripType, isYmd, portLabel } from '@/app/lib/boats';
import { firstParam, type SearchParams } from '@/app/lib/search';
import { PortBadge, Placeholder, SiteHeader, SiteNav, heading } from '../../_components/ui';
import BookingForm from './booking-form';

type Ctx = { params: Promise<{ id: string }>; searchParams: SearchParams };

export default async function BoatDetailPage({ params, searchParams }: Ctx) {
  const { id } = await params;
  const query = await searchParams;

  const first = addDays(bangkokToday(), 1);
  const last = addDays(first, CALENDAR_DAYS - 1);

  const [[boat], booked, closures, session] = await Promise.all([
    db.select().from(boats).where(eq(boats.id, id)).limit(1),
    db
      .select({ date: bookings.tripDate })
      .from(bookings)
      .where(and(eq(bookings.boatId, id), ne(bookings.status, 'cancelled'), gte(bookings.tripDate, first), lte(bookings.tripDate, last))),
    db
      .select({ date: boatClosures.date })
      .from(boatClosures)
      .where(and(eq(boatClosures.boatId, id), gte(boatClosures.date, first), lte(boatClosures.date, last))),
    auth(),
  ]);
  if (!boat) notFound();

  // full = เลือกไม่ได้ (มีคนจองแล้ว หรือ admin ปิดรับจองวันนั้น), closed = ใช้แยกป้าย "ปิด" กับ "เต็ม"
  const bookedSet = new Set(booked.map((b) => b.date));
  const closedSet = new Set(closures.map((c) => c.date));
  const days = Array.from({ length: CALENDAR_DAYS }, (_, i) => {
    const ymd = addDays(first, i);
    const closed = closedSet.has(ymd);
    return { ymd, closed, full: closed || bookedSet.has(ymd) };
  });

  // ค่าเริ่มต้นจาก query (มาจากหน้า /boats หรือฟอร์มค้นหาหน้าแรก) — ใช้ได้เฉพาะค่าที่เรือลำนี้รับจริง
  const offered = TRIPS.filter((t) => boatPrice(boat, t.id) !== null).map((t) => t.id);
  const qTrip = firstParam(query.trip);
  const qDate = firstParam(query.date);
  const qGuests = Number(firstParam(query.guests));
  const initial = {
    trip: isTripType(qTrip) && offered.includes(qTrip) ? qTrip : offered.includes('full') ? 'full' : offered[0],
    date: isYmd(qDate) && days.some((d) => d.ymd === qDate && !d.full) ? qDate : (days.find((d) => !d.full)?.ymd ?? null),
    guests: Number.isInteger(qGuests) && qGuests >= 1 ? Math.min(qGuests, boat.seats) : Math.min(6, boat.seats),
  };

  const specs = [
    ['รับได้', `${boat.seats} คน`],
    ['เครื่องยนต์', boat.engine ?? '—'],
    ['อุปกรณ์', boat.equipment ?? '—'],
    ['บนเรือ', boat.tags.length ? boat.tags.join(' · ') : '—'],
  ];

  return (
    <>
      <SiteHeader>
        <SiteNav back={{ href: '/boats', label: 'กลับไปเลือกเรือ' }} />
      </SiteHeader>

      <main className="px-6 pt-10 pb-24">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-7">
          {/* Gallery */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3">
            <Placeholder label={`ภาพเรือ${boat.name}`} className="h-[340px] rounded-[20px] sm:col-span-2" />
            <div className="grid grid-rows-2 gap-3">
              <Placeholder label="ภาพดาดฟ้าเรือ" className="min-h-[120px] rounded-[20px]" />
              <Placeholder label="ภาพปลาที่ได้" className="min-h-[120px] rounded-[20px]" />
            </div>
          </div>

          <BookingForm
            boat={{
              id: boat.id,
              name: boat.name,
              seats: boat.seats,
              priceHalf: boat.priceHalf,
              priceFull: boat.priceFull,
              priceNight: boat.priceNight,
            }}
            days={days}
            initial={initial}
            signedIn={Boolean(session?.user?.id)}
            closed={!boat.active}
          >
            {/* ข้อมูลเรือ — render ฝั่ง server แล้วส่งเข้าไปเป็น children ของฟอร์ม */}
            <div className="flex flex-col gap-2.5">
              <span className="self-start">
                <PortBadge>ท่าเรือ{portLabel(boat.port)}</PortBadge>
              </span>
              <h1 className={`${heading} text-[44px] leading-tight`}>{boat.name}</h1>
              <p className="text-[17px] leading-[1.7] text-(--nl-muted)">
                {boat.description ?? `${boat.kind}ยาว ${boat.lengthM} เมตร รับได้ ${boat.seats} คน กัปตัน${boat.captain}`}
              </p>
              <div className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
                {specs.map(([k, v]) => (
                  <div key={k} className="rounded-[14px] border border-(--nl-line) bg-white px-4 py-3.5">
                    <div className="text-[13px] text-(--nl-muted)">{k}</div>
                    <div className="text-lg font-semibold">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </BookingForm>
        </div>
      </main>
    </>
  );
}
