'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ADDONS, DEPOSIT_RATE, TRIPS, baht, boatPrice, quote, thaiDate, tripLabel, type TripType } from '@/app/lib/boats';

type Boat = {
  id: string;
  name: string;
  seats: number;
  priceHalf: number | null;
  priceFull: number | null;
  priceNight: number | null;
};
type Day = { ymd: string; full: boolean; closed: boolean }; // full = เลือกไม่ได้, closed = admin ปิดรับจองวันนั้น

const heading = 'font-(family-name:--font-kanit) font-semibold';
// ไม่ใส่สีพื้นตรงนี้ — ให้แต่ละสถานะ (เลือก / ไม่เลือก / เต็ม) กำหนดเอง ไม่งั้น bg-white ชนกับ bg ของสถานะที่เลือก
// (Tailwind ตัดสินตามลำดับใน CSS ไม่ใช่ลำดับใน class → พื้นขาวทับ ตัวอักษรขาวเลยมองไม่เห็น)
const card = 'rounded-[14px] border-2';
const idle = 'border-(--nl-line) bg-white hover:border-(--nl-field)';

// ส่วนเลือกทริป / วัน / จำนวนคน / บริการเสริม + กล่องสรุปราคา
// ราคาที่แสดงคำนวณด้วย quote() ตัวเดียวกับที่ API ใช้บันทึก ตัวเลขจึงตรงกัน
export default function BookingForm({
  boat,
  days,
  initial,
  signedIn,
  admin,
  closed,
  children,
}: {
  boat: Boat;
  days: Day[];
  initial: { trip: TripType | undefined; date: string | null; guests: number };
  signedIn: boolean;
  admin: boolean; // admin จองไม่ได้ — ซ่อนปุ่มจอง
  closed: boolean; // เรือปิดรับจอง — ยังดูรายละเอียดได้ แต่จองไม่ได้
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [trip, setTrip] = useState(initial.trip);
  const [date, setDate] = useState(initial.date);
  const [guests, setGuests] = useState(initial.guests);
  const [addons, setAddons] = useState<string[]>(['lunch']);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  const q = trip ? quote(boat, trip, guests, addons) : null;
  // เปลี่ยนตัวเลือกหลังส่งแล้ว = เริ่มคำขอใหม่
  const edit = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setStatus('idle');
    setError('');
  };

  const months = [...new Set(days.map((d) => thaiDate(d.ymd, { month: 'long', year: 'numeric' })))].join(' – ');

  async function confirm() {
    if (!trip || !date) return;
    setStatus('sending');
    setError('');
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boatId: boat.id, tripType: trip, tripDate: date, guests, addons }),
    }).catch(() => null);

    if (res?.status === 201) {
      setStatus('done');
      router.refresh(); // ให้วันที่เพิ่งจองขึ้นว่าเต็ม
      return;
    }
    setStatus('idle');
    if (res?.status === 401) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    } else if (res?.status === 403) {
      setError('บัญชี admin จองเรือไม่ได้');
    } else if (res?.status === 409) {
      const body = await res.json().catch(() => null);
      // 409 มีสามกรณี: เรือเพิ่งถูกปิดรับจอง / วันนั้นเพิ่งถูกปิด / วันนั้นถูกจองแล้ว
      const msg = String(body?.message ?? '');
      setError(
        msg.includes('not accepting')
          ? 'เรือลำนี้ปิดรับจองแล้ว'
          : msg.includes('closed on that date')
            ? 'วันนี้เรือปิดรับจอง กรุณาเลือกวันอื่น'
            : 'วันนี้มีคนจองเรือลำนี้ไปแล้ว กรุณาเลือกวันอื่น',
      );
      router.refresh();
    } else {
      const body = await res?.json().catch(() => null);
      setError(body?.message ? `จองไม่สำเร็จ: ${body.message}` : 'จองไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    }
  }

  return (
    <div className="flex flex-wrap items-start gap-10">
      {/* Details + options */}
      <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-9">
        {children}

        <section className="flex flex-col gap-3.5">
          <h2 className={`${heading} text-2xl`}>1. เลือกทริป</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
            {TRIPS.map((t) => {
              const price = boatPrice(boat, t.id);
              const active = t.id === trip;
              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={price === null}
                  aria-pressed={active}
                  onClick={() => edit(setTrip)(t.id)}
                  className={`${card} flex flex-col gap-1 p-4 text-left ${
                    active ? 'border-(--nl-teal) bg-(--nl-tint)' : idle
                  } disabled:cursor-not-allowed disabled:border-dashed disabled:bg-[#EDF1F1] disabled:text-[#6B7C84]`}
                >
                  <span className="text-[17px] font-semibold">{t.label}</span>
                  <span className="text-sm text-(--nl-muted)">{t.time}</span>
                  <span className={`${heading} text-[22px]`}>{price === null ? 'ไม่มีบริการ' : baht(price)}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3.5">
          <h2 className={`${heading} text-2xl`}>
            2. เลือกวันออกเรือ{' '}
            <span className="font-(family-name:--font-plex-thai) text-base font-normal text-(--nl-muted)">{months}</span>
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(84px,1fr))] gap-2.5">
            {days.map((d) => {
              const active = d.ymd === date;
              const dow = thaiDate(d.ymd, { weekday: 'short' });
              const num = thaiDate(d.ymd, { day: 'numeric' });
              return (
                <button
                  key={d.ymd}
                  type="button"
                  disabled={d.full}
                  aria-pressed={active}
                  aria-label={`${thaiDate(d.ymd, { weekday: 'long', day: 'numeric', month: 'long' })}${d.closed ? ' ปิดรับจอง' : d.full ? ' เต็มแล้ว' : ''}`}
                  onClick={() => edit(setDate)(d.ymd)}
                  className={`${card} flex flex-col items-center gap-0.5 px-1.5 py-3 ${
                    active ? 'border-(--nl-navy) bg-(--nl-navy) text-white' : idle
                  } disabled:cursor-not-allowed disabled:border-dashed disabled:border-(--nl-field) disabled:bg-[#EDF1F1] disabled:text-[#6B7C84]`}
                >
                  <span className={`text-[13px] ${active || d.full ? '' : 'text-(--nl-muted)'}`}>{dow}</span>
                  <span className={`${heading} text-2xl ${d.full ? 'line-through' : ''}`}>{num}</span>
                  <span className={`text-xs ${active || d.full ? '' : 'text-(--nl-teal)'}`}>{d.closed ? 'ปิด' : d.full ? 'เต็ม' : 'ว่าง'}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3.5">
          <h2 className={`${heading} text-2xl`}>3. จำนวนคนและบริการเสริม</h2>
          <div className="flex items-center justify-between gap-4 rounded-[14px] border border-(--nl-line) bg-white px-4 py-3">
            <div className="flex flex-col">
              <span className="text-[17px] font-semibold">ผู้ร่วมทริป</span>
              <span className="text-sm text-(--nl-muted)">สูงสุด {boat.seats} คน</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="ลดจำนวนคน"
                disabled={guests <= 1}
                onClick={() => edit(setGuests)(Math.max(1, guests - 1))}
                className="h-11 w-11 rounded-full border border-(--nl-field) bg-white text-[22px] disabled:opacity-40"
              >
                −
              </button>
              <span aria-live="polite" className={`${heading} min-w-8 text-center text-2xl`}>
                {guests}
              </span>
              <button
                type="button"
                aria-label="เพิ่มจำนวนคน"
                disabled={guests >= boat.seats}
                onClick={() => edit(setGuests)(Math.min(boat.seats, guests + 1))}
                className="h-11 w-11 rounded-full border border-(--nl-field) bg-white text-[22px] disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>
          {ADDONS.map((a) => (
            <label key={a.id} className="flex cursor-pointer items-center gap-3.5 rounded-[14px] border border-(--nl-line) bg-white px-4 py-3.5">
              <input
                type="checkbox"
                checked={addons.includes(a.id)}
                onChange={(e) => edit(setAddons)(e.target.checked ? [...addons, a.id] : addons.filter((x) => x !== a.id))}
                className="h-5.5 w-5.5 flex-none accent-(--nl-teal)"
              />
              <span className="flex flex-1 flex-col">
                <span className="font-semibold">{a.label}</span>
                <span className="text-sm text-(--nl-muted)">{a.desc}</span>
              </span>
              <span className="font-semibold whitespace-nowrap">{a.per === 'person' ? `${baht(a.price)} / คน` : baht(a.price)}</span>
            </label>
          ))}
        </section>
      </div>

      {/* Summary */}
      <aside
        aria-label="สรุปการจอง"
        className="flex min-w-0 flex-[1_1_340px] flex-col gap-4.5 rounded-[20px] border border-(--nl-line) bg-white p-7 shadow-[0_12px_32px_rgba(14,36,51,0.08)] lg:sticky lg:top-6"
      >
        <h2 className={`${heading} text-2xl`}>สรุปการจอง</h2>
        <dl className="flex flex-col gap-3">
          {[
            ['เรือ', boat.name],
            ['วันที่', date ? thaiDate(date) : 'ยังไม่ได้เลือก'],
            ['ทริป', trip ? tripLabel(trip) : '—'],
            ['ผู้ร่วมทริป', `${guests} คน`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="text-(--nl-muted)">{k}</dt>
              <dd className="font-semibold">{v}</dd>
            </div>
          ))}
        </dl>

        {q ? (
          <>
            <div className="flex flex-col gap-2.5 border-t border-(--nl-divider) pt-4 text-[15px]">
              {q.lines.map((l) => (
                <div key={l.label} className="flex justify-between gap-3">
                  <span className="text-(--nl-muted)">{l.label}</span>
                  <span>{baht(l.amount)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-baseline justify-between border-t border-(--nl-divider) pt-4">
              <span className="text-[17px] font-semibold">รวมทั้งหมด</span>
              <span className={`${heading} text-[32px]`}>{baht(q.total)}</span>
            </div>
            <div className="flex justify-between rounded-xl bg-(--nl-accent-soft) px-3.5 py-3 text-[15px]">
              <span>มัดจำ {Math.round(DEPOSIT_RATE * 100)}%</span>
              <strong>{baht(q.deposit)}</strong>
            </div>
          </>
        ) : (
          <p className="text-(--nl-muted)">เรือลำนี้ยังไม่เปิดรับจอง</p>
        )}

        {error && (
          <p role="alert" className="rounded-xl bg-[#FDECEC] px-3.5 py-3 text-[15px] text-[#B42318]">
            {error}
          </p>
        )}

        {closed ? (
          <p role="status" className="rounded-[14px] bg-[#EDF1F1] px-4 py-3.5 text-[15px] font-semibold text-(--nl-label)">
            เรือลำนี้ปิดรับจองชั่วคราว
          </p>
        ) : admin ? (
          <p role="status" className="rounded-[14px] bg-[#EDF1F1] px-4 py-3.5 text-[15px] font-semibold text-(--nl-label)">
            บัญชี admin จองเรือไม่ได้
          </p>
        ) : status === 'done' ? (
          <div role="status" className="flex items-start gap-3 rounded-[14px] bg-(--nl-tint) p-4">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--nl-teal-dk)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-none">
              <circle cx="12" cy="12" r="9" />
              <path d="M8 12.5l3 3 5-6" />
            </svg>
            <div className="flex flex-col gap-1">
              <strong className="text-[17px] text-(--nl-teal-dk)">ส่งคำขอจองแล้ว</strong>
              <span className="text-[15px]">กัปตันจะยืนยันทาง LINE ภายใน 2 ชั่วโมง</span>
              <Link href="/bookings" className="mt-1 text-[15px] font-semibold text-(--nl-teal) hover:text-(--nl-teal-dk)">
                ดูการจองของฉัน →
              </Link>
            </div>
          </div>
        ) : signedIn ? (
          <button
            type="button"
            onClick={confirm}
            disabled={!q || !date || status === 'sending'}
            className="min-h-[54px] rounded-[14px] bg-(--nl-accent) text-lg font-semibold text-(--nl-ink) disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === 'sending' ? 'กำลังส่งคำขอ…' : !date ? 'ไม่มีวันว่างในช่วงนี้' : 'ยืนยันคำขอจอง'}
          </button>
        ) : (
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
            className="flex min-h-[54px] items-center justify-center rounded-[14px] bg-(--nl-accent) text-lg font-semibold text-(--nl-ink)"
          >
            เข้าสู่ระบบเพื่อจอง
          </Link>
        )}

        <p className="text-sm leading-[1.6] text-(--nl-muted)">
          ยกเลิกฟรีก่อนออกเรือ 72 ชม. หากคลื่นลมแรงจนออกเรือไม่ได้ เลื่อนวันหรือคืนเงินเต็มจำนวน
        </p>
      </aside>
    </div>
  );
}
