import { firstParam, type SearchParams } from '@/app/lib/search';
import { safeCallbackUrl } from '@/app/lib/redirect';
import { AuthShell } from '../_components/ui';
import LoginForm from './login-form';

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  return (
    <AuthShell page="login" title="เข้าสู่ระบบ" subtitle="เข้าสู่ระบบเพื่อจองเรือและติดตามคำขอจองของคุณ">
      <LoginForm
        callbackUrl={safeCallbackUrl(firstParam(params.callbackUrl))}
        // NextAuth ส่ง ?error=CredentialsSignin กลับมาเมื่อรหัสผ่านผิด
        failed={Boolean(firstParam(params.error))}
        registered={firstParam(params.registered) === '1'}
      />
    </AuthShell>
  );
}
