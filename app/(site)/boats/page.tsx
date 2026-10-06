import Link from 'next/link';
import { and, arrayContains, asc, count, eq, gte, isNotNull } from 'drizzle-orm';
import { db } from '@/app/db/index';
import { boats } from '@/app/db/schema';
import { AMENITIES, PORTS, TRIPS, baht, boatPrice, isTripType, isYmd, tripLabel } from '@/app/lib/boats';
import { firstParam, type SearchParams } from '@/app/lib/search';
import { PortBadge, Placeholder, SiteHeader, SiteNav, heading } from '../_components/ui';
import GuestsAndAmenities from './filters';

const PRICE_COLUMN = { half: boats.priceHalf, full: boats.priceFull, night: boats.priceNight };

export default async function BoatsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const portParam = firstParam(params.port);
  const port = PORTS.some((p) => p.id === portParam) ? portParam : 'all';
  const tripParam = firstParam(params.trip);
  const trip = isTripType(tripParam) ? tripParam : 'full';
  const guestsNum = Number(firstParam(params.guests));
  const guests = Number.isInteger(guestsNum) && guestsNum >= 1 && guestsNum <= 20 ? guestsNum : 4;
  const rawAmenity = params.amenity;
  const amenities = (Array.isArray(rawAmenity) ? rawAmenity : rawAmenity ? [rawAmenity] : []).filter((a) =>
    AMENITIES.some((x) => x.value === a),
  );
  const dateParam = firstParam(params.date);
  const date = isYmd(dateParam) ? dateParam : '';

  const [results, perPort] = await Promise.all([
    db
      .select()
      .from(boats)
      .where(
        and(
          eq(boats.active, true), // เรือที่ปิดรับจองไม่แสดง
          port === 'all' ? undefined : eq(boats.port, port),
          gte(boats.seats, guests),
          isNotNull(PRICE_COLUMN[trip]), // เรือที่ไม่รับทริปประเภทนี้ไม่แสดง
          amenities.length ? arrayContains(boats.tags, amenities) : undefined,
        ),
      )
      .orderBy(asc(boats.createdAt)),
    db.select({ port: boats.port, n: count() }).from(boats).where(eq(boats.active, true)).groupBy(boats.port),
  ]);
  const total = perPort.reduce((sum, p) => sum + p.n, 0);
  const portCount = (id: string) => (id === 'all' ? total : (perPort.find((p) => p.port === id)?.n ?? 0));

  // ลิงก์ตัวกรอง — เปลี่ยนค่าเดียว ที่เหลือคงเดิม
  const href = (change: Record<string, string>) => {
    const p = new URLSearchParams();
    const merged = { port, trip, guests: String(guests), date, ...change };
    Object.entries(merged).forEach(([k, v]) => {
      if (v && v !== 'all') p.set(k, v);
    });
    amenities.forEach((a) => p.append('amenity', a));
    return `/boats?${p}`;
  };
  // ส่งตัวเลือกต่อไปหน้ารายละเอียด ให้เลือกไว้ให้แล้ว
  const detailQuery = new URLSearchParams({ trip, guests: String(guests), ...(date ? { date } : {}) }).toString();

  return (
    <>
      <SiteHeader>
        <SiteNav active="boats" />
      </SiteHeader>

      <main className="px-6 pt-12 pb-24">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-[15px] text-(--nl-muted)">
              <Link href="/" className="text-(--nl-teal) hover:text-(--nl-teal-dk)">
                หน้าแรก
              </Link>{' '}
              / เรือของเรา
            </p>
            <h1 className={`${heading} text-[44px] leading-tight`}>เลือกเรือที่ใช่สำหรับทริปนี้</h1>
          </div>

          <div className="flex flex-wrap items-start gap-8">
            {/* Filters */}
            <aside aria-label="ตัวกรอง" className="flex max-w-full flex-[1_1_260px] flex-col gap-7 rounded-[20px] border border-(--nl-line) bg-white p-6">
              <fieldset className="flex flex-col gap-3">
                <legend className="mb-3 text-[17px] font-semibold">ท่าเรือ</legend>
                {[{ id: 'all', label: 'ทุกท่าเรือ' }, ...PORTS.map((p) => ({ id: p.id, label: p.id }))].map((p) => {
                  const active = p.id === port;
                  return (
                    <Link
                      key={p.id}
                      href={href({ port: p.id })}
                      aria-current={active ? 'true' : undefined}
                      scroll={false}
                      className={`flex min-h-11 items-center justify-between rounded-xl border px-3.5 ${
                        active ? 'border-(--nl-teal) bg-(--nl-tint) font-semibold' : 'border-transparent bg-(--nl-bg) hover:border-(--nl-field)'
                      }`}
                    >
                      <span>{p.label}</span>
                      <span className={`text-sm ${active ? '' : 'text-(--nl-muted)'}`}>{portCount(p.id)}</span>
                    </Link>
                  );
                })}
              </fieldset>
              {/* key: รีเซ็ต state ใน component เมื่อ URL เปลี่ยนจากทางอื่น (เช่นกด back) */}
              <GuestsAndAmenities key={`${guests}-${amenities.join()}`} guests={guests} amenities={amenities} />
            </aside>

            {/* Results */}
            <section aria-label="ผลการค้นหา" className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div role="group" aria-label="ประเภททริป" className="flex flex-wrap gap-2">
                  {TRIPS.map((t) => (
                    <Link
                      key={t.id}
                      href={href({ trip: t.id })}
                      aria-current={t.id === trip ? 'true' : undefined}
                      scroll={false}
                      className={`flex min-h-11 items-center rounded-full border px-4.5 text-[15px] font-semibold ${
                        t.id === trip ? 'border-(--nl-navy) bg-(--nl-navy) text-white' : 'border-(--nl-field) bg-white hover:border-(--nl-navy)'
                      }`}
                    >
                      {t.label}
                    </Link>
                  ))}
                </div>
                <p className="text-[15px] text-(--nl-muted)">พบ {results.length} ลำ</p>
              </div>

              {results.length === 0 && (
                <div className="rounded-[20px] border border-dashed border-[#B7C7CB] bg-white p-12 text-center text-[17px] text-(--nl-muted)">
                  ไม่มีเรือที่ตรงกับตัวกรอง ลองลดจำนวนคนหรือเปลี่ยนท่าเรือ
                </div>
              )}

              {results.map((b) => (
                <article key={b.id} className="flex flex-wrap overflow-hidden rounded-[20px] border border-(--nl-line) bg-white">
                  <Placeholder label={`ภาพ ${b.name}`} className="min-h-[200px] flex-[1_1_260px]" />
                  <div className="flex min-w-0 flex-[999_1_340px] flex-col gap-3 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className={`${heading} text-[26px]`}>{b.name}</h2>
                      <PortBadge>ท่าเรือ{b.port}</PortBadge>
                    </div>
                    <p className="text-[15px] text-(--nl-muted)">
                      ยาว {b.lengthM} ม. · รับ {b.seats} คน · {b.kind} · กัปตัน{b.captain}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {b.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-(--nl-field) px-2.5 py-1 text-[13px] text-(--nl-label)">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-(--nl-divider) pt-4">
                      <p className="text-[15px] text-(--nl-muted)">
                        {tripLabel(trip)}{' '}
                        <strong className={`${heading} text-[26px] text-(--nl-ink)`}>{baht(boatPrice(b, trip)!)}</strong> / ลำ
                      </p>
                      <Link
                        href={`/boats/${b.id}?${detailQuery}`}
                        className="rounded-xl bg-(--nl-teal) px-5.5 py-3 font-semibold text-white hover:bg-(--nl-teal-dk)"
                      >
                        เลือกเรือลำนี้
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
