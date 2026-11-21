import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/lib/session";
import { OnboardAttacheSchema } from "@/schemas/placement.schema";
import { placementService } from "@/server/modules/placement";
import {
  validateSecurity,
  createSecureResponse,
  createSecureErrorResponse,
} from "@/lib/security";

async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? await verifySession(token) : null;
}

export async function GET(req: NextRequest) {
  const securityError = validateSecurity(req);
  if (securityError) return securityError;

  const session = await getSession();
  if (!session) return createSecureErrorResponse("Unauthenticated", 401, req);
  if (session.role !== "SUPERVISOR")
    return createSecureErrorResponse("Forbidden", 403, req);

  const attaches = await placementService.listMyAttaches(session.userId);
  return createSecureResponse(attaches, { status: 200 }, req);
}

export async function POST(req: NextRequest) {
  const securityError = validateSecurity(req);
  if (securityError) return securityError;

  const session = await getSession();
  if (!session) return createSecureErrorResponse("Unauthenticated", 401, req);
  if (session.role !== "SUPERVISOR")
    return createSecureErrorResponse("Forbidden", 403, req);

  const parsed = OnboardAttacheSchema.safeParse(await req.json());
  if (!parsed.success)
    return createSecureResponse(
      { errors: parsed.error.flatten() },
      { status: 400 },
      req,
    );

  try {
    const result = await placementService.onboardAttache(
      session.userId,
      parsed.data,
    );
    return createSecureResponse(result, { status: 201 }, req);
  } catch (e) {
    if (e instanceof Error && e.message === "EMAIL_IN_USE")
      return createSecureErrorResponse("Email already in use", 409, req);
    return createSecureErrorResponse("Internal error", 500, req);
  }
}
