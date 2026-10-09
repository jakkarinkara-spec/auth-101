import { auth } from '@/auth';
import Link from 'next/link';
import { signOutAction } from './actions';
import { INCLUDED } from '@/app/lib/boats';
import { getAccount } from '@/app/lib/admin';
import { heading } from './styles';

// ส่วนประกอบที่ใช้ซ้ำในหน้าเว็บเช่าเรือ

export { heading };

// กล่องลายทางแทนรูปจริง (ดีไซน์ยังไม่มีรูป)
export function Placeholder({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center text-sm font-medium text-[#2F4A55] ${className}`}
      style={{ background: 'repeating-linear-gradient(135deg,#D3E0E2 0 12px,#C8D8DB 12px 24px)' }}
    >
      [{label}]
    </div>
  );
}

export function BoatLogo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--nl-accent)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 17c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0" />
      <path d="M5 14l1.5-5h11L19 14" />
      <path d="M12 9V3l5 3h-5" />
    </svg>
  );
}

export function PortBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-(--nl-tint) px-2.5 py-1 text-[13px] font-semibold text-(--nl-teal-dk)">{children}</span>
  );
}

const NAV = [
  { href: '/boats', label: 'เรือของเรา', key: 'boats' },
  { href: '/#trips', label: 'แพ็กเกจทริป', key: 'trips' },
  { href: '/#spots', label: 'ท่าเรือ', key: 'spots' },
  { href: '/#how', label: 'วิธีจอง', key: 'how' },
];

// ลิงก์ในแถบบัญชี (แถวบนสุด) — หน้าปัจจุบันตัวหนา + จุดสีส้มนำหน้า
function AccountLink({ href, current, children }: { href: string; current: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={current ? 'page' : undefined}
      className={`flex items-center gap-1.5 ${current ? 'font-semibold text-white' : 'text-(--nl-nav) hover:text-white'}`}
    >
      {current && <span className="h-1.5 w-1.5 rounded-full bg-(--nl-accent)" aria-hidden="true" />}
      {children}
    </Link>
  );
}

