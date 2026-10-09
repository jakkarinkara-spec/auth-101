'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { field, fieldLabel, heading, primaryButton } from '../../_components/styles';

export type ProfileValues = { fullName: string; phone: string; address: string; contactEmail: string };

// ฟอร์มข้อมูลส่วนตัวเจ้าของเรือ — บันทึกแล้วไปหน้า next หรืออยู่หน้าเดิม (เจ้าของเรือที่อนุมัติแล้ว = ส่งคำขอแก้ไข)
// (มีคำขอแก้ไขรอ admin ตรวจ → หน้าไม่แสดงฟอร์มนี้ ใช้ปุ่มยกเลิกคำขอแทน)
// editRequest = เจ้าของเรือที่อนุมัติแล้ว — ปุ่มเป็น "ส่งคำขอแก้ไข" (ไม่ได้บันทึกทันที ต้องรอ admin อนุมัติ)
export default function ProfileForm({
  initial,
  next,
  defaultEmail,
  editRequest = false,
}: {
  initial: ProfileValues;
  next: string | null;
  defaultEmail: string;
  editRequest?: boolean;
}) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const set = (k: keyof ProfileValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setV((prev) => ({ ...prev, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch('/api/owner-profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: v.phone, address: v.address, contactEmail: v.contactEmail }),
    }).catch(() => null);
    setSaving(false);

    if (res?.ok) {
      if (next) {
        router.push(next);
      } else {
        // เจ้าของเรือที่อนุมัติแล้ว: ส่งคำขอแก้ไขแล้ว — refresh แล้วหน้าแสดงกล่องคำขอแทนฟอร์ม
        setMessage({ ok: true, text: 'ส่งคำขอแก้ไขแล้ว — รอผู้ดูแลระบบอนุมัติ ระหว่างนี้ยังใช้ข้อมูลเดิม' });
      }
      router.refresh();
      return;
    }
    const body = await res?.json().catch(() => null);
    const msg = String(body?.message ?? '');
    setMessage({
      ok: false,
      text: msg.includes('already pending')
        ? 'มีคำขอแก้ไขรออนุมัติอยู่ — รอผู้ดูแลระบบตรวจ หรือยกเลิกคำขอก่อนจึงส่งใหม่ได้'
        : msg.includes('No changes')
          ? 'ข้อมูลเหมือนที่ใช้อยู่ ไม่มีอะไรให้ส่ง'
          : msg.includes('Phone')
        ? 'เบอร์โทรไม่ถูกต้อง'
        : msg.includes('email')
          ? 'อีเมลไม่ถูกต้อง'
          : msg
            ? `บันทึกไม่สำเร็จ: ${msg}`
            : 'บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 rounded-[20px] border border-(--nl-line) bg-white p-6 sm:p-8">
      <h2 className={`${heading} text-[22px]`}>ข้อมูลส่วนตัว</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        {/* คำอธิบายอยู่ใต้ช่อง — ถ้าอยู่ในป้ายจะขึ้นบรรทัดใหม่ ทำให้ช่องชื่อเหลื่อมกับช่องเบอร์โทร */}
        <div className="flex flex-col gap-2">
          <label className={fieldLabel}>
            ชื่อ
            {/* ชื่อเจ้าของเรือ = ชื่อที่ลงทะเบียน — แก้ที่นี่ไม่ได้ (server ใช้ชื่อจากบัญชีเสมอ) */}
            <input value={v.fullName} readOnly aria-readonly="true" className={`${field} cursor-not-allowed bg-(--nl-bg) text-(--nl-muted)`} />
          </label>
          <span className="text-[13px] text-(--nl-muted)">ชื่อบัญชี — แก้ได้ทันทีที่หน้าโปรไฟล์ของฉัน</span>
        </div>
        <label className={fieldLabel}>
          เบอร์โทร
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={v.phone}
            onChange={set('phone')}
            required
            placeholder="08x-xxx-xxxx"
            className={field}
          />
        </label>
      </div>
      <label className={fieldLabel}>
        ที่อยู่
        <textarea
          value={v.address}
          onChange={set('address')}
          required
          rows={3}
          maxLength={500}
          autoComplete="street-address"
          className={`${field} h-auto py-3 leading-relaxed`}
        />
      </label>
      <label className={fieldLabel}>
        อีเมลติดต่อ <span className="font-normal text-(--nl-muted)">(ถ้ามี — เว้นว่างได้)</span>
        <input
          type="email"
          value={v.contactEmail}
          onChange={set('contactEmail')}
          placeholder={defaultEmail}
          maxLength={200}
          className={field}
        />
      </label>

      {message && (
        <p
          role={message.ok ? 'status' : 'alert'}
          className={`rounded-xl px-4 py-3 text-[15px] ${message.ok ? 'bg-(--nl-tint) text-(--nl-teal-dk)' : 'bg-[#FDECEC] text-[#B42318]'}`}
        >
          {message.text}
        </p>
      )}

      <button type="submit" disabled={saving} className={`${primaryButton} self-end px-8`}>
        {editRequest ? (saving ? 'กำลังส่งคำขอ…' : 'ส่งคำขอแก้ไข') : saving ? 'กำลังบันทึก…' : 'บันทึก'}
      </button>
    </form>
  );
}
