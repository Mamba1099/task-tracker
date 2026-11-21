import { prisma } from "@/lib/prisma";
import type {
  CreateTaskData,
  CreateTaskUpdateData,
  CreateTaskReviewData,
} from "@/types/db";

export const taskRepository = {
  create(data: CreateTaskData) {
    return prisma.task.create({ data });
  },

  findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        supervisor: { select: { id: true, fullName: true } },
        attache: { select: { id: true, fullName: true } },
        updates: { orderBy: { createdAt: "desc" } },
        reviews: { orderBy: { createdAt: "desc" } },
      },
    });
  },

  listBySupervisor(supervisorId: string) {
    return prisma.task.findMany({
      where: { supervisorId },
      include: { attache: { select: { fullName: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  listByAttache(attacheId: string) {
    return prisma.task.findMany({
      where: { attacheId },
      include: { supervisor: { select: { fullName: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  findActivePlacement(supervisorId: string, attacheId: string) {
    return prisma.placement.findFirst({
      where: { supervisorId, attacheId, status: "ACTIVE" },
    });
  },

  updateStatus(
    id: string,
    status: "ASSIGNED" | "IN_PROGRESS" | "SUBMITTED" | "RETURNED" | "COMPLETED",
  ) {
    return prisma.task.update({ where: { id }, data: { status } });
  },

  addUpdate(data: CreateTaskUpdateData) {
    return prisma.taskUpdate.create({ data });
  },

  addReview(data: CreateTaskReviewData) {
    return prisma.taskReview.create({ data });
  },
};
