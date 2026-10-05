import { auth, signOut } from '@/auth';
import Link from 'next/link';
import ThemeToggle from '@/app/components/theme-toggle';

export default async function Navbar() {
  const session = await auth();

  async function handleSignOut() {
    'use server';
    await signOut({ redirectTo: '/' });
  }

  return (
    <header className="ui-bar fixed top-0 left-0 right-0 z-50 border-b">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-ink">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <span className="font-semibold text-ink">Auth 101</span>
        </Link>

        {/* Auth state */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <span className="hidden sm:block text-sm text-ink-muted">
                {session.user?.name ?? session.user?.email}
              </span>
              <form action={handleSignOut}>
                <button type="submit" className="ui-btn ui-btn-secondary h-9 px-3.5">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                    />
                  </svg>
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="ui-link text-sm">
                Sign in
              </Link>
              <Link href="/register" className="ui-btn h-9 px-4">
                Get started
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
