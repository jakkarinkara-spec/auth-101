'use server';

import { signOut } from '@/auth';

// แยก Server Action ไว้ระดับ module (ไม่ประกาศ inline ใน component) — id คงที่ ไม่ผูกกับ closure ของ SiteNav
export async function signOutAction() {
  await signOut({ redirectTo: '/' });
}
