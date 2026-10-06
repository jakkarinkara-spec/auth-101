import { and, count, eq, gte } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/app/db/index';
import { bookings, ownerApplications, ownerProfiles } from '@/app/db/schema';
import { isAdmin } from '@/app/lib/admin';
import { bangkokToday } from '@/app/lib/boats';
import SectionSidebar, { SidebarShell } from '../_components/section-sidebar';
import { AdminHeader, NotAdmin } from './guard';

// โครงทุกหน้าใต้ /admin — หัวเว็บ + sidebar หัวข้อ + เนื้อหา
// ยังไม่ล็อกอิน → ให้หน้า (page) redirect ไป login เองพร้อม callbackUrl ของหน้านั้น (layout ไม่รู้ path)
// ล็อกอินแต่ไม่ใช่ admin → ข้อความแจ้ง (แต่ละหน้าเช็คสิทธิ์ซ้ำเอง และ API เช็คอีกชั้น)
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) return children;
  if (!(await isAdmin(session.user.id))) return <NotAdmin />;
  const user = session.user;

  const [[pendingBookings], [owners], [boatRequests]] = await Promise.all([
    db
      .select({ n: count() })
      .from(bookings)
      .where(and(eq(bookings.status, 'pending'), gte(bookings.tripDate, bangkokToday()))),
    db.select({ n: count() }).from(ownerProfiles).where(eq(ownerProfiles.status, 'pending')),
    db.select({ n: count() }).from(ownerApplications).where(eq(ownerApplications.status, 'pending')),
  ]);

  return (
    <>
      <AdminHeader />
      <main className="px-6 pt-10 pb-24">
        <SidebarShell
          caption={`ผู้ดูแลระบบ · ${user.name ?? user.email}`}
          sidebar={
            <SectionSidebar
              label="เมนูผู้ดูแลระบบ"
              items={[
                { href: '/admin', label: 'ภาพรวม', icon: 'overview', exact: true },
                { href: '/admin/bookings', label: 'คำขอจอง', icon: 'bookings', count: pendingBookings.n },
                { href: '/admin/owners', label: 'ผู้สมัครเจ้าของเรือ', icon: 'owners', count: owners.n },
                { href: '/admin/boat-requests', label: 'คำขอเพิ่มเรือ', icon: 'requests', count: boatRequests.n },
                { href: '/admin/boats', label: 'เรือ', icon: 'boats' },
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
