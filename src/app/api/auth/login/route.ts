import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/server/db";
import {
  clearFailedAttempts,
  createSession,
  getClientIp,
  isIpBlocked,
  MAX_LOGIN_ATTEMPTS,
  recordFailedAttempt,
  sessionCookieOptions,
  verifyLoginPassword,
} from "@/server/auth";

/** Konversi sisa waktu blokir ke menit (minimal 1). */
function toRemainingMinutes(blockedUntil: Date | null | undefined): number {
  if (!blockedUntil) return 15;
  return Math.max(
    1,
    Math.ceil((blockedUntil.getTime() - Date.now()) / (60 * 1000)),
  );
}

/**
 * POST /api/auth/login
 * Verifikasi password admin, terapkan rate-limit per IP, lalu buat sesi
 * baru (cookie httpOnly, berlaku 12 jam).
 */
export async function POST(request: NextRequest) {
  try {
    let password: unknown;
    try {
      const body = await request.json();
      password = body?.password;
    } catch {
      return NextResponse.json(
        { success: false, code: "INVALID_BODY" },
        { status: 400 },
      );
    }

    if (typeof password !== "string" || password.length === 0) {
      return NextResponse.json(
        { success: false, code: "INVALID_BODY" },
        { status: 400 },
      );
    }

    const ip = getClientIp(request);

    // Cek blokir IP akibat terlalu banyak percobaan gagal.
    if (await isIpBlocked(ip)) {
      const attempt = await prisma.loginAttempt.findUnique({
        where: { ipAddress: ip },
      });
      return NextResponse.json(
        {
          success: false,
          code: "BLOCKED",
          minutes: toRemainingMinutes(attempt?.blockedUntil),
        },
        { status: 429 },
      );
    }

    const hasAdmin = Boolean(await prisma.admin.findFirst());
    const { ok, adminId } = await verifyLoginPassword(password);

    if (!ok || adminId === null) {
      const { blocked, blockedUntil } = await recordFailedAttempt(ip);
      if (blocked) {
        return NextResponse.json(
          { success: false, code: "BLOCKED", minutes: toRemainingMinutes(blockedUntil) },
          { status: 429 },
        );
      }
      if (!hasAdmin) {
        // Belum ada password aktif sama sekali.
        return NextResponse.json(
          { success: false, code: "NO_ADMIN" },
          { status: 401 },
        );
      }
      const attempt = await prisma.loginAttempt.findUnique({
        where: { ipAddress: ip },
      });
      const remaining = Math.max(
        0,
        MAX_LOGIN_ATTEMPTS - (attempt?.attemptCount ?? 1),
      );
      return NextResponse.json(
        { success: false, code: "INVALID", remaining },
        { status: 401 },
      );
    }

    // Login berhasil: reset hitungan gagal + buat sesi 12 jam.
    await clearFailedAttempts(ip);
    const { token, expiresAt } = await createSession(adminId);
    const store = await cookies();
    store.set({ ...sessionCookieOptions(expiresAt), value: token });

    return NextResponse.json({
      success: true,
      data: { expiresAt: expiresAt.toISOString() },
    });
  } catch (error) {
    console.error("Error login:", error);
    return NextResponse.json(
      { success: false, code: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}
