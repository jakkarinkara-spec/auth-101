import { and, count, eq, gte, inArray } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/app/db/index';
import { bookings, ownerApplications } from '@/app/db/schema';
import Link from 'next/link';
import { getAccount, ownedBoatIds } from '@/app/lib/admin';
import { bangkokToday } from '@/app/lib/boats';
import { SiteHeader, SiteNav, heading } from '../_components/ui';
import SectionSidebar, { SidebarShell } from '../_components/section-sidebar';
import { getOwnerProfile } from './guard';

// โครงทุกหน้าใต้ /owner — หัวเว็บ + (ผ่านการอนุมัติตัวบุคคลแล้ว) sidebar หัวข้อ
// ยังไม่ล็อกอิน → ให้หน้า redirect ไป login เองพร้อม callbackUrl ของหน้านั้น
// ยังไม่ผ่านการอนุมัติ → ไม่มี sidebar (หน้า /owner แสดงสถานะใบสมัคร, /owner/profile ให้กรอกข้อมูล)
export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) return children;

  const [profile, account] = await Promise.all([getOwnerProfile(user.id), getAccount(user.id)]);
  const header = (
    <SiteHeader>
      <SiteNav active="owner" />
    </SiteHeader>
  );

  // admin สมัครเป็นเจ้าของเรือไม่ได้ — แสดงข้อความแทนทุกหน้าใต้ /owner (API ปฏิเสธอีกชั้น)
  if (account?.role === 'admin') {
    return (
      <>
        {header}
        <main className="flex flex-1 items-start justify-center px-6 pt-16 pb-24">
          <div className="flex w-full max-w-[640px] flex-col gap-3 rounded-[20px] border border-(--nl-line) bg-white p-10 text-center">
            <h1 className={`${heading} text-[28px]`}>ผู้ดูแลระบบสมัครเป็นเจ้าของเรือไม่ได้</h1>
            <p className="text-(--nl-muted)">บัญชีผู้ดูแลระบบเพิ่มและจัดการเรือได้โดยตรงที่หน้าจัดการเรือ</p>
            <Link href="/admin/boats" className="mt-2 font-semibold text-(--nl-teal) hover:text-(--nl-teal-dk)">
              ไปหน้าจัดการเรือ →
            </Link>
          </div>
        </main>
      </>
    );
  }

  if (profile?.status !== 'approved') {
    return (
      <>
        {header}
        <main className="px-6 pt-12 pb-24">
          <div className="mx-auto flex max-w-[760px] flex-col gap-8">{children}</div>
        </main>
      </>
    );
  }

  const [[pendingBookings], [requests]] = await Promise.all([
    db
      .select({ n: count() })
      .from(bookings)
      .where(and(inArray(bookings.boatId, ownedBoatIds(user.id)), eq(bookings.status, 'pending'), gte(bookings.tripDate, bangkokToday()))),
    db
      .select({ n: count() })
      .from(ownerApplications)
      .where(and(eq(ownerApplications.userId, user.id), eq(ownerApplications.status, 'pending'))),
  ]);

  return (
    <>
      {header}
      <SidebarShell
          caption={`เจ้าของเรือ · ${profile.fullName}`}
          sidebar={
            <SectionSidebar
              label="เมนูเจ้าของเรือ"
              items={[
                { href: '/owner', label: 'ภาพรวม', icon: 'overview', exact: true },
                { href: '/owner/bookings', label: 'คำขอจอง', icon: 'bookings', count: pendingBookings.n },
                { href: '/owner/boats', label: 'เรือของฉัน', icon: 'boats' },
                // นับคำขอของตัวเองที่ยังรอ admin — ฟอร์ม /owner/boat-requests/new เป็นหน้าย่อยของหัวข้อนี้
                { href: '/owner/boat-requests', label: 'คำขอเพิ่มเรือ', icon: 'requests', count: requests.n },
                { href: '/owner/profile', label: 'ข้อมูลส่วนตัว', icon: 'profile' },
              ]}
            />
          }
        >
          {children}
      </SidebarShell>
    </>
  );
}
