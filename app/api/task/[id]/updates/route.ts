import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/lib/session";
import { CreateTaskUpdateSchema } from "@/schemas/task-update.schema";
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
  if (session.role !== "ATTACHE")
    return createSecureErrorResponse("Forbidden", 403, req);

  const parsed = CreateTaskUpdateSchema.safeParse(await req.json());
  if (!parsed.success)
    return createSecureResponse(
      { errors: parsed.error.flatten() },
      { status: 400 },
      req,
    );

  const { id } = await params;
  try {
    const update = await taskService.addProgressUpdate(
      id,
      session.userId,
      parsed.data,
    );
    return createSecureResponse(update, { status: 201 }, req);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "FORBIDDEN")
      return createSecureErrorResponse("Forbidden", 403, req);
    return createSecureErrorResponse("Internal error", 500, req);
  }
}
