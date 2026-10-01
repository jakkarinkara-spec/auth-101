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
    <div className="relative min-h-dvh overflow-hidden bg-slate-50 pt-16 dark:bg-[#030712]">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
              {user.name ?? 'there'}
            </span>
          </h1>
          <p className="mt-1 text-slate-600 dark:text-zinc-400">You&apos;re successfully signed in.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Profile card */}
          <div className="lg:col-span-1 rounded-2xl border border-black/10 bg-black/[0.02] p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-zinc-500">Profile</h2>
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white shadow-lg shadow-indigo-500/25">
                {initials}
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-900 dark:text-white">{user.name ?? '—'}</p>
                <p className="mt-0.5 text-sm text-slate-600 dark:text-zinc-400">{user.email}</p>
              </div>
              <div className="w-full rounded-xl border border-black/5 bg-black/[0.02] px-4 py-3 dark:border-white/5 dark:bg-white/[0.03]">
                <p className="text-xs text-slate-500 dark:text-zinc-500">User ID</p>
                <p className="mt-0.5 truncate font-mono text-xs text-slate-700 dark:text-zinc-300">{user.id}</p>
              </div>
              <div className="grid w-full grid-cols-2 gap-2">
                <div className="rounded-xl border border-black/5 bg-black/[0.02] px-4 py-3 dark:border-white/5 dark:bg-white/[0.03]">
                  <p className="text-xs text-slate-500 dark:text-zinc-500">Role</p>
                  <p className="mt-0.5 text-xs font-medium capitalize text-slate-700 dark:text-zinc-300">{user.role}</p>
                </div>
                <div className="rounded-xl border border-black/5 bg-black/[0.02] px-4 py-3 dark:border-white/5 dark:bg-white/[0.03]">
                  <p className="text-xs text-slate-500 dark:text-zinc-500">Joined</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-700 dark:text-zinc-300">{joinedAt}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Session info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-zinc-500">Session</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-black/[0.02] px-4 py-3 dark:bg-white/[0.03]">
                  <span className="text-sm text-slate-600 dark:text-zinc-400">Strategy</span>
                  <span className="rounded-md bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300">JWT</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-black/[0.02] px-4 py-3 dark:bg-white/[0.03]">
                  <span className="text-sm text-slate-600 dark:text-zinc-400">Provider</span>
                  <span className="rounded-md bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-700 dark:text-violet-300">Credentials</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-black/[0.02] px-4 py-3 dark:bg-white/[0.03]">
                  <span className="text-sm text-slate-600 dark:text-zinc-400">Status</span>
                  <span className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Authenticated
                  </span>
                  
                </div>
              </div>
            </div>

            {/* Stack card */}
            <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-zinc-500">Stack</h2>
              <div className="flex flex-wrap gap-2">
                {['Next.js 16', 'NextAuth v5', 'Drizzle ORM', 'Neon PostgreSQL', 'TypeScript', 'Tailwind CSS v4', 'bcryptjs'].map((tech) => (
                  <span key={tech} className="rounded-lg border border-black/5 bg-black/[0.02] px-3 py-1.5 text-xs text-slate-600 dark:border-white/5 dark:bg-white/[0.03] dark:text-zinc-400">
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
