import { ImageResponse } from "next/og";
import {
  META_TITLE,
  META_DESCRIPTION,
  BASE_URL,
} from "@/config/variables";

/**
 * OG image dinamis (file convention Next.js).
 *
 * Menghasilkan gambar 1200x630 saat build (statis, otomatis di-cache)
 * dengan judul + deskripsi dari environment variable. Tag <meta> og:image
 * ditambahkan otomatis oleh Next.js — tidak perlu deklarasi manual di
 * metadata layout.
 */

export const alt = META_TITLE ?? "Admin Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const title = META_TITLE ?? "Admin Portfolio";
  const description = META_DESCRIPTION ?? "";
  const host = (() => {
    try {
      return new URL(BASE_URL).host;
    } catch {
      return "localhost";
    }
  })();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a3e 60%, #2b2b6b 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            color: "#a5b4fc",
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 8,
              background: "#6366f1",
              display: "flex",
            }}
          />
          {host}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.15,
              display: "flex",
            }}
          >
            {title}
          </div>
          {description ? (
            <div
              style={{
                fontSize: 32,
                lineHeight: 1.4,
                color: "#c7d2fe",
                display: "flex",
              }}
            >
              {description}
            </div>
          ) : null}
        </div>

        <div style={{ fontSize: 24, color: "#818cf8", display: "flex" }}>
          Admin Portfolio
        </div>
      </div>
    ),
    { ...size },
  );
}
