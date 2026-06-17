'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    console.log(error);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await signIn('credentials', { //ส่งข้อมูล credentials ไปใน auth ใน path root
            email,
            password,
            callbackUrl: '/dashboard', //ถ้าผ่าน signin ไปที่ path /...
        });
        setLoading(false);
    };

    return (
        <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black">
            <div className="w-full max-w-sm rounded-2xl border border-black/[.08] bg-white p-8 shadow-sm dark:border-white/[.145] dark:bg-zinc-950">
                <div className="mb-8 flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
                        Welcome back
                    </h1>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Sign in to your account to continue.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="email"
                            className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-11 rounded-lg border border-black/[.08] bg-transparent px-3 text-sm text-black outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-11 rounded-lg border border-black/[.08] bg-transparent px-3 text-sm text-black outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
                        />
                    </div>
                    <div>
                        {error && (
                            <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                <svg
                                    className="mt-0.5 h-4 w-4 flex-shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                                <span>The email or password is incorrect</span>
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-1 flex h-11 items-center justify-center rounded-lg bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-[#ccc]"
                    >
                        {loading ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
                    Don&apos;t have an account?{' '}
                    <Link
                        href="/register"
                        className="font-medium text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50"
                    >
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}
