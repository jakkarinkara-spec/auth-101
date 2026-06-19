'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await signIn('credentials', {
            email,
            password,
            callbackUrl: '/dashboard',
        });
        setLoading(false);
    };

    return (
        <div className="relative min-h-dvh bg-[#030712] overflow-hidden flex items-center justify-center px-4 py-12">
            {/* Background orbs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-500/15 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
                <div className="absolute right-0 top-1/2 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-sm">
                {/* Header */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
                    <p className="mt-1 text-sm text-zinc-400">Sign in to your account to continue.</p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl">
                    {error && (
                        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                            <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>The email or password is incorrect.</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="text-sm font-medium text-zinc-300">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                className="h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-indigo-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="password" className="text-sm font-medium text-zinc-300">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                className="h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-indigo-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                        >
                            {loading ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in…
                                </>
                            ) : 'Sign in'}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-sm text-zinc-500">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="font-medium text-indigo-400 transition-colors hover:text-indigo-300">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
