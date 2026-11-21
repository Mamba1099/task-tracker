import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { UpdateCredentialsSchema } from "@/schemas/user.schema";
import { userService } from "@/server/modules/user";
import {
  validateSecurity,
  createSecureResponse,
  createSecureErrorResponse,
} from "@/lib/security";

export async function PATCH(req: NextRequest) {
  const securityError = validateSecurity(req);
  if (securityError) return securityError;

  const session = await auth();
  if (!session?.user) {
    return createSecureErrorResponse("Unauthenticated", 401, req);
  }

  const parsed = UpdateCredentialsSchema.safeParse(await req.json());
  if (!parsed.success) {
    return createSecureResponse(
      { errors: parsed.error.flatten() },
      { status: 400 },
      req,
    );
  }

  try {
    const user = await userService.updateCredentials(
      session.user.id,
      parsed.data,
    );
    return createSecureResponse(user, { status: 200 }, req);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "EMAIL_IN_USE") {
      return createSecureErrorResponse("Email already in use", 409, req);
    }
    if (msg === "INVALID_CURRENT_PASSWORD") {
      return createSecureErrorResponse(
        "Current password is incorrect",
        400,
        req,
      );
    }
    return createSecureErrorResponse("Internal error", 500, req);
  }
}
