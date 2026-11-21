import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/lib/session";
import { ReviewTaskSchema } from "@/schemas/task.schema";
import { taskService } from "@/server/modules/task";
import {
  validateSecurity,
  createSecureResponse,
  createSecureErrorResponse,
} from "@/lib/security";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const securityError = validateSecurity(req);
  if (securityError) return securityError;

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;

  if (!session) return createSecureErrorResponse("Unauthenticated", 401, req);
  if (session.role !== "SUPERVISOR")
    return createSecureErrorResponse("Forbidden", 403, req);

  const parsed = ReviewTaskSchema.safeParse(await req.json());
  if (!parsed.success)
    return createSecureResponse(
      { errors: parsed.error.flatten() },
      { status: 400 },
      req,
    );

  const { id } = await params;
  try {
    const task = await taskService.reviewTask(id, session.userId, parsed.data);
    return createSecureResponse(task, { status: 200 }, req);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "FORBIDDEN")
      return createSecureErrorResponse("Forbidden", 403, req);
    if (msg === "TASK_NOT_SUBMITTED")
      return createSecureErrorResponse(
        "Task must be submitted before review",
        400,
        req,
      );
    return createSecureErrorResponse("Internal error", 500, req);
  }
}
