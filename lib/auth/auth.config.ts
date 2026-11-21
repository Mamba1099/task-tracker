import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";

export const authConfig = {
  pages: { signIn: "/login" },
  session: {
    strategy: "jwt",
    maxAge: 30 * 60,
    updateAge: 5 * 60,
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isDashboard =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/supervisor") ||
        pathname.startsWith("/attache");
      return isDashboard ? isLoggedIn : true;
    },

    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.departmentId = user.departmentId;
      }
      return token;
    },

    async session({ session, token }: { session: any; token: JWT }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.departmentId = token.departmentId;
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
