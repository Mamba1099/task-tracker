import "server-only";
import { taskRepository } from "./task.repository";
import type {
  CreateTaskInput,
  ReviewTaskInput,
  UpdateTaskStatusInput,
} from "@/schemas/task.schema";
import type { CreateTaskUpdateInput } from "@/schemas/task-update.schema";

export const taskService = {
  async createTask(supervisorId: string, input: CreateTaskInput) {
    const placement = await taskRepository.findActivePlacement(
      supervisorId,
      input.attacheId,
    );
    if (!placement) throw new Error("NO_ACTIVE_PLACEMENT");

    return taskRepository.create({
      supervisorId,
      attacheId: input.attacheId,
      placementId: placement.id,
      title: input.title,
      description: input.description,
      priority: input.priority,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    });
  },

  async listTasks(userId: string, role: "SUPERVISOR" | "ATTACHE") {
    return role === "SUPERVISOR"
      ? taskRepository.listBySupervisor(userId)
      : taskRepository.listByAttache(userId);
  },

  async getTask(
    taskId: string,
    userId: string,
    role: "SUPERVISOR" | "ATTACHE",
  ) {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new Error("TASK_NOT_FOUND");

    if (role === "SUPERVISOR" && task.supervisorId !== userId)
      throw new Error("FORBIDDEN");
    if (role === "ATTACHE" && task.attacheId !== userId)
      throw new Error("FORBIDDEN");

    return task;
  },

  async updateStatus(
    taskId: string,
    attacheId: string,
    input: UpdateTaskStatusInput,
  ) {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new Error("TASK_NOT_FOUND");
    if (task.attacheId !== attacheId) throw new Error("FORBIDDEN");

    const validTransitions: Record<string, string[]> = {
      ASSIGNED: ["IN_PROGRESS"],
      IN_PROGRESS: ["SUBMITTED"],
      RETURNED: ["IN_PROGRESS"],
    };

    const allowed = validTransitions[task.status] || [];
    if (!allowed.includes(input.status)) {
      throw new Error(
        `INVALID_STATUS_TRANSITION: Cannot go from ${task.status} to ${input.status}`,
      );
    }

    return taskRepository.updateStatus(taskId, input.status);
  },

  async addProgressUpdate(
    taskId: string,
    attacheId: string,
    input: CreateTaskUpdateInput,
  ) {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new Error("TASK_NOT_FOUND");
    if (task.attacheId !== attacheId) throw new Error("FORBIDDEN");

    return taskRepository.addUpdate({
      taskId,
      attacheId,
      progressNote: input.progressNote,
      challengeBlocker: input.challengeBlocker,
    });
  },

  async reviewTask(
    taskId: string,
    supervisorId: string,
    input: ReviewTaskInput,
  ) {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new Error("TASK_NOT_FOUND");
    if (task.supervisorId !== supervisorId) throw new Error("FORBIDDEN");
    if (task.status !== "SUBMITTED") throw new Error("TASK_NOT_SUBMITTED");

    await taskRepository.addReview({
      taskId,
      supervisorId,
      decision: input.decision,
      feedback: input.feedback,
    });

    const newStatus = input.decision === "APPROVED" ? "COMPLETED" : "RETURNED";
    return taskRepository.updateStatus(taskId, newStatus);
  },
};
