'use client';

import { createContext, useContext, useRef } from 'react';

// ให้ฟอร์มข้างใน popup สั่งปิดเองได้ (เช่นหลังบันทึกสำเร็จ) — ส่งผ่าน context
// เพราะ page เป็น Server Component ส่ง function เป็น children ให้ Client Component ไม่ได้
const ModalCloseContext = createContext<(() => void) | null>(null);
export const useModalClose = () => useContext(ModalCloseContext);

// ปุ่มเปิด + popup ใช้ <dialog> ของ browser (ได้ Esc ปิด, focus trap, backdrop มาฟรี)
export default function Modal({
  triggerLabel,
  title,
  children,
}: {
  triggerLabel: string;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = () => ref.current?.close();

  return (
    <>
      <button type="button" onClick={() => ref.current?.showModal()} className="ui-btn">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="square" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        {triggerLabel}
      </button>

      <dialog
        ref={ref}
        aria-label={title}
        // คลิกที่ backdrop (นอกกล่อง) เพื่อปิด
        onClick={(e) => e.target === e.currentTarget && close()}
        className="ui-panel m-auto w-[calc(100%-2rem)] max-w-md p-0 text-ink backdrop:bg-black/50"
      >
        <div className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">{title}</h2>
            <button type="button" onClick={close} aria-label="Close" className="ui-btn ui-btn-secondary h-8 w-8 px-0">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="square" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ModalCloseContext.Provider value={close}>{children}</ModalCloseContext.Provider>
        </div>
      </dialog>
    </>
  );
}
