import Link from 'next/link';
import { asc, count, eq, min } from 'drizzle-orm';
import { db } from '@/app/db/index';
import { boats } from '@/app/db/schema';
import { CALENDAR_DAYS, INCLUDED, PORTS, TRIPS, addDays, bangkokToday, baht, type TripType } from '@/app/lib/boats';
import { PortBadge, Placeholder, SiteNav, heading } from './_components/ui';

const field = 'h-[50px] rounded-xl border border-(--nl-field) bg-white px-3 text-(--nl-ink)';
const label = 'flex flex-col gap-2 text-sm font-medium text-(--nl-label)';

export default async function HomePage() {
  const [featured, perPort, [from]] = await Promise.all([
    db.select().from(boats).where(eq(boats.active, true)).orderBy(asc(boats.createdAt)).limit(3),
    db.select({ port: boats.port, n: count() }).from(boats).where(eq(boats.active, true)).groupBy(boats.port),
    // ราคาเริ่มต้นของแต่ละแพ็กเกจ = ราคาต่ำสุดในเรือที่มีอยู่จริง
    db.select({ half: min(boats.priceHalf), full: min(boats.priceFull), night: min(boats.priceNight) }).from(boats).where(eq(boats.active, true)),
  ]);
  const boatCount = new Map(perPort.map((p) => [p.port, p.n]));
  const startingAt = (id: TripType) => from?.[id] ?? null;
  const tomorrow = addDays(bangkokToday(), 1);

  return (
    <>
      {/* Hero */}
      <header id="top" className="bg-(--nl-navy) px-6 pb-24 text-white">
        <div className="mx-auto max-w-[1200px]">
          <SiteNav />
          <div className="flex flex-wrap items-center gap-12 pt-14">
            <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-5">
              <p className="font-semibold tracking-wider text-(--nl-accent)">เช่าเรือตกปลา พร้อมกัปตันมืออาชีพ</p>
              <h1 className={`${heading} text-[clamp(40px,6vw,68px)] leading-[1.15]`}>
                ออกทะเลไปตกปลา
                <br />
                ในแบบของคุณ
              </h1>
              <p className="max-w-[520px] text-[19px] leading-[1.7] text-(--nl-on-navy)">
                เลือกเรือ เลือกทริป แล้วออกเดินทาง เรามีอุปกรณ์ เหยื่อ และกัปตันที่รู้จุดปลากินให้พร้อม คุณแค่มาพร้อมใจ
              </p>
            </div>
            <Placeholder label="ภาพเรือกลางทะเล" className="h-[400px] min-w-0 flex-[1_1_420px] rounded-[20px]" />
          </div>
        </div>
      </header>

      {/* Search — ส่งไปหน้า /boats เป็น query string */}
      <section aria-label="ค้นหาเรือ" className="px-6">
        <form
          action="/boats"
          className="mx-auto -mt-14 grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(200px,1fr))] items-end gap-4 rounded-[20px] bg-white p-6 shadow-[0_12px_32px_rgba(14,36,51,0.12)]"
        >
          <label className={label}>
            ท่าเรือ
            <select name="port" className={field} defaultValue="all">
              <option value="all">ทุกท่าเรือ</option>
              {PORTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            วันออกเรือ
            <input type="date" name="date" min={tomorrow} max={addDays(tomorrow, CALENDAR_DAYS - 1)} className={field} />
          </label>
          <label className={label}>
            ประเภททริป
            <select name="trip" className={field} defaultValue="full">
              {TRIPS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            จำนวนคน
            <input type="number" name="guests" min={1} max={20} defaultValue={4} className={field} />
          </label>
          <button type="submit" className="flex h-[50px] items-center justify-center gap-2 rounded-xl bg-(--nl-teal) text-[17px] font-semibold text-white hover:bg-(--nl-teal-dk)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
            ค้นหาเรือว่าง
          </button>
        </form>
      </section>

      {/* Trips */}
      <section id="trips" className="px-6 pt-24">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className={`${heading} text-[40px]`}>แพ็กเกจทริป</h2>
            <p className="text-lg text-(--nl-muted)">เลือกระยะเวลาที่เหมาะกับกลุ่มของคุณ ราคาเหมาลำทั้งเรือ</p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
            {TRIPS.map((t) => {
              const popular = t.id === 'full';
              const price = startingAt(t.id);
              return (
                <article
                  key={t.id}
                  className={`flex flex-col gap-4 rounded-[20px] p-8 ${popular ? 'bg-(--nl-navy) text-white' : 'border border-(--nl-line) bg-white'}`}
                >
                  <div className="flex items-center justify-between">
                    <TripIcon trip={t.id} />
                    {popular && <span className="rounded-full bg-(--nl-accent) px-3 py-1.5 text-[13px] font-semibold text-(--nl-ink)">ยอดนิยม</span>}
                  </div>
                  <h3 className={`${heading} text-[26px]`}>{t.id === 'night' ? 'ตกหมึก / กลางคืน' : t.label}</h3>
                  <p className={`leading-[1.7] ${popular ? 'text-(--nl-on-navy)' : 'text-(--nl-muted)'}`}>{t.blurb}</p>
                  {price !== null && (
                    <p className={`mt-auto text-[15px] ${popular ? 'text-(--nl-on-navy)' : 'text-(--nl-label)'}`}>
                      เริ่มต้น <strong className={`${heading} text-[28px] ${popular ? 'text-white' : 'text-(--nl-ink)'}`}>{baht(price)}</strong> / ลำ
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured boats */}
      <section className="px-6 pt-24">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h2 className={`${heading} text-[40px]`}>เรือแนะนำ</h2>
              <p className="text-lg text-(--nl-muted)">ทุกลำผ่านการตรวจความปลอดภัย มีเสื้อชูชีพครบทุกที่นั่ง</p>
            </div>
            <Link href="/boats" className="py-3 text-[17px] font-semibold text-(--nl-teal) hover:text-(--nl-teal-dk)">
              ดูเรือทั้งหมด →
            </Link>
          </div>
          {featured.length === 0 ? (
            <p className="rounded-[20px] border border-dashed border-(--nl-field) bg-white p-12 text-center text-(--nl-muted)">ยังไม่มีเรือในระบบ</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
              {featured.map((b) => (
                <article key={b.id} className="flex flex-col overflow-hidden rounded-[20px] border border-(--nl-line) bg-white">
                  <Placeholder label={`ภาพ ${b.name}`} className="h-[220px]" />
                  <div className="flex flex-1 flex-col gap-3.5 p-6">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`${heading} text-2xl`}>{b.name}</h3>
                      <PortBadge>{b.port}</PortBadge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-[15px] text-(--nl-muted)">
                      <span>ยาว {b.lengthM} ม.</span>
                      <span>·</span>
                      <span>รับ {b.seats} คน</span>
                      <span>·</span>
                      <span>{b.kind}</span>
                    </div>
                    <div className="mt-auto flex items-center justify-between border-t border-(--nl-divider) pt-4">
                      {b.priceFull !== null ? (
                        <p className="text-[15px] text-(--nl-muted)">
                          เต็มวัน <strong className={`${heading} text-2xl text-(--nl-ink)`}>{baht(b.priceFull)}</strong>
                        </p>
                      ) : (
                        <span />
                      )}
                      <Link href={`/boats/${b.id}`} className="rounded-xl bg-(--nl-teal) px-5 py-3 text-[15px] font-semibold text-white hover:bg-(--nl-teal-dk)">
                        ดูและจอง
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How + included */}
      <section id="how" className="px-6 pt-24">
        <div className="mx-auto flex max-w-[1200px] flex-wrap gap-12">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-7">
            <h2 className={`${heading} text-[40px]`}>จองง่ายใน 3 ขั้นตอน</h2>
            <ol className="flex flex-col gap-6">
              {[
                ['เลือกเรือและวันที่', 'ดูเรือว่างตามท่าเรือ ขนาดกลุ่ม และประเภททริปที่ต้องการ'],
                ['มัดจำ 30%', 'ชำระผ่านพร้อมเพย์หรือบัตร ส่วนที่เหลือจ่ายที่ท่าเรือ'],
                ['มาถึงท่าเรือ ออกเดินทาง', 'กัปตันติดต่อทาง LINE ก่อนวันเดินทาง พร้อมแจ้งสภาพอากาศ'],
              ].map(([title, desc], i) => (
                <li key={title} className="flex gap-5">
                  <span className={`${heading} flex h-12 w-12 flex-none items-center justify-center rounded-full bg-(--nl-accent) text-[22px] text-(--nl-ink)`}>{i + 1}</span>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <p className="leading-[1.6] text-(--nl-muted)">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-5 rounded-[20px] border border-(--nl-line) bg-white p-8">
            <h3 className={`${heading} text-[26px]`}>รวมในทุกทริป</h3>
            <ul className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
              {INCLUDED.map((it) => (
                <li key={it} className="flex items-center gap-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--nl-teal)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                  {it}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Spots */}
      <section id="spots" className="px-6 pt-24">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
          <h2 className={`${heading} text-[40px]`}>ท่าเรือที่ให้บริการ</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
            {PORTS.map((p) => (
              <Link key={p.id} href={`/boats?port=${encodeURIComponent(p.id)}`} className="flex flex-col gap-3">
                <Placeholder label={`ภาพ ${p.id}`} className="h-[180px] rounded-2xl" />
                <div className="flex items-baseline justify-between">
                  <span className={`${heading} text-[22px]`}>{p.id}</span>
                  <span className="text-[15px] text-(--nl-muted)">{boatCount.get(p.id) ?? 0} ลำ</span>
                </div>
                <span className="text-[15px] text-(--nl-muted)">{p.fish}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-6 rounded-3xl bg-(--nl-accent) p-12">
          <div className="flex max-w-[640px] flex-col gap-2">
            <h2 className={`${heading} text-4xl`}>ไม่แน่ใจว่าจะเลือกเรือลำไหน?</h2>
            <p className="text-lg">บอกจำนวนคนและปลาที่อยากตก ทีมงานจะแนะนำเรือและจุดที่เหมาะให้</p>
          </div>
          <a href="#top" className="rounded-full bg-(--nl-ink) px-7 py-4 text-[17px] font-semibold text-white">
            แชทกับเราทาง LINE
          </a>
        </div>
      </section>

      <footer className="bg-(--nl-ink) px-6 py-12 text-(--nl-footer)">
        <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-8 text-[15px]">
          <div className="flex flex-col gap-2">
            <span className={`${heading} text-[22px] text-white`}>น้ำลึก</span>
            <span>บริการเช่าเรือตกปลาเหมาลำ</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-white">ติดต่อ</span>
            <span>โทร [เบอร์โทร]</span>
            <span>LINE [LINE ID]</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-white">นโยบาย</span>
            <a href="#top" className="underline">การยกเลิกและสภาพอากาศ</a>
            <a href="#top" className="underline">ความปลอดภัยบนเรือ</a>
          </div>
        </div>
      </footer>
    </>
  );
}

function TripIcon({ trip }: { trip: TripType }) {
  const stroke = trip === 'full' ? 'var(--nl-accent)' : 'var(--nl-teal)';
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {trip === 'half' && (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" />
        </>
      )}
      {trip === 'full' && (
        <>
          <path d="M3 17c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0" />
          <path d="M5 14l1.5-5h11L19 14" />
        </>
      )}
      {trip === 'night' && <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />}
    </svg>
  );
}
