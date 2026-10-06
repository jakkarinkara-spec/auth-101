'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

// ถอดเจ้าของเรือ — กดสองจังหวะ; สิทธิ์ของเจ้าของเดิมกับเรือลำนี้หมดทันที
export default function RemoveOwner({ boatId }: { boatId: string }) {
  const router = useRouter();
  const [arm, setArm] = useState(false);
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    const res = await fetch(`/api/boats/${boatId}/owner`, { method: 'DELETE' }).catch(() => null);
    setBusy(false);
    setArm(false);
    if (res?.ok) router.refresh();
  }

  return arm ? (
    <span className="flex gap-2 text-xs">
      <button type="button" disabled={busy} onClick={remove} className="font-semibold text-[#B42318] underline disabled:opacity-50">
        ยืนยันถอด?
      </button>
      <button type="button" disabled={busy} onClick={() => setArm(false)} className="text-(--nl-muted) underline">
        ไม่
      </button>
    </span>
  ) : (
    <button type="button" onClick={() => setArm(true)} className="text-xs text-(--nl-muted) underline hover:text-[#B42318]">
      ถอดเจ้าของ
    </button>
  );
}
