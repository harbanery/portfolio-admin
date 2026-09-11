import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/config/variables";

/**
 * Proxy (pengganti middleware di Next.js 16) untuk proteksi rute admin.
 *
 * - Halaman: tanpa cookie sesi → redirect ke /login. /login dengan cookie
 *   sesi → redirect ke / (hindari login ganda).
 * - API selain /api/auth/*: tanpa cookie sesi → 401 JSON.
 * - Validasi sesi penuh (terhadap database) dilakukan di route handler
 *   dan layout admin; proxy hanya memeriksa keberadaan cookie agar cepat.
 */

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);

  // Endpoint auth selalu diizinkan (login/logout/session/generate-password).
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Endpoint cron meng-autentikasi sendiri via CRON_SECRET (Bearer
  // token), bukan cookie sesi — Vercel Cron tidak memegang cookie.
  if (pathname.startsWith("/api/cron/")) {
    return NextResponse.next();
  }

  // API lain: butuh cookie sesi (validasi penuh tetap di route handler).
  if (pathname.startsWith("/api")) {
    if (!hasSessionCookie) {
      return NextResponse.json(
        { success: false, code: "UNAUTHORIZED" },
        { status: 401 },
      );
    }
    return NextResponse.next();
  }

  // Halaman login: sudah punya sesi → langsung ke dashboard.
  if (pathname === "/login") {
    if (hasSessionCookie) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Aset yang dihasilkan Next.js dan bersifat publik (robots.txt untuk
  // crawler, sitemap.xml, dan OG image untuk preview social media) tetap
  // bisa diakses tanpa sesi.
  if (
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/opengraph-image")
  ) {
    return NextResponse.next();
  }

  // Halaman admin lainnya: wajib punya cookie sesi.
  if (!hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Jalankan proxy untuk semua path KECUALI aset statis:
     * _next/static, _next/image, file publik (favicon, ikon, gambar, svg).
     */
    "/((?!_next/static|_next/image|favicon.ico|ios|android|images|references|file.svg|globe.svg|next.svg|vercel.svg|window.svg|logo.png|logo.jpg).*)",
  ],
};
