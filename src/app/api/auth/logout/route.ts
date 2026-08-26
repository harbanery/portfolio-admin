import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { destroySession } from "@/server/auth";
import { SESSION_COOKIE_NAME } from "@/config/variables";

/**
 * POST /api/auth/logout
 * Hapus sesi di database lalu bersihkan cookie sesi di browser.
 */
export async function POST() {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE_NAME)?.value;

    await destroySession(token);
    store.delete(SESSION_COOKIE_NAME);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logout:", error);
    return NextResponse.json(
      { success: false, code: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}
