import crypto from "node:crypto";

/**
 * Helper Cloudinary sisi server: signature API, penghapusan aset
 * (image/raw), dan konversi URL delivery menjadi public_id.
 *
 * Dipakai oleh route /api/upload dan route CRUD untuk menghapus aset
 * lama di Cloudinary saat file dihapus atau diganti.
 */

const CLOUDINARY_HOST = "res.cloudinary.com";

/** Root folder aset aplikasi ini di Cloudinary. */
export const UPLOAD_ROOT_FOLDER = "admin-portfolio";

/** Pola nama subfolder menu (huruf kecil, angka, strip). */
const FOLDER_PATTERN = /^[a-z0-9][a-z0-9-]{0,49}$/;

/**
 * Validasi subfolder menu dan gabungkan dengan root folder, mis.
 * "projects" → "admin-portfolio/projects". Mengembalikan null bila
 * nama subfolder tidak valid.
 */
export function resolveUploadFolder(folder: string | null): string | null {
  if (!folder || !FOLDER_PATTERN.test(folder)) return null;
  return `${UPLOAD_ROOT_FOLDER}/${folder}`;
}

/** Signature parameter Cloudinary (sha1 dari params terurut + api secret). */
export function signCloudinaryParams(
  params: Record<string, string | number>,
  apiSecret: string,
): string {
  const sortedParams = Object.keys(params)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return crypto
    .createHash("sha1")
    .update(sortedParams + apiSecret)
    .digest("hex");
}

/** Panggil endpoint destroy Cloudinary untuk satu resource type. */
async function destroyResource(
  publicId: string,
  resourceType: "image" | "raw",
): Promise<Response> {
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { timestamp, public_id: publicId };
  const signature = signCloudinaryParams(
    params,
    process.env.CLOUDINARY_API_SECRET || "",
  );

  return fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/destroy`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        public_id: publicId,
        api_key: process.env.CLOUDINARY_API_KEY,
        timestamp,
        signature,
      }),
    },
  );
}

/**
 * Hapus satu aset dari Cloudinary. Mencoba sebagai image terlebih dahulu;
 * bila gagal, dicoba ulang sebagai raw (file dokumen seperti PDF/DOCX).
 * Tidak melempar error — gagal hanya dicatat ke log.
 */
export async function destroyCloudinaryAsset(publicId: string): Promise<boolean> {
  try {
    let response = await destroyResource(publicId, "image");
    if (!response.ok) {
      response = await destroyResource(publicId, "raw");
    }
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error(
        `[cloudinary] gagal menghapus aset "${publicId}":`,
        errorData?.error?.message ?? response.status,
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[cloudinary] error menghapus aset "${publicId}":`, error);
    return false;
  }
}

/**
 * Ekstrak public_id dari URL delivery Cloudinary milik akun ini, mis.
 * https://res.cloudinary.com/<cloud>/image/upload/v123/admin-portfolio/a.jpg
 * → "admin-portfolio/a.jpg". Mengembalikan null untuk URL non-Cloudinary
 * (aset eksternal tidak pernah dihapus).
 */
export function publicIdFromUrl(rawUrl: string): string | null {
  if (!rawUrl) return null;

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }
  if (parsed.hostname !== CLOUDINARY_HOST) return null;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (cloudName && !parsed.pathname.includes(`/${cloudName}/`)) return null;

  const segments = parsed.pathname.split("/").filter(Boolean);
  const uploadIdx = segments.indexOf("upload");
  if (uploadIdx === -1) return null;

  let rest = segments.slice(uploadIdx + 1);
  // Buang segment versi (mis. "v1720000000") bila ada.
  if (/^v\d+$/.test(rest[0] ?? "")) rest = rest.slice(1);
  if (rest.length === 0) return null;

  return rest.join("/");
}

/**
 * Hapus beberapa aset Cloudinary sekaligus dari daftar URL (best-effort).
 * URL kosong/null atau URL eksternal otomatis dilewati. Dipakai route CRUD
 * untuk membersihkan aset lama saat record dihapus atau gambarnya diganti.
 */
export async function deleteCloudinaryUrls(
  urls: Array<string | null | undefined>,
): Promise<void> {
  const publicIds = new Set<string>();
  for (const url of urls) {
    if (!url) continue;
    const publicId = publicIdFromUrl(url);
    if (publicId) publicIds.add(publicId);
  }
  for (const publicId of publicIds) {
    await destroyCloudinaryAsset(publicId);
  }
}
