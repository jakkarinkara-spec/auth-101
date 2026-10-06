'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { field, fieldLabel, heading, primaryButton } from '../../_components/styles';

export type ProfileValues = { fullName: string; phone: string; address: string; contactEmail: string };

// ฟอร์มข้อมูลส่วนตัวเจ้าของเรือ — บันทึกแล้วไปหน้า next (ค่าเริ่มต้น /owner) หรืออยู่หน้าเดิม
export default function ProfileForm({ initial, next, defaultEmail }: { initial: ProfileValues; next: string | null; defaultEmail: string }) {
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
      body: JSON.stringify(v),
    }).catch(() => null);
    setSaving(false);

    if (res?.ok) {
      if (next) {
        router.push(next);
      } else {
        setMessage({ ok: true, text: 'บันทึกข้อมูลแล้ว' });
      }
      router.refresh();
      return;
    }
    const body = await res?.json().catch(() => null);
    const msg = String(body?.message ?? '');
    setMessage({
      ok: false,
      text: msg.includes('Phone')
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
        <label className={fieldLabel}>
          ชื่อ-นามสกุล
          <input value={v.fullName} onChange={set('fullName')} required maxLength={200} autoComplete="name" className={field} />
        </label>
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
        <input type="email" value={v.contactEmail} onChange={set('contactEmail')} placeholder={defaultEmail} maxLength={200} className={field} />
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
        {saving ? 'กำลังบันทึก…' : 'บันทึก'}
      </button>
    </form>
  );
}
