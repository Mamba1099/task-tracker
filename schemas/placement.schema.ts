import { z } from "zod";

export const PlacementStatusEnum = z.enum([
  "ACTIVE",
  "COMPLETED",
  "TERMINATED",
]);

export const CreatePlacementSchema = z
  .object({
    attacheId: z.string().cuid("Invalid attaché ID"),
    supervisorId: z.string().cuid("Invalid supervisor ID"),
    departmentId: z.string().cuid("Invalid department ID"),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  })
  .refine(
    (data) => {
      return new Date(data.endDate) > new Date(data.startDate);
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );
export type CreatePlacementInput = z.infer<typeof CreatePlacementSchema>;