// หัวเว็บบนพื้นน้ำเงิน 2 แถว — หน้าแรกวางไว้ใน hero, หน้าอื่นห่อด้วย <SiteHeader>
//   แถวบน: แถบบัญชี (ชื่อผู้ใช้ / การจองของฉัน / แอดมิน / ออกจากระบบ — หรือ เข้าสู่ระบบ / สมัครสมาชิก)
//   แถวล่าง: โลโก้ + เมนูหลักของเว็บ
export async function SiteNav({ active, back }: { active?: string; back?: { href: string; label: string } }) {
  const session = await auth();
  const user = session?.user;
  // ชื่อ / role อ่านจาก DB (JWT เก็บชื่อตอนล็อกอิน แก้ชื่อที่ /account แล้วจะได้แสดงทันที)
  const account = user?.id ? await getAccount(user.id) : null;
  const role = account?.role ?? null;

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-1 border-b border-white/10 py-2.5 text-sm">
        {user ? (
          <>
            <Link
              href="/account"
              aria-current={active === 'account' ? 'page' : undefined}
              title="แก้ไขโปรไฟล์"
              className={`flex items-center gap-1.5 ${active === 'account' ? 'font-semibold text-white' : 'text-(--nl-on-navy) hover:text-white'}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
              </svg>
              {account?.name ?? user.name ?? user.email}
            </Link>
            <AccountLink href="/bookings" current={active === 'bookings'}>
              การจองของฉัน
            </AccountLink>
            {/* role ใช้แค่เลือกเมนูที่แสดง — สิทธิ์จริงเช็คที่หน้า / API จาก boats.owner_id */}
            {role === 'owner' && (
              <AccountLink href="/owner" current={active === 'owner'}>
                แดชบอร์ดเจ้าของเรือ
              </AccountLink>
            )}
            {/* ผู้ใช้ทั่วไป: ทางเข้าสมัครเป็นเจ้าของเรือ — /owner แสดงสถานะใบสมัคร (admin อนุมัติแล้วเมนูนี้กลายเป็น "เรือของฉัน") */}
            {role === 'user' && (
              <AccountLink href="/owner" current={active === 'owner'}>
                สมัครเป็นเจ้าของเรือ
              </AccountLink>
            )}
            {role === 'admin' && (
              <AccountLink href="/admin" current={active === 'admin'}>
                แอดมิน
              </AccountLink>
            )}
            <form action={signOutAction}>
              <button type="submit" className="text-(--nl-nav) underline-offset-4 hover:text-white hover:underline">
                ออกจากระบบ
              </button>
            </form>
          </>
        ) : (
          <>
            <AccountLink href="/login" current={active === 'login'}>
              เข้าสู่ระบบ
            </AccountLink>
            <Link
              href="/register"
              aria-current={active === 'register' ? 'page' : undefined}
              className="rounded-full border border-white/30 px-3 py-1 text-white hover:border-white"
            >
              สมัครสมาชิก
            </Link>
          </>
        )}
      </div>

      <nav aria-label="เมนูหลัก" className="flex flex-wrap items-center justify-between gap-4 py-5">
        <Link href="/" className="flex items-center gap-2.5 text-white">
          <BoatLogo />
          <span className={`${heading} text-2xl tracking-wide`}>น้ำลึก</span>
        </Link>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {back ? (
            <Link href={back.href} className="py-2.5 text-(--nl-nav) hover:text-white">
              ← {back.label}
            </Link>
          ) : (
            NAV.map((n) => (
              <Link
                key={n.key}
                href={n.href}
                className={
                  n.key === active
                    ? 'border-b-2 border-(--nl-accent) py-2.5 font-semibold text-white'
                    : 'py-2.5 text-(--nl-nav) hover:text-white'
                }
              >
                {n.label}
              </Link>
            ))
          )}

          {/* ปุ่มจองแสดงเฉพาะหน้าแรก (ตามดีไซน์) */}
          {!back && !active && (
            <Link href="/boats" className="rounded-full bg-(--nl-accent) px-5.5 py-3 font-semibold text-(--nl-ink)">
              จองเรือ
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}

// หัวหน้าแบบสั้น (หน้าเลือกเรือ / รายละเอียดเรือ / login / register)
export function SiteHeader({ children }: { children: React.ReactNode }) {
  return (
    <header className="bg-(--nl-navy) px-6">
      <div className="mx-auto max-w-[1200px]">{children}</div>
    </header>
  );
}

// โครงหน้า login / register — การ์ดฟอร์มด้านซ้าย + แผงภาพและสิ่งที่รวมในทริปด้านขวา (จอใหญ่)
export function AuthShell({
  page,
  title,
  subtitle,
  children,
}: {
  page: 'login' | 'register';
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader>
        <SiteNav active={page} back={{ href: '/', label: 'กลับหน้าแรก' }} />
      </SiteHeader>

      <main className="flex flex-1 items-start justify-center px-6 pt-12 pb-24">
        <div className="grid w-full max-w-[1040px] items-stretch gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="flex flex-col gap-6 rounded-[20px] border border-(--nl-line) bg-white p-8 shadow-[0_12px_32px_rgba(14,36,51,0.08)] sm:p-10">
            <div className="flex flex-col gap-2">
              <h1 className={`${heading} text-[34px] leading-tight`}>{title}</h1>
              <p className="text-[17px] text-(--nl-muted)">{subtitle}</p>
            </div>
            {children}
          </section>

          <aside className="hidden flex-col overflow-hidden rounded-[20px] bg-(--nl-navy) text-white lg:flex">
            <Placeholder label="ภาพเรือกลางทะเล" className="h-[260px]" />
            <div className="flex flex-1 flex-col gap-5 p-8">
              <p className="font-semibold tracking-wider text-(--nl-accent)">เช่าเรือตกปลา พร้อมกัปตันมืออาชีพ</p>
              <h2 className={`${heading} text-[26px] leading-snug`}>มีบัญชีแล้วจองเรือได้ในไม่กี่ขั้นตอน</h2>
              <ul className="grid grid-cols-2 gap-3 text-[15px] text-(--nl-on-navy)">
                {INCLUDED.map((it) => (
                  <li key={it} className="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--nl-accent)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-none">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
