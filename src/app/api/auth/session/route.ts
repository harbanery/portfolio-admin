import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/server/auth";
import { SESSION_COOKIE_NAME } from "@/config/variables";

/**
 * GET /api/auth/session
 * Cek validitas sesi saat ini (dipakai layout admin untuk guard client).
 * Selalu 200; status ada di field `authenticated`.
 */
export async function GET(_request: NextRequest) {
  const token = _request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await validateSession(token);

  if (!session) {
    return NextResponse.json({ success: true, authenticated: false });
  }

  return NextResponse.json({
    success: true,
    authenticated: true,
    data: { expiresAt: session.expiresAt.toISOString() },
  });
}
