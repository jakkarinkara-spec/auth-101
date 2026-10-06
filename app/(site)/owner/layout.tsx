import { and, count, eq, gte, inArray } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/app/db/index';
import { bookings, ownerApplications } from '@/app/db/schema';
import { ownedBoatIds } from '@/app/lib/admin';
import { bangkokToday } from '@/app/lib/boats';
import { SiteHeader, SiteNav } from '../_components/ui';
import SectionSidebar, { SidebarShell } from '../_components/section-sidebar';
import { getOwnerProfile } from './guard';

// โครงทุกหน้าใต้ /owner — หัวเว็บ + (ผ่านการอนุมัติตัวบุคคลแล้ว) sidebar หัวข้อ
// ยังไม่ล็อกอิน → ให้หน้า redirect ไป login เองพร้อม callbackUrl ของหน้านั้น
// ยังไม่ผ่านการอนุมัติ → ไม่มี sidebar (หน้า /owner แสดงสถานะใบสมัคร, /owner/profile ให้กรอกข้อมูล)
export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) return children;

  const profile = await getOwnerProfile(user.id);
  const header = (
    <SiteHeader>
      <SiteNav active="owner" />
    </SiteHeader>
  );

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
      <main className="px-6 pt-10 pb-24">
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
      </main>
    </>
  );
}
