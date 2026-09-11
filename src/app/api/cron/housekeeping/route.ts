import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Cron job housekeeping database (dipanggil Vercel Cron, lihat vercel.json).
 *
 * Tugas:
 * 1. Hapus sesi kedaluwarsa (normalnya sudah dibersihkan saat login,
 *    cron menangani sesi milik admin yang tidak pernah login lagi).
 * 2. Hapus catatan rate-limit login yang sudah tidak relevan (tidak
 *    diblokir dan tidak aktif dalam 7 hari terakhir).
 *
 * Autentikasi: Vercel Cron mengirim header `Authorization: Bearer
 * <CRON_SECRET>`. Bila CRON_SECRET tidak diset di produksi, endpoint
 * menolak (404) supaya tidak bisa dipanggil sembarang.
 */

/** Batas usia catatan login attempt yang tidak relevan (7 hari). */
const LOGIN_ATTEMPT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authorization = request.headers.get("authorization");
    if (authorization !== `Bearer ${secret}`) {
      return NextResponse.json(
        { success: false, code: "UNAUTHORIZED" },
        { status: 401 },
      );
    }
  } else if (process.env.NODE_ENV === "production") {
    // Tanpa secret terkonfigurasi, jangan ekspos endpoint di produksi.
    return NextResponse.json(
      { success: false, code: "NOT_FOUND" },
      { status: 404 },
    );
  }

  try {
    const now = new Date();
    const attemptCutoff = new Date(Date.now() - LOGIN_ATTEMPT_TTL_MS);

    const [sessions, attempts] = await Promise.all([
      prisma.session.deleteMany({ where: { expiresAt: { lt: now } } }),
      prisma.loginAttempt.deleteMany({
        where: {
          lastAttemptAt: { lt: attemptCutoff },
          AND: [
            { OR: [{ blockedUntil: null }, { blockedUntil: { lt: now } }] },
          ],
        },
      }),
    ]);

    console.info(
      `[cron] housekeeping selesai: ${sessions.count} sesi kedaluwarsa, ` +
        `${attempts.count} login attempt usang dihapus`,
    );

    return NextResponse.json({
      success: true,
      data: {
        deletedExpiredSessions: sessions.count,
        deletedStaleLoginAttempts: attempts.count,
        ranAt: now.toISOString(),
      },
    });
  } catch (error) {
    console.error("[cron] housekeeping gagal:", error);
    return NextResponse.json(
      { success: false, code: "HOUSEKEEPING_FAILED" },
      { status: 500 },
    );
  }
}
