import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { isAdmin } from '@/app/lib/admin';
import { SiteHeader, SiteNav, heading } from '../_components/ui';

// ใช้ต้นทุกหน้าใต้ /admin — ไม่ล็อกอิน → ไปหน้า login แล้วกลับมา
// เป็น admin → คืน user ที่ล็อกอิน, ไม่ใช่ admin → คืน null ให้หน้าแสดง <NotAdmin />
export async function adminSession(callbackUrl: string) {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return (await isAdmin(user.id)) ? user : null;
}

export function AdminHeader() {
  return (
    <SiteHeader>
      <SiteNav active="admin" />
    </SiteHeader>
  );
}

export function NotAdmin() {
  return (
    <>
      <AdminHeader />
      <main className="flex flex-1 items-start justify-center px-6 pt-16 pb-24">
        <div className="flex max-w-[480px] flex-col gap-3 rounded-[20px] border border-(--nl-line) bg-white p-10 text-center">
          <h1 className={`${heading} text-[28px]`}>สำหรับผู้ดูแลระบบเท่านั้น</h1>
          <p className="text-(--nl-muted)">บัญชีนี้ไม่มีสิทธิ์เข้าหน้านี้ ถ้าต้องใช้งาน ติดต่อผู้ดูแลระบบให้เปลี่ยนสิทธิ์เป็น admin</p>
          <Link href="/" className="mt-2 font-semibold text-(--nl-teal) hover:text-(--nl-teal-dk)">
            ← กลับหน้าแรก
          </Link>
        </div>
      </main>
    </>
  );
}
