'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

// ชื่อเมนูหลัก — ระบบรวมที่จะมีหลายโมดูล (Farm Manage เป็นหนึ่งในนั้น)
const APP_NAME = 'AgriHub';
const APP_TAGLINE = 'Management suite';

const ICONS = {
  overview:
    'M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
  farm: 'M12 21v-8.25M12 12.75c0-3.728-3.022-6.75-6.75-6.75H4.5v.75c0 3.728 3.022 6.75 6.75 6.75H12zm0 0c0-3.728 3.022-6.75 6.75-6.75h.75v.75c0 3.728-3.022 6.75-6.75 6.75H12z',
  hub: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z',
};

type NavLink = { href: string; label: string; icon?: string };
type NavGroup = { label: string; icon: string; children: NavLink[] };

// เพิ่มโมดูลใหม่ได้โดยเพิ่ม NavLink หรือ NavGroup ในนี้
const NAV: (NavLink | NavGroup)[] = [
  { href: '/dashboard', label: 'Overview', icon: ICONS.overview },
  {
    label: 'Farm Manage',
    icon: ICONS.farm,
    children: [
      { href: '/dashboard/crops', label: 'Crops' },
      { href: '/dashboard/plots', label: 'Plots' },
    ],
  },
];

const isGroup = (entry: NavLink | NavGroup): entry is NavGroup => 'children' in entry;

function NavIcon({ d }: { d: string }) {
  return (
    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const baseItem = 'ui-nav';
const idleItem = '';
const activeItem = 'ui-nav-active';

function SidebarGroup({ group, isActive }: { group: NavGroup; isActive: (href: string) => boolean }) {
  const [open, setOpen] = useState(true);
  const hasActiveChild = group.children.some((c) => isActive(c.href));

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`${baseItem} w-full ${hasActiveChild ? 'text-highlight' : idleItem}`}
      >
        <NavIcon d={group.icon} />
        <span className="flex-1 text-left">{group.label}</span>
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
      {open && (
        <div className="ml-5 mt-1 flex flex-col gap-1 border-l border-line pl-3">
          {group.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={`${baseItem} py-1 ${isActive(child.href) ? activeItem : idleItem}`}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// เมนูหลัก AgriHub — จอใหญ่เป็น sidebar ด้านซ้าย, จอเล็กเป็นแถบเมนูแนวนอนใต้ Navbar
export default function FarmSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="ui-bar fixed bottom-0 left-0 top-16 z-40 hidden w-64 flex-col border-r px-4 py-6 lg:flex">
        <div className="mb-6 flex items-center gap-2.5 px-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-ink">
            <NavIcon d={ICONS.hub} />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-ink">{APP_NAME}</p>
            <p className="text-xs text-ink-muted">{APP_TAGLINE}</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((entry) =>
            isGroup(entry) ? (
              <SidebarGroup key={entry.label} group={entry} isActive={isActive} />
            ) : (
              <Link
                key={entry.href}
                href={entry.href}
                className={`${baseItem} ${isActive(entry.href) ? activeItem : idleItem}`}
              >
                {entry.icon && <NavIcon d={entry.icon} />}
                {entry.label}
              </Link>
            ),
          )}
        </nav>
      </aside>

      {/* Mobile tab bar — แสดงเมนูย่อยทั้งหมดเรียงแนวนอน */}
      <nav className="ui-bar fixed left-0 right-0 top-16 z-40 flex h-12 items-center gap-1 overflow-x-auto border-b px-4 lg:hidden">
        {NAV.flatMap((entry) => (isGroup(entry) ? entry.children : [entry])).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${baseItem} whitespace-nowrap py-1 ${isActive(item.href) ? activeItem : idleItem}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
