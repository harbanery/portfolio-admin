import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";

/**
 * Proxy delivery file Cloudinary.
 *
 * Cloudinary memblokir delivery PDF/ZIP (401 "deny or ACL failure") saat
 * setting "Allow delivery of PDF and ZIP files" nonaktif. Proxy ini
 * mengambil aset dari sisi server (yang memiliki akses API) lalu
 * menyajikannya ke browser dengan header yang benar, sehingga PDF
 * tetap bisa dibuka/diunduh tanpa mengubah setting akun Cloudinary.
 *
 * Query params:
 * - url (wajib): URL aset Cloudinary res.cloudinary.com
 * - download (opsional): "1" untuk memaksa unduhan (Content-Disposition
 *   attachment) dengan nama file dari param `name` atau path URL.
 */

const CLOUDINARY_HOST = "res.cloudinary.com";

/** Ambil nama file dari URL untuk Content-Disposition. */
function filenameFromUrl(url: URL): string {
  const last = url.pathname.split("/").pop() ?? "file";
  // Hilangkan prefix timestamp yang ditambahkan saat upload.
  const cleaned = last.replace(/^\d+-/, "");
  return cleaned || "file";
}

/** Sanitasi nama file untuk header Content-Disposition. */
function sanitizeFilename(name: string): string {
  const ascii = name.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_");
  return ascii.length > 0 ? ascii : "file";
}

export async function GET(request: NextRequest) {
  if (!(await requireAuth())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url");
  const forceDownload = searchParams.get("download") === "1";
  const nameParam = searchParams.get("name");

  if (!target) {
    return NextResponse.json(
      { success: false, error: "Missing url parameter" },
      { status: 400 },
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid url parameter" },
      { status: 400 },
    );
  }

  // Hanya izinkan URL Cloudinary milik akun ini (cegah SSRF ke host lain).
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (
    parsed.protocol !== "https:" ||
    parsed.hostname !== CLOUDINARY_HOST ||
    (cloudName && !parsed.pathname.includes(`/${cloudName}/`))
  ) {
    return NextResponse.json(
      { success: false, error: "Url is not allowed" },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(parsed.toString(), { cache: "no-store" });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch file" },
        { status: 502 },
      );
    }

    // Baca buffer untuk inspeksi magic bytes (perlu untuk menyajikan
    // PDF yang disimpan dengan ekstensi .docx sebagai PDF yang benar).
    const buffer = Buffer.from(await upstream.arrayBuffer());

    // Deteksi PDF dari magic bytes "%PDF-" walau ekstensi tersamarkan.
    const isPdf =
      buffer.length >= 5 &&
      buffer.subarray(0, 5).equals(Buffer.from("%PDF-", "ascii"));

    let filename = sanitizeFilename(nameParam ?? filenameFromUrl(parsed));
    let contentType = upstream.headers.get("content-type");

    if (isPdf) {
      if (!filename.toLowerCase().endsWith(".pdf")) {
        filename = `${filename.replace(/\.[^.]+$/, "")}.pdf`;
      }
      contentType = "application/pdf";
    }

    const headers = new Headers();
    headers.set("Content-Type", contentType ?? "application/octet-stream");
    headers.set("Content-Length", String(buffer.length));
    headers.set("Cache-Control", "private, max-age=300");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set(
      "Content-Disposition",
      `${forceDownload ? "attachment" : "inline"}; filename="${filename}"`,
    );

    return new NextResponse(buffer, { status: 200, headers });
  } catch (error) {
    console.error("Error proxying file:", error);
    return NextResponse.json(
      { success: false, error: "Failed to proxy file" },
      { status: 502 },
    );
  }
}
