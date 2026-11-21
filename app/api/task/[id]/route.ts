import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/lib/session";
import { UpdateTaskStatusSchema } from "@/schemas/task.schema";
import { taskService } from "@/server/modules/task";
import {
  validateSecurity,
  createSecureResponse,
  createSecureErrorResponse,
} from "@/lib/security";

async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? verifySession(token) : null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const securityError = validateSecurity(req);
  if (securityError) return securityError;

  const session = await getSession();
  if (!session) return createSecureErrorResponse("Unauthenticated", 401, req);

  const { id } = await params;
  try {
    const task = await taskService.getTask(id, session.userId, session.role);
    return createSecureResponse(task, { status: 200 }, req);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "FORBIDDEN")
      return createSecureErrorResponse("Forbidden", 403, req);
    if (msg === "TASK_NOT_FOUND")
      return createSecureErrorResponse("Not found", 404, req);
    return createSecureErrorResponse("Internal error", 500, req);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const securityError = validateSecurity(req);
  if (securityError) return securityError;

  const session = await getSession();
  if (!session) return createSecureErrorResponse("Unauthenticated", 401, req);
  if (session.role !== "ATTACHE")
    return createSecureErrorResponse("Forbidden", 403, req);

  const parsed = UpdateTaskStatusSchema.safeParse(await req.json());
  if (!parsed.success)
    return createSecureResponse(
      { errors: parsed.error.flatten() },
      { status: 400 },
      req,
    );

  const { id } = await params;
  try {
    const updated = await taskService.updateStatus(
      id,
      session.userId,
      parsed.data,
    );
    return createSecureResponse(updated, { status: 200 }, req);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "FORBIDDEN")
      return createSecureErrorResponse("Forbidden", 403, req);
    if (msg.startsWith("INVALID_STATUS_TRANSITION"))
      return createSecureErrorResponse(msg.split(":")[1].trim(), 400, req);
    return createSecureErrorResponse("Internal error", 500, req);
  }
}
