import { prisma } from "@/lib/prisma";
import type { CreateUserData, UpdateUserCredentialsData } from "@/types/db";

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { department: true },
    });
  },

  create(data: CreateUserData) {
    return prisma.user.create({ data });
  },

  updateCredentials(id: string, data: UpdateUserCredentialsData) {
    return prisma.user.update({ where: { id }, data });
  },
};
