import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/app/db/index';
import { usersTable } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  // ดึงข้อมูลล่าสุดจาก DB (เลือกเฉพาะคอลัมน์ที่แสดง ไม่ดึง password)
  const [user] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(eq(usersTable.id, session.user.id));

  if (!user) {
    redirect('/login');
  }

  const joinedAt = user.createdAt.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const initials = (user.name ?? user.email ?? '?')
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="relative min-h-dvh pt-16">

      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            Welcome back,{' '}
            <span className="text-highlight">
              {user.name ?? 'there'}
            </span>
          </h1>
          <p className="mt-1 text-ink-muted">You&apos;re successfully signed in.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Profile card */}
          <div className="lg:col-span-1 ui-panel p-6">
            <h2 className="ui-panel-title mb-4">Profile</h2>
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-semibold text-accent-ink">
                {initials}
              </div>
              <div className="text-center">
                <p className="font-semibold text-ink">{user.name ?? '—'}</p>
                <p className="mt-0.5 text-sm text-ink-muted">{user.email}</p>
              </div>
              <div className="w-full ui-row px-4 py-3">
                <p className="text-xs text-ink-muted">User ID</p>
                <p className="mt-0.5 truncate font-mono text-xs text-ink">{user.id}</p>
              </div>
              <div className="grid w-full grid-cols-2 gap-2">
                <div className="ui-row px-4 py-3">
                  <p className="text-xs text-ink-muted">Role</p>
                  <p className="mt-0.5 text-xs font-medium capitalize text-ink">{user.role}</p>
                </div>
                <div className="ui-row px-4 py-3">
                  <p className="text-xs text-ink-muted">Joined</p>
                  <p className="mt-0.5 text-xs font-medium text-ink">{joinedAt}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Session info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="ui-panel p-6">
              <h2 className="ui-panel-title mb-4">Session</h2>
              <div className="space-y-3">
                <div className="ui-row flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-ink-muted">Strategy</span>
                  <span className="ui-badge ui-badge-secondary">JWT</span>
                </div>
                <div className="ui-row flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-ink-muted">Provider</span>
                  <span className="ui-badge ui-badge-secondary">Credentials</span>
                </div>
                <div className="ui-row flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-ink-muted">Status</span>
                  <span className="flex items-center gap-1.5 ui-badge">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    Authenticated
                  </span>
                  
                </div>
              </div>
            </div>

            {/* Stack card */}
            <div className="ui-panel p-6">
              <h2 className="ui-panel-title mb-4">Stack</h2>
              <div className="flex flex-wrap gap-2">
                {['Next.js 16', 'NextAuth v5', 'Drizzle ORM', 'Neon PostgreSQL', 'TypeScript', 'Tailwind CSS v4', 'bcryptjs'].map((tech) => (
                  <span key={tech} className="ui-row px-3 py-1.5 text-xs text-ink-muted">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
