/**
 * Validasi file upload sisi server (batas ukuran + whitelist tipe).
 *
 * Client (antd Upload `beforeUpload`) sudah memeriksa batas yang sama,
 * tetapi validasi server wajib karena request bisa dibuat langsung
 * tanpa melalui UI. Pesan error tidak membocorkan detail internal.
 */

/** Batas ukuran gambar (byte) — 2 MB, konsisten dengan teks UI. */
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

/** Batas ukuran dokumen (byte) — 10 MB, konsisten dengan teks UI. */
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

/** Tipe MIME gambar yang diizinkan (SVG sengaja tidak: risiko XSS). */
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/** Tipe MIME dokumen yang diizinkan (PDF dan Microsoft Word). */
const ALLOWED_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

/** Ekstensi file yang diizinkan (nama file divalidasi terpisah dari MIME). */
const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const ALLOWED_DOCUMENT_EXTENSIONS = [".pdf", ".doc", ".docx"];

export type UploadKind = "image" | "document";

export interface UploadValidation {
  ok: boolean;
  kind: UploadKind;
  /** Kode error singkat yang aman untuk client (mis. "TOO_LARGE"). */
  code?: string;
}

function hasExtension(name: string, extensions: string[]): boolean {
  const lower = name.toLowerCase();
  return extensions.some((ext) => lower.endsWith(ext));
}

/**
 * Validasi satu file upload: tipe MIME + ekstensi nama file + ukuran.
 * MIME image/* di luar whitelist (mis. image/svg+xml) ditolak; dokumen
 * hanya boleh PDF/DOC/DOCX. MIME dan ekstensi harus konsisten.
 */
export function validateUploadFile(file: File): UploadValidation {
  const name = file.name || "";
  const type = (file.type || "").toLowerCase();

  const isImage = type.startsWith("image/");
  if (isImage && !ALLOWED_IMAGE_TYPES.has(type)) {
    return { ok: false, kind: "image", code: "INVALID_TYPE" };
  }
  if (!isImage && !ALLOWED_DOCUMENT_TYPES.has(type)) {
    return { ok: false, kind: "document", code: "INVALID_TYPE" };
  }

  const kind: UploadKind = isImage ? "image" : "document";
  const allowedExtensions =
    kind === "image" ? ALLOWED_IMAGE_EXTENSIONS : ALLOWED_DOCUMENT_EXTENSIONS;
  if (!hasExtension(name, allowedExtensions)) {
    return { ok: false, kind, code: "INVALID_EXTENSION" };
  }

  const maxSize = kind === "image" ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE;
  if (file.size <= 0 || file.size > maxSize) {
    return { ok: false, kind, code: "TOO_LARGE" };
  }

  return { ok: true, kind };
}
