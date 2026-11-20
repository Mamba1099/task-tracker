import { z } from "zod";
import { RoleEnum } from "./auth.schema";

export const SupervisorRegisterAttacheSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(2, "Full name is required").max(100),
  password: z.string().min(8, "Password must be at least 8 characters"),
  departmentId: z.string().cuid("Invalid department ID").optional().nullable(),
});
export type SupervisorRegisterAttacheInput = z.infer<
  typeof SupervisorRegisterAttacheSchema
>;

export const UpdateCredentialsSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required").max(100).optional(),
    email: z.string().email("Invalid email address").optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .optional(),
    currentPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password && !data.currentPassword) return false;
      return true;
    },
    {
      message: "Current password is required to set a new password",
      path: ["currentPassword"],
    },
  );
export type UpdateCredentialsInput = z.infer<typeof UpdateCredentialsSchema>;

export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  fullName: z.string(),
  role: RoleEnum,
  departmentId: z.string().nullable(),
  createdAt: z.date(),
});
export type UserResponse = z.infer<typeof UserResponseSchema>;
