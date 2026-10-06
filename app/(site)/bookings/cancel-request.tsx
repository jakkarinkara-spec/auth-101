'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

// ลูกค้ายกเลิกคำขอที่ยังรอยืนยันเอง — กดสองจังหวะ (ไม่ใช้ window.confirm)
export default function CancelRequest({ id }: { id: string }) {
  const router = useRouter();
  const [arm, setArm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function cancel() {
    setBusy(true);
    setError('');
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    }).catch(() => null);
    setBusy(false);
    setArm(false);
    if (res?.ok) {
      router.refresh();
    } else if (res?.status === 409) {
      // กัปตันยืนยันไปก่อนพอดี — refresh ให้เห็นสถานะล่าสุด
      setError('คำขอนี้เปลี่ยนสถานะแล้ว ยกเลิกเองไม่ได้ — ติดต่อทาง LINE');
      router.refresh();
    } else {
      setError('ยกเลิกไม่สำเร็จ ลองใหม่อีกครั้ง');
    }
  }

  const btn = 'rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {arm ? (
        <>
          <span className="text-sm text-(--nl-label)">ยกเลิกคำขอนี้?</span>
          <button type="button" disabled={busy} onClick={cancel} className={`${btn} border-[#B42318] bg-[#B42318] font-semibold text-white`}>
            {busy ? 'กำลังยกเลิก…' : 'ยืนยันยกเลิก'}
          </button>
          <button type="button" disabled={busy} onClick={() => setArm(false)} className={`${btn} border-(--nl-field) bg-white`}>
            ไม่ยกเลิก
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setArm(true)}
          className={`${btn} border-(--nl-field) bg-white hover:border-[#B42318] hover:text-[#B42318]`}
        >
          ยกเลิกคำขอ
        </button>
      )}
      {error && (
        <span role="alert" className="w-full text-sm text-[#B42318]">
          {error}
        </span>
      )}
    </div>
  );
}
