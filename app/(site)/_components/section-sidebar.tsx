'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ไอคอน (path ของ SVG 24×24 แบบเส้น) ที่ใช้ในเมนูหัวข้อ
export const SIDEBAR_ICON = {
  overview: 'M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  bookings: 'M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1zM8 12h3M8 16h6',
  owners: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 4-6 8-6s8 2 8 6',
  requests: 'M12 5v14M5 12h14M4 4h16v16H4z',
  boats: 'M3 17c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0M5 14l1.5-5h11L19 14M12 9V3l5 3h-5',
  profile: 'M4 5h16v14H4zM8 10a2 2 0 104 0 2 2 0 00-4 0M7 16c.5-1.5 1.8-2 3-2s2.5.5 3 2M15 9h3M15 13h3',
} as const;

export type SidebarItem = {
  href: string;
  label: string;
  icon: keyof typeof SIDEBAR_ICON;
  count?: number; // งานที่รอดำเนินการ — แสดงเป็นป้ายตัวเลข (0 = ไม่แสดง)
  exact?: boolean; // ไฮไลต์เฉพาะ path นี้พอดี (ไม่รวมหน้าย่อย)
};

// เมนูหัวข้อ — ใช้ทั้งหน้า /admin และ /owner
// จอใหญ่เป็น sidebar ด้านซ้าย, จอเล็กเป็นแถบเลื่อนแนวนอนด้านบน
// ตัวเลขมาจาก layout ซึ่ง refresh ตามเมื่อกดยืนยัน / อนุมัติ (router.refresh)
export default function SectionSidebar({ label, items }: { label: string; items: SidebarItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label={label}>
      <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
        {items.map((it) => {
          const active = it.exact ? pathname === it.href : pathname === it.href || pathname.startsWith(`${it.href}/`);
          return (
            <li key={it.href} className="flex-none">
              <Link
                href={it.href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] whitespace-nowrap ${
                  active
                    ? 'bg-(--nl-navy) font-semibold text-white'
                    : 'border border-(--nl-line) bg-white text-(--nl-ink) hover:bg-(--nl-bg) lg:border-0 lg:bg-transparent'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-none">
                  <path d={SIDEBAR_ICON[it.icon]} />
                </svg>
                <span className="flex-1">{it.label}</span>
                {it.count ? (
                  <span
                    className={`min-w-6 rounded-full px-2 py-0.5 text-center text-[12px] font-semibold ${
                      active ? 'bg-(--nl-accent) text-(--nl-ink)' : 'bg-(--nl-accent-soft) text-[#9A4A00]'
                    }`}
                  >
                    {it.count}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// โครงหน้า: sidebar ชิดขอบซ้ายสุดของจอ (แถบขาวเต็มความสูง ค้างอยู่ตอนเลื่อน)
// + เนื้อหาจัดกึ่งกลางพื้นที่ที่เหลือ (กว้างสุด 1200px — จอกว้างไม่ชิดซ้ายติดเมนู)
// จอเล็ก: เมนูเป็นแถบเลื่อนแนวนอนอยู่ด้านบนเนื้อหา
export function SidebarShell({ sidebar, caption, children }: { sidebar: React.ReactNode; caption?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <aside className="border-b border-(--nl-line) bg-white px-6 py-3 lg:sticky lg:top-0 lg:h-dvh lg:self-start lg:w-[248px] lg:flex-none lg:overflow-y-auto lg:border-r lg:border-b-0 lg:px-3 lg:py-6">
        {caption && <p className="mb-3 hidden px-3 text-[13px] text-(--nl-muted) lg:block">{caption}</p>}
        {sidebar}
      </aside>
      <main className="min-w-0 flex-1 px-6 pt-10 pb-24 lg:px-10">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8">{children}</div>
      </main>
    </div>
  );
}
