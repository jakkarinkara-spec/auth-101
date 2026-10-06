'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

// อนุมัติ / ไม่อนุมัติ — ใช้ทั้งผู้สมัครเจ้าของเรือ (PATCH /api/owner-profiles/[userId]) และคำขอเพิ่มเรือ (PATCH /api/owner-applications/[id])
// อนุมัติ: กดยืนยันอีกครั้ง (เจ้าของเรือจะเห็นข้อมูลลูกค้า)
// ไม่อนุมัติ: ต้องพิมพ์เหตุผล — ผู้สมัครเห็นเหตุผลนี้ในหน้าของตัวเอง
export default function ApplicationActions({ url }: { url: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<'idle' | 'approve' | 'reject'>('idle');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function decide(action: 'approve' | 'reject') {
    setBusy(true);
    setError('');
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action === 'reject' ? { action, reason } : { action }),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) {
      setMode('idle');
      setReason('');
      router.refresh();
      return;
    }
    const body = await res?.json().catch(() => null);
    const msg = String(body?.message ?? '');
    setError(
      msg.startsWith('Reason is required')
        ? 'ใส่เหตุผลที่ไม่อนุมัติ'
        : msg.startsWith('Boat data is invalid')
          ? 'ข้อมูลเรือในคำขอไม่ถูกต้อง — ไม่อนุมัติแล้วให้ผู้สมัครส่งใหม่'
          : msg.startsWith('Applicant is not an approved owner')
            ? 'ต้องอนุมัติตัวผู้สมัครก่อน (เมนู "ผู้สมัครเจ้าของเรือ")'
            : msg.includes('is already')
              ? 'รายการนี้ถูกตัดสินไปแล้ว'
              : 'ไม่สำเร็จ ลองใหม่อีกครั้ง',
    );
    router.refresh();
  }

  const btn = 'rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50';

  return (
    <div className="flex w-full flex-col items-end gap-2 sm:w-auto">
      {mode === 'idle' && (
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => setMode('approve')}
            className={`${btn} border-(--nl-teal) bg-(--nl-teal) font-semibold text-white hover:bg-(--nl-teal-dk)`}
          >
            อนุมัติ
          </button>
          <button
            type="button"
            onClick={() => setMode('reject')}
            className={`${btn} border-(--nl-field) bg-white hover:border-[#B42318] hover:text-[#B42318]`}
          >
            ไม่อนุมัติ
          </button>
        </div>
      )}

      {mode === 'approve' && (
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" disabled={busy} onClick={() => decide('approve')} className={`${btn} border-(--nl-teal) bg-(--nl-teal) font-semibold text-white`}>
            {busy ? 'กำลังบันทึก…' : 'ยืนยันอนุมัติ?'}
          </button>
          <button type="button" disabled={busy} onClick={() => setMode('idle')} className={`${btn} border-(--nl-field) bg-white`}>
            ไม่
          </button>
        </div>
      )}

      {mode === 'reject' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            decide('reject');
          }}
          className="flex w-full flex-col gap-2 sm:w-[320px]"
        >
          <label className="flex flex-col gap-1 text-sm font-medium text-(--nl-label)">
            เหตุผลที่ไม่อนุมัติ <span className="font-normal text-(--nl-muted)">(ผู้สมัครจะเห็นข้อความนี้)</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              autoFocus
              rows={3}
              maxLength={500}
              placeholder="เช่น ติดต่อเบอร์ที่ให้ไว้ไม่ได้ / ข้อมูลเรือไม่ครบ"
              className="rounded-lg border border-(--nl-field) bg-white px-3 py-2 text-[15px] font-normal text-(--nl-ink) outline-none focus:border-[#B42318]"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" disabled={busy} onClick={() => setMode('idle')} className={`${btn} border-(--nl-field) bg-white`}>
              ยกเลิก
            </button>
            <button type="submit" disabled={busy || !reason.trim()} className={`${btn} border-[#B42318] bg-[#B42318] font-semibold text-white`}>
              {busy ? 'กำลังบันทึก…' : 'ยืนยันไม่อนุมัติ'}
            </button>
          </div>
        </form>
      )}

      {error && (
        <span role="alert" className="text-xs text-[#B42318]">
          {error}
        </span>
      )}
    </div>
  );
}
