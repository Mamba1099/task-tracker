import { z } from "zod";

export const PlacementStatusEnum = z.enum([
  "ACTIVE",
  "COMPLETED",
  "TERMINATED",
]);

export const OnboardAttacheSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required").max(100),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    departmentId: z.string().cuid("Invalid department ID"),
    startDate: z.string().datetime("Invalid start date"),
    endDate: z.string().datetime("Invalid end date"),
  })
  .refine((d) => new Date(d.endDate) > new Date(d.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });
export type OnboardAttacheInput = z.infer<typeof OnboardAttacheSchema>;

export const UpdatePlacementStatusSchema = z.object({
  status: PlacementStatusEnum,
});
export type UpdatePlacementStatusInput = z.infer<
  typeof UpdatePlacementStatusSchema
>;

export const PlacementResponseSchema = z.object({
  id: z.string(),
  attacheId: z.string(),
  supervisorId: z.string(),
  departmentId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  status: PlacementStatusEnum,
});
export type PlacementResponse = z.infer<typeof PlacementResponseSchema>;
