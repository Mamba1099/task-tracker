import { z } from "zod";

export const DepartmentResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
});
export type DepartmentResponse = z.infer<typeof DepartmentResponseSchema>;
