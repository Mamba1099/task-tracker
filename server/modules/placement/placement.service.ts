import "server-only";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { placementRepository } from "./placement.repository";
import type { OnboardAttacheInput } from "@/schemas/placement.schema";

export const placementService = {
  async onboardAttache(supervisorId: string, input: OnboardAttacheInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) throw new Error("EMAIL_IN_USE");

    const passwordHash = await hashPassword(input.password);

    return prisma.$transaction(async (tx) => {
      const attache = await tx.user.create({
        data: {
          email: input.email,
          passwordHash,
          fullName: input.fullName,
          role: "ATTACHE",
          departmentId: input.departmentId,
        },
      });

      const placement = await tx.placement.create({
        data: {
          attacheId: attache.id,
          supervisorId,
          departmentId: input.departmentId,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          status: "ACTIVE",
        },
      });

      return { attache, placement };
    });
  },

  async listMyAttaches(supervisorId: string) {
    const placements =
      await placementRepository.findActiveBySupervisor(supervisorId);
    return placements.map((p) => ({
      placementId: p.id,
      startDate: p.startDate,
      endDate: p.endDate,
      attache: p.attache,
      department: p.department,
    }));
  },

  async updateStatus(
    supervisorId: string,
    placementId: string,
    status: "ACTIVE" | "COMPLETED" | "TERMINATED",
  ) {
    const placement = await placementRepository.findById(placementId);
    if (!placement) throw new Error("PLACEMENT_NOT_FOUND");
    if (placement.supervisorId !== supervisorId) throw new Error("FORBIDDEN");

    return placementRepository.updateStatus(placementId, status);
  },
};
