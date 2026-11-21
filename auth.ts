import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth/auth.config";
import { LoginSchema } from "@/schemas/auth.schema";
import { userRepository } from "@/server/modules/user/user.repository";
import { verifyPassword } from "@/lib/password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await userRepository.findByEmail(parsed.data.email);
        if (!user) return null;

        const ok = await verifyPassword(
          parsed.data.password,
          user.passwordHash,
        );
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          departmentId: user.departmentId,
        };
      },
    }),
  ],
});
