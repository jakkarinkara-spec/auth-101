import { firstParam, type SearchParams } from '@/app/lib/search';
import { safeCallbackUrl } from '@/app/lib/redirect';
import { AuthShell } from '../_components/ui';
import RegisterForm from './register-form';

export default async function RegisterPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  return (
    <AuthShell page="register" title="สมัครสมาชิก" subtitle="สร้างบัญชีฟรี ใช้เวลาไม่ถึงนาที">
      <RegisterForm callbackUrl={safeCallbackUrl(firstParam(params.callbackUrl))} />
    </AuthShell>
  );
}
