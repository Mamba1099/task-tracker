import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/lib/session";
import { UpdatePlacementStatusSchema } from "@/schemas/placement.schema";
import { placementService } from "@/server/modules/placement";
import {
  validateSecurity,
  createSecureResponse,
  createSecureErrorResponse,
} from "@/lib/security";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const securityError = validateSecurity(req);
  if (securityError) return securityError;

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) return createSecureErrorResponse("Unauthenticated", 401, req);
  if (session.role !== "SUPERVISOR")
    return createSecureErrorResponse("Forbidden", 403, req);

  const parsed = UpdatePlacementStatusSchema.safeParse(await req.json());
  if (!parsed.success)
    return createSecureResponse(
      { errors: parsed.error.flatten() },
      { status: 400 },
      req,
    );

  const { id } = await params;
  try {
    const updated = await placementService.updateStatus(
      session.userId,
      id,
      parsed.data.status,
    );
    return createSecureResponse(updated, { status: 200 }, req);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "FORBIDDEN")
      return createSecureErrorResponse("Forbidden", 403, req);
    if (msg === "PLACEMENT_NOT_FOUND")
      return createSecureErrorResponse("Not found", 404, req);
    return createSecureErrorResponse("Internal error", 500, req);
  }
}
