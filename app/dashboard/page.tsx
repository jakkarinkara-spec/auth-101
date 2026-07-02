import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user;
  const initials = (user.name ?? user.email ?? '?')
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="relative min-h-dvh bg-[#030712] overflow-hidden pt-16">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              {user.name ?? 'there'}
            </span>
          </h1>
          <p className="mt-1 text-zinc-400">You&apos;re successfully signed in.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Profile card */}
          <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">Profile</h2>
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white shadow-lg shadow-indigo-500/25">
                {initials}
              </div>
              <div className="text-center">
                <p className="font-semibold text-white">{user.name ?? '—'}</p>
                <p className="mt-0.5 text-sm text-zinc-400">{user.email}</p>
              </div>
              <div className="w-full rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
                <p className="text-xs text-zinc-500">User ID</p>
                <p className="mt-0.5 truncate font-mono text-xs text-zinc-300">{user.id}</p>
              </div>
            </div>
          </div>

          {/* Session info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">Session</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
                  <span className="text-sm text-zinc-400">Strategy</span>
                  <span className="rounded-md bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300">JWT</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
                  <span className="text-sm text-zinc-400">Provider</span>
                  <span className="rounded-md bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-300">Credentials</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
                  <span className="text-sm text-zinc-400">Status</span>
                  <span className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Authenticated
                  </span>
                </div>
              </div>
            </div>

            {/* Stack card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">Stack</h2>
              <div className="flex flex-wrap gap-2">
                {['Next.js 16', 'NextAuth v5', 'Drizzle ORM', 'Neon PostgreSQL', 'TypeScript', 'Tailwind CSS v4', 'bcryptjs'].map((tech) => (
                  <span key={tech} className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400">
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
