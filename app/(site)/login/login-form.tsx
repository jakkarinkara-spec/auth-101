'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { field, fieldLabel, primaryButton, textLink } from '../_components/styles';

export default function LoginForm({ callbackUrl, failed, registered }: { callbackUrl: string; failed: boolean; registered: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // สำเร็จ → ไป callbackUrl, ผิด → NextAuth พากลับมาหน้านี้พร้อม ?error=
    await signIn('credentials', { email, password, callbackUrl });
    setLoading(false);
  };

  const registerHref = callbackUrl === '/' ? '/register' : `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return (
    <>
      {registered && !failed && (
        <p role="status" className="rounded-xl bg-(--nl-tint) px-4 py-3 text-[15px] text-(--nl-teal-dk)">
          สมัครสมาชิกเรียบร้อย เข้าสู่ระบบด้วยอีเมลและรหัสผ่านที่ตั้งไว้ได้เลย
        </p>
      )}
      {failed && (
        <p role="alert" className="rounded-xl bg-[#FDECEC] px-4 py-3 text-[15px] text-[#B42318]">
          อีเมลหรือรหัสผ่านไม่ถูกต้อง
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className={fieldLabel}>
          อีเมล
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className={field}
          />
        </label>
        <label className={fieldLabel}>
          รหัสผ่าน
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className={field}
          />
        </label>
        <button type="submit" disabled={loading} className={`${primaryButton} mt-1`}>
          {loading ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
        </button>
      </form>

      <p className="text-center text-[15px] text-(--nl-muted)">
        ยังไม่มีบัญชี?{' '}
        <Link href={registerHref} className={textLink}>
          สมัครสมาชิก
        </Link>
      </p>
    </>
  );
}
