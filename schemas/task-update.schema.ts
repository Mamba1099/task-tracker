import { z } from "zod";

export const CreateTaskUpdateSchema = z.object({
  progressNote: z.string().min(5, "Progress note is required"),
  challengeBlocker: z.string().optional().nullable(),
});
export type CreateTaskUpdateInput = z.infer<typeof CreateTaskUpdateSchema>;
