import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getAccount } from '@/app/lib/admin';
import { SiteHeader, SiteNav, heading } from '../_components/ui';
import { AccountForm } from './account-forms';

// /account — แก้ไขโปรไฟล์บัญชี (ชื่อ) ของผู้ใช้ทุก role — ยังไม่เปิดให้เปลี่ยนรหัสผ่าน
export default async function AccountPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect('/login?callbackUrl=/account');

  const account = await getAccount(userId);
  if (!account) redirect('/login');

  return (
    <>
      <SiteHeader>
        <SiteNav active="account" />
      </SiteHeader>
      <main className="px-6 pt-12 pb-24">
        <div className="mx-auto flex max-w-[760px] flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className={`${heading} text-[40px] leading-tight`}>โปรไฟล์ของฉัน</h1>
            <p className="text-[17px] text-(--nl-muted)">แก้ไขชื่อที่แสดงในระบบ และเบอร์ติดต่อ</p>
          </div>
          <AccountForm name={account.name ?? ''} email={account.email} phones={account.phones} />
        </div>
      </main>
    </>
  );
}
