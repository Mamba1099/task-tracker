import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/lib/session";
import { CreateTaskSchema } from "@/schemas/task.schema";
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

export async function GET(req: NextRequest) {
  const securityError = validateSecurity(req);
  if (securityError) return securityError;

  const session = await getSession();
  if (!session) return createSecureErrorResponse("Unauthenticated", 401, req);

  const tasks = await taskService.listTasks(session.userId, session.role);
  return createSecureResponse(tasks, { status: 200 }, req);
}

export async function POST(req: NextRequest) {
  const securityError = validateSecurity(req);
  if (securityError) return securityError;

  const session = await getSession();
  if (!session) return createSecureErrorResponse("Unauthenticated", 401, req);
  if (session.role !== "SUPERVISOR")
    return createSecureErrorResponse("Forbidden", 403, req);

  const parsed = CreateTaskSchema.safeParse(await req.json());
  if (!parsed.success)
    return createSecureResponse(
      { errors: parsed.error.flatten() },
      { status: 400 },
      req,
    );

  try {
    const task = await taskService.createTask(session.userId, parsed.data);
    return createSecureResponse(task, { status: 201 }, req);
  } catch (e) {
    if (e instanceof Error && e.message === "NO_ACTIVE_PLACEMENT")
      return createSecureErrorResponse(
        "Attaché has no active placement with you",
        400,
        req,
      );
    return createSecureErrorResponse("Internal error", 500, req);
  }
}
