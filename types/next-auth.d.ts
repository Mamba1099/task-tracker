// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

type AppRole = "SUPERVISOR" | "ATTACHE";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AppRole;
      departmentId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: AppRole;
    departmentId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: AppRole;
    departmentId: string | null;
  }
}
