'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BOAT_TAGS, PORTS, TRIPS } from '@/app/lib/boats';
import { field, fieldLabel, heading, primaryButton } from '../../_components/styles';

export type BoatFormValues = {
  id?: string;
  name: string;
  port: string;
  lengthM: number | null;
  seats: number | null;
  kind: string;
  captain: string;
  description: string | null;
  engine: string | null;
  equipment: string | null;
  tags: string[];
  priceHalf: number | null;
  priceFull: number | null;
  priceNight: number | null;
};

const PRICE_KEY = { half: 'priceHalf', full: 'priceFull', night: 'priceNight' } as const;
const section = 'flex flex-col gap-5 rounded-[20px] border border-(--nl-line) bg-white p-6 sm:p-8';
const num = (v: number | null) => (v === null ? '' : String(v));

const EMPTY: BoatFormValues = {
  name: '',
  port: '',
  lengthM: null,
  seats: null,
  kind: '',
  captain: '',
  description: null,
  engine: null,
  equipment: null,
  tags: [],
  priceHalf: null,
  priceFull: null,
  priceNight: null,
};

// ฟอร์มเรือ
//   mode="admin" (ค่าเริ่มต้น): ไม่มี id = เพิ่มใหม่ (POST /api/boats), มี id = แก้ไข (PATCH) ส่งทุก field
//   mode="apply": ผู้ใช้สมัครเป็นเจ้าของเรือ — ส่งข้อมูลเรือ + เบอร์โทร + หมายเหตุ ไป POST /api/owner-applications
export default function BoatForm({ boat = EMPTY, mode = 'admin' }: { boat?: BoatFormValues; mode?: 'admin' | 'apply' }) {
  const apply = mode === 'apply';
  const router = useRouter();
  const [v, setV] = useState({
    name: boat.name,
    port: boat.port,
    lengthM: num(boat.lengthM),
    seats: num(boat.seats),
    kind: boat.kind,
    captain: boat.captain,
    description: boat.description ?? '',
    engine: boat.engine ?? '',
    equipment: boat.equipment ?? '',
    priceHalf: num(boat.priceHalf),
    priceFull: num(boat.priceFull),
    priceNight: num(boat.priceNight),
  });
  const [tags, setTags] = useState<string[]>(boat.tags);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setV((prev) => ({ ...prev, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!v.priceHalf && !v.priceFull && !v.priceNight) {
      setError('ใส่ราคาอย่างน้อยหนึ่งประเภททริป');
      return;
    }
    setSaving(true);
    const res = apply
      ? await fetch('/api/owner-applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ boat: { ...v, tags }, note }),
        }).catch(() => null)
      : await fetch(boat.id ? `/api/boats/${boat.id}` : '/api/boats', {
          method: boat.id ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...v, tags }),
        }).catch(() => null);
    setSaving(false);

    // สำเร็จ → กลับหน้ารายการ (เจ้าของเรือ: คำขอเพิ่มเรือ, admin: จัดการเรือ)
    if (res?.ok) {
      router.push(apply ? '/owner/boat-requests' : '/admin/boats');
      router.refresh();
      return;
    }
    const body = await res?.json().catch(() => null);
    if (apply && res?.status === 409) {
      setError(
        String(body?.message ?? '').includes('profile') || String(body?.message ?? '').includes('not approved')
          ? 'ต้องให้ผู้ดูแลระบบอนุมัติตัวบุคคลก่อน จึงขอเพิ่มเรือได้'
          : 'มีคำขอที่รออนุมัติครบ 3 รายการแล้ว รอผู้ดูแลระบบตรวจก่อน',
      );
      return;
    }
    setError(
      res?.status === 403
        ? 'บัญชีนี้ไม่มีสิทธิ์แก้ไขเรือ'
        : body?.message
          ? `บันทึกไม่สำเร็จ: ${body.message}`
          : 'บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <section className={section}>
        <h2 className={`${heading} text-[22px]`}>ข้อมูลเรือ</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className={fieldLabel}>
            ชื่อเรือ
            <input value={v.name} onChange={set('name')} required className={field} />
          </label>
          <label className={fieldLabel}>
            ท่าเรือ
            <select value={v.port} onChange={set('port')} required className={field}>
              <option value="" disabled>
                เลือกท่าเรือ
              </option>
              {PORTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label className={fieldLabel}>
            ประเภทเรือ
            <input value={v.kind} onChange={set('kind')} required placeholder="เช่น เรือไฟเบอร์" className={field} />
          </label>
          <label className={fieldLabel}>
            ชื่อกัปตัน
            <input value={v.captain} onChange={set('captain')} required className={field} />
          </label>
          <label className={fieldLabel}>
            ความยาว (เมตร)
            <input type="number" min={1} max={200} step={1} value={v.lengthM} onChange={set('lengthM')} required className={field} />
          </label>
          <label className={fieldLabel}>
            รับได้สูงสุด (คน)
            <input type="number" min={1} max={100} step={1} value={v.seats} onChange={set('seats')} required className={field} />
          </label>
        </div>
      </section>

      <section className={section}>
        <h2 className={`${heading} text-[22px]`}>รายละเอียด</h2>
        <label className={fieldLabel}>
          คำอธิบาย <span className="font-normal text-(--nl-muted)">(ไม่ใส่ก็ได้ — หน้าเรือจะสรุปจากข้อมูลด้านบนแทน)</span>
          <textarea
            value={v.description}
            onChange={set('description')}
            rows={3}
            className={`${field} h-auto py-3 leading-relaxed`}
          />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className={fieldLabel}>
            เครื่องยนต์ <span className="font-normal text-(--nl-muted)">(ไม่ใส่ก็ได้)</span>
            <input value={v.engine} onChange={set('engine')} className={field} />
          </label>
          <label className={fieldLabel}>
            อุปกรณ์ <span className="font-normal text-(--nl-muted)">(ไม่ใส่ก็ได้)</span>
            <input value={v.equipment} onChange={set('equipment')} placeholder="เช่น โซนาร์ · GPS" className={field} />
          </label>
        </div>
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 text-sm font-medium text-(--nl-label)">สิ่งอำนวยความสะดวกบนเรือ</legend>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {BOAT_TAGS.map((t) => (
              <label key={t} className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={tags.includes(t)}
                  onChange={(e) => setTags(e.target.checked ? [...tags, t] : tags.filter((x) => x !== t))}
                  className="h-5 w-5 accent-(--nl-teal)"
                />
                {t}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className={section}>
        <div className="flex flex-col gap-1">
          <h2 className={`${heading} text-[22px]`}>ราคาเหมาลำ (บาท)</h2>
          <p className="text-sm text-(--nl-muted)">
            เว้นว่าง = เรือลำนี้ไม่รับทริปแบบนั้น — ต้องมีอย่างน้อยหนึ่งแบบ
            {apply ? ' ผู้ดูแลระบบอาจปรับราคาก่อนเปิดรับจอง' : ' ราคาใหม่ไม่กระทบคำขอจองที่มีอยู่แล้ว'}
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {TRIPS.map((t) => (
            <label key={t.id} className={fieldLabel}>
              {t.label}
              <input
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={v[PRICE_KEY[t.id]]}
                onChange={set(PRICE_KEY[t.id])}
                placeholder="ไม่รับ"
                className={field}
              />
            </label>
          ))}
        </div>
      </section>

      {apply && (
        <section className={section}>
          <div className="flex flex-col gap-1">
            <h2 className={`${heading} text-[22px]`}>หมายเหตุถึงผู้ดูแลระบบ</h2>
            <p className="text-sm text-(--nl-muted)">ผู้ดูแลระบบจะติดต่อตามข้อมูลส่วนตัวเพื่อยืนยันตัวตนและความเป็นเจ้าของเรือก่อนอนุมัติ</p>
          </div>
          <label className={fieldLabel}>
            หมายเหตุ <span className="font-normal text-(--nl-muted)">(ไม่ใส่ก็ได้ — เช่น ทะเบียนเรือ)</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} className={field} />
          </label>
        </section>
      )}

      {error && (
        <p role="alert" className="rounded-xl bg-[#FDECEC] px-4 py-3 text-[15px] text-[#B42318]">
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        {!apply && (
          <Link
            href="/admin/boats"
            className="flex h-[50px] items-center rounded-xl border border-(--nl-field) bg-white px-6 font-semibold hover:border-(--nl-navy)"
          >
            ยกเลิก
          </Link>
        )}
        <button type="submit" disabled={saving} className={`${primaryButton} px-8`}>
          {saving ? 'กำลังบันทึก…' : apply ? 'ส่งคำขอ' : boat.id ? 'บันทึกการแก้ไข' : 'เพิ่มเรือ'}
        </button>
      </div>
    </form>
  );
}
