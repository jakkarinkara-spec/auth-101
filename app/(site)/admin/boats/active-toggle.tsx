'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

// ปุ่มเปิด / ปิดรับจอง — ปิดต้องกดยืนยันอีกครั้ง (เปิดกดครั้งเดียว)
export default function ActiveToggle({ id, active, upcoming }: { id: string; active: boolean; upcoming: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [arm, setArm] = useState(false);
  const [error, setError] = useState('');

  async function update(next: boolean) {
    setBusy(true);
    setError('');
    const res = await fetch(`/api/boats/${id}/active`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: next }),
    }).catch(() => null);
    setBusy(false);
    setArm(false);
    if (res?.ok) router.refresh();
    else setError('ไม่สำเร็จ ลองใหม่อีกครั้ง');
  }

  const btn = 'rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50';

  return (
    <div className="flex flex-col items-end gap-1">
      {active ? (
        arm ? (
          <div className="flex gap-2">
            <button type="button" disabled={busy} onClick={() => update(false)} className={`${btn} border-[#B42318] bg-[#B42318] font-semibold text-white`}>
              ยืนยันปิดรับจอง?
            </button>
            <button type="button" disabled={busy} onClick={() => setArm(false)} className={`${btn} border-(--nl-field) bg-white`}>
              ไม่
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => setArm(true)}
            className={`${btn} border-(--nl-field) bg-white hover:border-[#B42318] hover:text-[#B42318]`}
          >
            ปิดรับจอง
          </button>
        )
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => update(true)}
          className={`${btn} border-(--nl-teal) bg-(--nl-teal) font-semibold text-white hover:bg-(--nl-teal-dk)`}
        >
          เปิดรับจอง
        </button>
      )}
      {arm && upcoming > 0 && (
        <span className="text-xs text-(--nl-muted)">มี {upcoming} คำขอที่ยังไม่ถึงวัน — ไม่ถูกยกเลิกอัตโนมัติ</span>
      )}
      {error && (
        <span role="alert" className="text-xs text-[#B42318]">
          {error}
        </span>
      )}
    </div>
  );
}
