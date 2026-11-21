
import { prisma } from "@/lib/prisma";
import type { CreatePlacementData } from "@/types/db";

export const placementRepository = {
  create(data: CreatePlacementData) {
    return prisma.placement.create({ data });
    },
    
  findActiveBySupervisor(supervisorId: string) {
    return prisma.placement.findMany({
      where: { supervisorId, status: "ACTIVE" },
      include: {
        attache: {
          select: {
            id: true,
            fullName: true,
            email: true,
            department: true,
          },
        },
        department: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string) {
    return prisma.placement.findUnique({
      where: { id },
      include: { attache: true, supervisor: true, department: true },
    });
  },

  findActiveByAttache(attacheId: string) {
    return prisma.placement.findFirst({
      where: { attacheId, status: "ACTIVE" },
      include: { supervisor: true, department: true },
    });
  },

  updateStatus(id: string, status: "ACTIVE" | "COMPLETED" | "TERMINATED") {
    return prisma.placement.update({ where: { id }, data: { status } });
  },
};
