"use client";

import { Analytics } from "@vercel/analytics/next";

/**
 * Vercel Analytics.
 *
 * Filter lama memeriksa path "/admin" yang tidak pernah cocok karena
 * rute admin ada di root (/, /projects, /personal, dst.), sehingga
 * semua halaman privat ikut terlacak. Aplikasi ini adalah admin panel
 * privat: satu-satunya halaman publik adalah /login, jadi hanya halaman
 * itu yang dilacak. Path /api dan halaman admin lainnya diabaikan
 * (jangan kotori data Analytics dengan kunjungan sendiri).
 */
export default function CustomAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => {
        if (event.url.startsWith("/api/")) return null;
        if (!event.url.startsWith("/login")) return null;
        return event;
      }}
    />
  );
}
