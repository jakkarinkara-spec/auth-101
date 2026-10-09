'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { field, fieldLabel, heading, primaryButton } from '../_components/styles';

const card = 'flex flex-col gap-5 rounded-[20px] border border-(--nl-line) bg-white p-6 sm:p-8';
type Msg = { ok: boolean; text: string } | null;

// ต้องตรงกับ /api/account
export const NAME_MAX = 200;
// ต้องตรงกับ /api/account/phones
export const PHONES_MAX = 3;

function Message({ msg }: { msg: Msg }) {
  if (!msg) return null;
  return (
    <p
      role={msg.ok ? 'status' : 'alert'}
      className={`rounded-xl px-4 py-3 text-[15px] ${msg.ok ? 'bg-(--nl-tint) text-(--nl-teal-dk)' : 'bg-[#FDECEC] text-[#B42318]'}`}
    >
      {msg.text}
    </p>
  );
}

// ตรวจชื่อตอนกดบันทึก — คืนข้อความเตือน หรือ null = ผ่าน
function checkName(raw: string): string | null {
  const name = raw.trim();
  if (!name) return 'กรุณาใส่ชื่อ';
  if (name.length > NAME_MAX) return `ชื่อยาวได้ไม่เกิน ${NAME_MAX} ตัวอักษร (ตอนนี้ ${name.length} ตัวอักษร)`;
  return null;
}

// ตรวจเบอร์ตอนกดบันทึก (รับเฉพาะแถวที่ไม่ว่าง) — คืนข้อความเตือน หรือ null = ผ่าน
function checkPhones(phones: string[]): string | null {
  for (const p of phones) {
    const digits = p.replace(/\D/g, '');
    if (!/^[\d\s+()-]+$/.test(p) || digits.length < 9 || digits.length > 15) {
      return `เบอร์ "${p}" ไม่ถูกต้อง — ใช้ตัวเลข 9–15 หลัก (ใส่ - หรือช่องว่างคั่นได้)`;
    }
  }
  const digits = phones.map((p) => p.replace(/\D/g, ''));
  const dup = digits.find((d, i) => digits.indexOf(d) !== i);
  if (dup) return `มีเบอร์ซ้ำกัน (${phones[digits.indexOf(dup)]})`;
  return null;
}

const samePhones = (a: string[], b: string[]) => a.length === b.length && a.every((p, i) => p === b[i]);

// กล่องเตือน — พื้นเหลืองอำพัน + แถบซ้าย + ไอคอน ให้เห็นชัด
function Warning({ text }: { text: string }) {
  return (
    <p role="alert" className="flex items-start gap-3 rounded-xl border border-[#F5C26B] border-l-4 border-l-[#E8961E] bg-[#FFF4DC] px-4 py-3 text-[15px] font-medium text-[#7A4B00]">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-0.5 flex-none">
        <path d="M12 3l9.5 17h-19L12 3z" />
        <path d="M12 10v4M12 17.5v.01" />
      </svg>
      <span>{text}</span>
    </p>
  );
}

