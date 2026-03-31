import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail, getUserByPhone } from "@/db/queries/users";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        login: { label: "Email или телефон", type: "text" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) return null;

        const login = credentials.login.trim();
        // Determine if login is phone or email
        const isPhone = /^\+?\d{10,15}$/.test(login.replace(/[\s\-()]/g, ""));
        const user = isPhone
          ? await getUserByPhone(login.replace(/[\s\-()]/g, ""))
          : await getUserByEmail(login);

        if (!user) return null;
        if (user.isBanned) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email || "",
          name: user.name,
          role: user.role,
          isActor: user.isActor,
          isCastingDirector: user.isCastingDirector,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.isActor = (user as any).isActor;
        token.isCastingDirector = (user as any).isCastingDirector;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isActor = token.isActor as boolean;
        session.user.isCastingDirector = token.isCastingDirector as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      isActor: boolean;
      isCastingDirector: boolean;
    };
  }
}
