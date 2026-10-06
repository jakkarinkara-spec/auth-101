'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { thaiDate } from '@/app/lib/boats';
import { field, fieldLabel, heading, primaryButton } from '../../_components/styles';

export type Closure = { id: string; date: string; reason: string | null; booked: boolean };

// จัดการวันปิดรับจองของเรือหนึ่งลำ — เพิ่มเป็นช่วงวันที่ (from–to) และลบทีละวัน
export default function Closures({
  boatId,
  closures,
  minDate,
  maxDate,
}: {
  boatId: string;
  closures: Closure[];
  minDate: string;
  maxDate: string;
}) {
  const router = useRouter();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/boats/${boatId}/closures`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: to || from, reason }),
    }).catch(() => null);
    setSaving(false);
    const body = await res?.json().catch(() => null);
    if (res?.status === 201) {
      setMessage({
        ok: true,
        text: `ปิดรับจองเพิ่ม ${body.created} วัน${body.skipped ? ` (ข้าม ${body.skipped} วันที่ปิดอยู่แล้ว)` : ''}`,
      });
      setFrom('');
      setTo('');
      setReason('');
      router.refresh();
    } else {
      setMessage({ ok: false, text: body?.message ? `ไม่สำเร็จ: ${body.message}` : 'ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' });
    }
  }

  async function remove(id: string) {
    setRemoving(id);
    setMessage(null);
    const res = await fetch(`/api/boats/${boatId}/closures/${id}`, { method: 'DELETE' }).catch(() => null);
    setRemoving(null);
    if (res?.ok) router.refresh();
    else setMessage({ ok: false, text: 'ลบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' });
  }

  const bookedCount = closures.filter((c) => c.booked).length;

  return (
    <section className="flex flex-col gap-5 rounded-[20px] border border-(--nl-line) bg-white p-6 sm:p-8">
      <div className="flex flex-col gap-1">
        <h2 className={`${heading} text-[22px]`}>วันปิดรับจอง</h2>
        <p className="text-sm text-(--nl-muted)">
          เช่น ซ่อมบำรุง คลื่นลมแรง หรือกัปตันไม่ว่าง — ลูกค้าจะเห็นวันนั้นเป็น &quot;ปิด&quot; และจองไม่ได้ คำขอจองที่มีอยู่แล้วไม่ถูกยกเลิกอัตโนมัติ
        </p>
      </div>

      <form onSubmit={add} className="grid items-end gap-4 sm:grid-cols-[1fr_1fr_2fr_auto]">
        <label className={fieldLabel}>
          ตั้งแต่วันที่
          <input
            type="date"
            required
            min={minDate}
            max={maxDate}
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              if (to && to < e.target.value) setTo('');
            }}
            className={field}
          />
        </label>
        <label className={fieldLabel}>
          ถึงวันที่ <span className="font-normal text-(--nl-muted)">(วันเดียวเว้นว่าง)</span>
          <input type="date" min={from || minDate} max={maxDate} value={to} onChange={(e) => setTo(e.target.value)} className={field} />
        </label>
        <label className={fieldLabel}>
          เหตุผล <span className="font-normal text-(--nl-muted)">(ไม่ใส่ก็ได้)</span>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="เช่น ซ่อมเครื่องยนต์" className={field} />
        </label>
        <button type="submit" disabled={saving || !from} className={`${primaryButton} px-6`}>
          {saving ? 'กำลังบันทึก…' : 'ปิดรับจอง'}
        </button>
      </form>

      {message && (
        <p
          role={message.ok ? 'status' : 'alert'}
          className={`rounded-xl px-4 py-3 text-[15px] ${message.ok ? 'bg-(--nl-tint) text-(--nl-teal-dk)' : 'bg-[#FDECEC] text-[#B42318]'}`}
        >
          {message.text}
        </p>
      )}

      {bookedCount > 0 && (
        <p className="rounded-xl bg-(--nl-accent-soft) px-4 py-3 text-[15px] text-[#9A4A00]">
          มี {bookedCount} วันที่ปิดไว้แต่มีคำขอจองอยู่แล้ว — ตรวจและยกเลิกเองได้ที่หน้าแดชบอร์ด
        </p>
      )}

      {closures.length === 0 ? (
        <p className="text-[15px] text-(--nl-muted)">ยังไม่มีวันปิดรับจองที่จะถึง</p>
      ) : (
        <ul className="divide-y divide-(--nl-divider) rounded-[14px] border border-(--nl-line)">
          {closures.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="flex min-w-0 flex-col">
                <span className="font-semibold">{thaiDate(c.date, { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' })}</span>
                <span className="text-sm text-(--nl-muted)">
                  {c.reason ?? 'ไม่ระบุเหตุผล'}
                  {c.booked && <span className="font-semibold text-[#9A4A00]"> · มีคำขอจองวันนี้</span>}
                </span>
              </div>
              <button
                type="button"
                disabled={removing === c.id}
                onClick={() => remove(c.id)}
                className="rounded-lg border border-(--nl-field) bg-white px-3 py-1.5 text-sm hover:border-(--nl-teal) hover:text-(--nl-teal) disabled:opacity-50"
              >
                {removing === c.id ? 'กำลังเปิด…' : 'เปิดรับจองวันนี้'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
