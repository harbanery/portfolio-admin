import { NextRequest, NextResponse } from "next/server";
import { NODE_ENV } from "@/config/variables";
import { applyNewAdminPassword, generateAdminPassword, getClientIp } from "@/server/auth";
import { buildPasswordEmail } from "@/server/passwordEmail";
import { isEmailConfigured, sendEmail } from "@/server/email";

/**
 * POST /api/auth/generate-password
 * Khusus mode development (NODE_ENV === "development").
 *
 * Generate password admin baru: password lama dihapus (tidak berlaku),
 * semua sesi dicabut, lalu password baru dikirim via email SMTP dengan
 * desain rich email (pola progress-self).
 *
 * Urutan aman: generate → kirim email → (berhasil) simpan ke database.
 * Bila pengiriman email gagal, password lama tetap berlaku sehingga admin
 * tidak terkunci.
 */

/** Cooldown generate per IP (ms) agar tidak spam email. */
const GENERATE_COOLDOWN_MS = 60 * 1000;
const lastGenerateByIp = new Map<string, number>();

export async function POST(request: NextRequest) {
  if (NODE_ENV !== "development") {
    return NextResponse.json(
      { success: false, code: "DEV_ONLY" },
      { status: 403 },
    );
  }

  try {
    // Cooldown sederhana per IP untuk mencegah spam email.
    const ip = getClientIp(request);
    const now = Date.now();
    const last = lastGenerateByIp.get(ip) ?? 0;
    if (now - last < GENERATE_COOLDOWN_MS) {
      const seconds = Math.ceil((GENERATE_COOLDOWN_MS - (now - last)) / 1000);
      return NextResponse.json(
        { success: false, code: "COOLDOWN", seconds },
        { status: 429 },
      );
    }

    if (!isEmailConfigured()) {
      return NextResponse.json(
        { success: false, code: "SMTP_NOT_CONFIGURED" },
        { status: 503 },
      );
    }

    // Generate password baru, kirim email, lalu terapkan bila berhasil.
    const password = generateAdminPassword();
    const generatedAt = new Date();
    const email = buildPasswordEmail({ password, generatedAt });

    const sent = await sendEmail({
      subject: email.subject,
      text: email.text,
      html: email.html,
    });

    if (!sent) {
      return NextResponse.json(
        { success: false, code: "SEND_FAILED" },
        { status: 502 },
      );
    }

    lastGenerateByIp.set(ip, now);
    await applyNewAdminPassword(password);

    return NextResponse.json({
      success: true,
      message:
        "Password baru telah digenerate dan dikirim ke email Anda. Password lama tidak berlaku lagi.",
    });
  } catch (error) {
    console.error("Error generate password:", error);
    return NextResponse.json(
      { success: false, code: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}
