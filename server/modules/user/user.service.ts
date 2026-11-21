import "server-only";
import { userRepository } from "./user.repository";
import { hashPassword, verifyPassword } from "@/lib/password";
import type { UpdateCredentialsInput } from "@/schemas/user.schema";
import { UserResponseSchema, type UserResponse } from "@/schemas/user.schema";
import type { UpdateUserCredentialsData, UserDTOInput } from "@/types/db";

function toDTO(user: UserDTOInput): UserResponse {
  return UserResponseSchema.parse({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    departmentId: user.departmentId,
    createdAt: user.createdAt,
  });
}
export const userService = {
  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new Error("USER_NOT_FOUND");
    return toDTO(user);
  },

  async updateCredentials(userId: string, input: UpdateCredentialsInput) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("USER_NOT_FOUND");

    const patch: UpdateUserCredentialsData = {};

    if (input.fullName) patch.fullName = input.fullName;

    if (input.email && input.email !== user.email) {
      const taken = await userRepository.findByEmail(input.email);
      if (taken) throw new Error("EMAIL_IN_USE");
      patch.email = input.email;
    }

    if (input.password) {
      const ok = await verifyPassword(
        input.currentPassword!,
        user.passwordHash,
      );
      if (!ok) throw new Error("INVALID_CURRENT_PASSWORD");
      patch.passwordHash = await hashPassword(input.password);
    }

    const updated = await userRepository.updateCredentials(userId, patch);
    return toDTO(updated);
  },
};