// ฟอร์มโปรไฟล์ — ชื่อบัญชี + เบอร์ติดต่อ (สูงสุด 3 เบอร์) ใช้ปุ่มบันทึกเดียวกัน
// กดบันทึก: ตรวจทั้งสองส่วนก่อน → ส่งเฉพาะส่วนที่เปลี่ยน
// (ชื่อมีผลทันที เป็นชื่อเจ้าของเรือด้วย ไม่ต้องรอ admin อนุมัติ)
// ไม่ผ่าน → กล่องเตือนใต้ส่วนนั้น (หายเมื่อเริ่มแก้)
export function AccountForm({ name: initialName, email, phones: initialPhones }: { name: string; email: string; phones: string[] }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [rows, setRows] = useState<string[]>(initialPhones.length ? initialPhones : ['']);
  const [nameWarning, setNameWarning] = useState<string | null>(null);
  const [phonesWarning, setPhonesWarning] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  const editName = (next: string) => {
    setName(next);
    setNameWarning(null);
    setMsg(null);
  };
  const editRows = (next: string[]) => {
    setRows(next);
    setPhonesWarning(null);
    setMsg(null);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const trimmedName = name.trim();
    const phones = rows.map((p) => p.trim()).filter(Boolean);
    const nameProblem = checkName(name);
    const phonesProblem = checkPhones(phones);
    setNameWarning(nameProblem);
    setPhonesWarning(phonesProblem);
    if (nameProblem || phonesProblem) return;

    const nameChanged = trimmedName !== initialName;
    const phonesChanged = !samePhones(phones, initialPhones);
    if (!nameChanged && !phonesChanged) {
      setMsg({ ok: false, text: 'ข้อมูลเหมือนเดิม ไม่มีอะไรให้บันทึก' });
      return;
    }

    setSaving(true);
    const saved: string[] = [];
    let failed = false;

    if (nameChanged) {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName }),
      }).catch(() => null);
      if (res?.ok) {
        setName(trimmedName);
        saved.push('ชื่อ');
      } else {
        failed = true;
        const m = String((await res?.json().catch(() => null))?.message ?? '');
        // เงื่อนไขเดียวกับฝั่ง client — ถ้า server ตอบแบบนี้แสดงเป็นคำเตือน
        if (m.includes('required')) setNameWarning('กรุณาใส่ชื่อ');
        else if (m.includes('at most')) setNameWarning(`ชื่อยาวได้ไม่เกิน ${NAME_MAX} ตัวอักษร`);
      }
    }

    if (phonesChanged) {
      const res = await fetch('/api/account/phones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phones }),
      }).catch(() => null);
      if (res?.ok) {
        setRows(phones.length ? phones : ['']);
        saved.push('เบอร์ติดต่อ');
      } else {
        failed = true;
        const m = String((await res?.json().catch(() => null))?.message ?? '');
        if (m.includes('Duplicate')) setPhonesWarning('มีเบอร์ซ้ำกัน');
        else if (m.includes('invalid')) setPhonesWarning('มีเบอร์ที่ไม่ถูกต้อง — ใช้ตัวเลข 9–15 หลัก');
        else if (m.includes('At most')) setPhonesWarning(`ใส่ได้สูงสุด ${PHONES_MAX} เบอร์`);
      }
    }

    setSaving(false);
    if (saved.length) router.refresh();
    const done = saved.join('และ');
    if (!failed) setMsg({ ok: true, text: `บันทึก${done}แล้ว` });
    else if (saved.length) setMsg({ ok: false, text: `บันทึก${done}แล้ว แต่ส่วนที่เหลือบันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง` });
    else setMsg({ ok: false, text: 'บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' });
  }

  return (
    <form onSubmit={submit} noValidate className={card}>
      <h2 className={`${heading} text-[22px]`}>ข้อมูลบัญชี</h2>
      <div className="flex flex-col gap-2">
        <label className={fieldLabel}>
          ชื่อ
          <input
            value={name}
            onChange={(e) => editName(e.target.value)}
            maxLength={NAME_MAX + 50} // ให้พิมพ์เกินได้นิดหน่อยเพื่อเห็นคำเตือน — ตรวจจริงจาก NAME_MAX
            autoComplete="name"
            aria-invalid={nameWarning ? true : undefined}
            aria-describedby={nameWarning ? 'name-warning' : undefined}
            className={`${field} ${nameWarning ? 'border-[#E8961E] bg-[#FFFBF2] focus:border-[#E8961E] focus:ring-[#E8961E]/20' : ''}`}
          />
        </label>
        <span className="text-[13px] text-(--nl-muted)">ชื่อนี้ใช้แสดงในระบบ และเป็นชื่อเจ้าของเรือ (ถ้ามี)</span>
      </div>
      {nameWarning && (
        <div id="name-warning">
          <Warning text={nameWarning} />
        </div>
      )}
      <label className={fieldLabel}>
        อีเมล <span className="font-normal text-(--nl-muted)">(ใช้เข้าสู่ระบบ — แก้ไขไม่ได้)</span>
        <input value={email} readOnly aria-readonly="true" className={`${field} cursor-not-allowed bg-(--nl-bg) text-(--nl-muted)`} />
      </label>

      <hr className="border-(--nl-line)" />

      <div className="flex flex-col gap-1">
        <h2 className={`${heading} text-[22px]`}>เบอร์ติดต่อ</h2>
        <p className="text-sm text-(--nl-muted)">
          ใส่ได้สูงสุด {PHONES_MAX} เบอร์ — ผู้ดูแลระบบและเจ้าของเรือที่คุณจองจะเห็นเบอร์นี้เพื่อติดต่อเรื่องทริป
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {rows.map((p, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="w-14 flex-none text-sm text-(--nl-muted)">เบอร์ {i + 1}</span>
            <input
              type="tel"
              inputMode="tel"
              autoComplete={i === 0 ? 'tel' : 'off'}
              value={p}
              onChange={(e) => editRows(rows.map((r, j) => (j === i ? e.target.value : r)))}
              placeholder="08x-xxx-xxxx"
              aria-label={`เบอร์ติดต่อ ${i + 1}`}
              aria-invalid={phonesWarning ? true : undefined}
              className={`${field} min-w-0 flex-1 ${phonesWarning ? 'border-[#E8961E] bg-[#FFFBF2]' : ''}`}
            />
            <button
              type="button"
              onClick={() => editRows(rows.length > 1 ? rows.filter((_, j) => j !== i) : [''])}
              aria-label={`ลบเบอร์ ${i + 1}`}
              className="h-[50px] flex-none rounded-xl border border-(--nl-field) bg-white px-3 text-sm text-(--nl-muted) hover:border-[#B42318] hover:text-[#B42318]"
            >
              ลบ
            </button>
          </li>
        ))}
      </ul>

      {rows.length < PHONES_MAX ? (
        <button
          type="button"
          onClick={() => editRows([...rows, ''])}
          className="self-start rounded-xl border border-dashed border-(--nl-teal) px-4 py-2 text-sm font-semibold text-(--nl-teal) hover:bg-(--nl-tint)"
        >
          + เพิ่มเบอร์ ({rows.length}/{PHONES_MAX})
        </button>
      ) : (
        <p className="text-sm text-(--nl-muted)">ครบ {PHONES_MAX} เบอร์แล้ว — ลบเบอร์เดิมก่อนถ้าต้องการเพิ่มใหม่</p>
      )}

      {phonesWarning && <Warning text={phonesWarning} />}
      <Message msg={msg} />
      <button type="submit" disabled={saving} className={`${primaryButton} self-end px-8`}>
        {saving ? 'กำลังบันทึก…' : 'บันทึก'}
      </button>
    </form>
  );
}
