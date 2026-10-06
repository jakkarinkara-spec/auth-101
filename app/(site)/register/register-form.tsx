'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { field, fieldLabel, primaryButton, textLink } from '../_components/styles';

export default function RegisterForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ส่ง callbackUrl ต่อไปหน้า login จะได้กลับไปหน้าจองเรือเดิมหลังเข้าสู่ระบบ
  const loginHref = (extra = '') => {
    const p = new URLSearchParams(extra);
    if (callbackUrl !== '/') p.set('callbackUrl', callbackUrl);
    const qs = p.toString();
    return qs ? `/login?${qs}` : '/login';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push(loginHref('registered=1'));
        return;
      }
      if (res.status === 409) {
        setError('อีเมลนี้มีบัญชีอยู่แล้ว ลองเข้าสู่ระบบแทน');
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.message ? `สมัครไม่สำเร็จ: ${data.message}` : 'สมัครไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      }
    } catch {
      setError('สมัครไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <p role="alert" className="rounded-xl bg-[#FDECEC] px-4 py-3 text-[15px] text-[#B42318]">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className={fieldLabel}>
          ชื่อ
          <input
            type="text"
            placeholder="ชื่อที่ให้กัปตันเรียก"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            className={field}
          />
        </label>
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
            minLength={6}
            autoComplete="new-password"
            className={field}
          />
          <span className="text-[13px] font-normal text-(--nl-muted)">อย่างน้อย 6 ตัวอักษร</span>
        </label>
        <button type="submit" disabled={loading} className={`${primaryButton} mt-1`}>
          {loading ? 'กำลังสร้างบัญชี…' : 'สมัครสมาชิก'}
        </button>
      </form>

      <p className="text-center text-[15px] text-(--nl-muted)">
        มีบัญชีอยู่แล้ว?{' '}
        <Link href={loginHref()} className={textLink}>
          เข้าสู่ระบบ
        </Link>
      </p>
    </>
  );
}
