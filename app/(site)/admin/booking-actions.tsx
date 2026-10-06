'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Status = 'pending' | 'confirmed' | 'cancelled';

// ปุ่มยืนยัน / ยกเลิกคำขอจอง — ยกเลิกต้องกดสองครั้ง (ไม่ใช้ window.confirm)
export default function BookingActions({ id, status }: { id: string; status: Status }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [armCancel, setArmCancel] = useState(false);
  const [error, setError] = useState('');

  if (status === 'cancelled') return <span className="text-sm text-(--nl-muted)">—</span>;

  async function update(next: 'confirmed' | 'cancelled') {
    setBusy(true);
    setError('');
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    }).catch(() => null);
    setBusy(false);
    setArmCancel(false);
    if (res?.ok) {
      router.refresh();
    } else {
      const body = await res?.json().catch(() => null);
      setError(body?.message ?? 'ไม่สำเร็จ ลองใหม่อีกครั้ง');
      router.refresh(); // สถานะอาจถูกเปลี่ยนจากที่อื่นไปแล้ว
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-2">
        {status === 'pending' && !armCancel && (
          <button
            type="button"
            disabled={busy}
            onClick={() => update('confirmed')}
            className="rounded-lg bg-(--nl-teal) px-3 py-1.5 text-sm font-semibold text-white hover:bg-(--nl-teal-dk) disabled:opacity-50"
          >
            ยืนยัน
          </button>
        )}
        {armCancel ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => update('cancelled')}
              className="rounded-lg bg-[#B42318] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              ยืนยันยกเลิก?
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setArmCancel(false)}
              className="rounded-lg border border-(--nl-field) bg-white px-3 py-1.5 text-sm"
            >
              ไม่
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => setArmCancel(true)}
            className="rounded-lg border border-(--nl-field) bg-white px-3 py-1.5 text-sm hover:border-[#B42318] hover:text-[#B42318] disabled:opacity-50"
          >
            ยกเลิก
          </button>
        )}
      </div>
      {error && (
        <span role="alert" className="text-xs text-[#B42318]">
          {error}
        </span>
      )}
    </div>
  );
}
