import { z } from "zod";

export const PriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);
export const TaskStatusEnum = z.enum([
  "ASSIGNED",
  "IN_PROGRESS",
  "SUBMITTED",
  "RETURNED",
  "COMPLETED",
]);
export const ReviewDecisionEnum = z.enum(["APPROVED", "RETURNED"]);

export const CreateTaskSchema = z.object({
  attacheId: z.string().cuid("Invalid attaché ID"),
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: PriorityEnum.default("MEDIUM"),
  dueDate: z.string().datetime().optional().nullable(),
});
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

export const UpdateTaskStatusSchema = z.object({
  status: TaskStatusEnum,
});
export type UpdateTaskStatusInput = z.infer<typeof UpdateTaskStatusSchema>;

export const ReviewTaskSchema = z
  .object({
    decision: ReviewDecisionEnum,
    feedback: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.decision === "RETURNED" && !data.feedback) return false;
      return true;
    },
    {
      message: "Feedback is required when returning a task",
      path: ["feedback"],
    },
  );
export type ReviewTaskInput = z.infer<typeof ReviewTaskSchema>;
