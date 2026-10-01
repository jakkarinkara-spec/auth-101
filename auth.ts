import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/app/db/index';
import { usersTable } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = credentials.email as string;
        const password = credentials.password as string;

        const [user] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, email));

        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    // ตอน login: เก็บ user.id ลงใน JWT token
    jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    // ทุกครั้งที่เรียก auth(): ส่ง id จาก token ไปให้ session.user
    session({ session, token }) {
      if (session.user) session.user.id = (token.id ?? token.sub) as string;
      return session;
    },
  },
  pages: {
      signIn: '/login',
      error: '/login', // ส่ง error กลับไปหน้า login เลย พร้อม query param ?error=
  },
});