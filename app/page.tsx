import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-dvh bg-[#030712] overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute -bottom-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-20">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
          Next.js 16 · NextAuth v5 · Drizzle ORM · Neon
        </div>

        {/* Hero heading */}
        <h1 className="max-w-3xl text-center text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
          Authentication
          <span className="block bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            made simple.
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-center text-lg leading-relaxed text-zinc-400">
          A modern full-stack auth demo with JWT sessions, password hashing, and a real PostgreSQL database. Learn how it all fits together.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-8 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 active:scale-[0.98]"
          >
            Create account
          </Link>
        </div>

        {/* Feature cards */}
        <div className="mt-24 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white">NextAuth v5</h3>
            <p className="mt-1 text-sm text-zinc-500">JWT sessions with Credentials provider and bcrypt password hashing.</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125S3.75 11.278 3.75 9m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125S3.75 13.903 3.75 11.625" />
              </svg>
            </div>
            <h3 className="font-semibold text-white">Drizzle ORM</h3>
            <p className="mt-1 text-sm text-zinc-500">Type-safe queries with PostgreSQL on Neon serverless database.</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white">Next.js 16</h3>
            <p className="mt-1 text-sm text-zinc-500">App Router, Server Components, and API Routes with TypeScript.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
