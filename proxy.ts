// proxy.ts
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";

export const { auth: proxy } = NextAuth(authConfig);

export const config = {
  matcher: ["/dashboard/:path*", "/supervisor/:path*", "/attache/:path*"],
};
