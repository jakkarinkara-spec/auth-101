import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-dvh">
      <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-24">
        {/* Badge */}
        <div className="ui-badge ui-badge-secondary mb-8 gap-2 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-highlight" />
          Next.js 16 · NextAuth v5 · Drizzle ORM · Neon
        </div>

        {/* Hero heading */}
        <h1 className="max-w-3xl text-center text-5xl font-bold tracking-tight text-ink sm:text-6xl lg:text-7xl">
          Authentication
          <span className="block text-highlight">
            made simple.
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-center text-lg leading-relaxed text-ink-muted">
          A modern full-stack auth demo with JWT sessions, password hashing, and a real PostgreSQL database. Learn how it all fits together.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <Link href="/login" className="ui-btn h-12 px-8 text-lg">
            Sign in
          </Link>
          <Link href="/register" className="ui-btn ui-btn-secondary h-12 px-8 text-lg">
            Create account
          </Link>
        </div>

        {/* Feature cards */}
        <div className="mt-24 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="ui-panel p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-ink">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h3 className="font-semibold text-ink">NextAuth v5</h3>
            <p className="mt-1 text-sm text-ink-muted">JWT sessions with Credentials provider and bcrypt password hashing.</p>
          </div>

          <div className="ui-panel p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-ink">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125S3.75 11.278 3.75 9m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125S3.75 13.903 3.75 11.625" />
              </svg>
            </div>
            <h3 className="font-semibold text-ink">Drizzle ORM</h3>
            <p className="mt-1 text-sm text-ink-muted">Type-safe queries with PostgreSQL on Neon serverless database.</p>
          </div>

          <div className="ui-panel p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-ink">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <h3 className="font-semibold text-ink">Next.js 16</h3>
            <p className="mt-1 text-sm text-ink-muted">App Router, Server Components, and API Routes with TypeScript.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
