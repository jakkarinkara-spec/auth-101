'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

// ปุ่มยกเลิกคำขอแก้ไขข้อมูลเจ้าของเรือที่รอ admin ตรวจ — ยืนยันในหน้า (ไม่ใช้ window.confirm)
// ยกเลิกแล้วกลับไปใช้ข้อมูลเดิม ฟอร์มแก้ไขกลับมาให้ส่งคำขอใหม่ได้
export default function CancelEditRequest() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function cancel() {
    setBusy(true);
    setError('');
    const res = await fetch('/api/owner-profile', { method: 'DELETE' }).catch(() => null);
    setBusy(false);
    setConfirming(false);
    if (res?.ok || res?.status === 404) {
      // 404 = admin ตัดสินไปก่อนแล้ว — refresh ให้เห็นสถานะล่าสุด
      router.refresh();
      return;
    }
    setError('ยกเลิกคำขอไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
  }

  return (
    <div className="mt-3 flex flex-col items-end gap-2">
      {confirming ? (
        <div className="flex flex-wrap items-center justify-end gap-3">
          <span className="text-[15px]">ยกเลิกคำขอแก้ไขนี้?</span>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={busy}
            className="h-[44px] rounded-xl border border-(--nl-field) bg-white px-5 text-[15px] font-semibold text-(--nl-ink) hover:bg-(--nl-bg)"
          >
            ไม่ใช่
          </button>
          <button
            type="button"
            onClick={cancel}
            disabled={busy}
            className="h-[44px] rounded-xl bg-[#B42318] px-5 text-[15px] font-semibold text-white hover:bg-[#912018] disabled:opacity-60"
          >
            {busy ? 'กำลังยกเลิก…' : 'ยืนยันยกเลิกคำขอ'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="h-[44px] rounded-xl border border-[#B42318] bg-white px-5 text-[15px] font-semibold text-[#B42318] hover:bg-[#FDECEC]"
        >
          ยกเลิกคำขอแก้ไข
        </button>
      )}
      {error && (
        <p role="alert" className="text-[14px] text-[#B42318]">
          {error}
        </p>
      )}
    </div>
  );
}
