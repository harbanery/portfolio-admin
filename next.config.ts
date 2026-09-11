import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * Content-Security-Policy untuk aplikasi admin.
 * - 'unsafe-inline' pada script/style diperlukan karena Next.js menyuntik
 *   inline script bootstrap dan AntD menghasilkan style inline (cssinjs).
 * - Gambar hanya dari origin sendiri, data/blob URL (preview upload),
 *   dan Cloudinary (aset yang diunggah).
 * - connect-src mencakup API Cloudinary untuk upload sisi server dan
 *   endpoint telemetri Vercel (Analytics/Speed Insights).
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'" + (isProd ? "" : " 'unsafe-eval'"),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "font-src 'self' data:",
  "connect-src 'self' https://api.cloudinary.com https://*.vercel-scripts.com https://*.vercel-insights.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  images: {
    // next/image untuk aset Cloudinary (delivery res.cloudinary.com).
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        // Security headers global.
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          { key: "Content-Security-Policy", value: csp },
          ...(isProd
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
      {
        // Respons API bersifat pribadi (berbasis sesi): jangan pernah
        // di-cache oleh browser/intermediary proxy.
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
      },
      {
        // Aset statis publik (ikon, gambar referensi) boleh di-cache
        // singkat lalu divalidasi ulang (stale-while-revalidate).
        source: "/:folder(images|ios|android|references)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
