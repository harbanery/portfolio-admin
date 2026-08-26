import prisma from "@/server/db";
import { requireAuth } from "@/server/auth";
import { NextResponse } from "next/server";

/** Konversi nilai XLS (unknown) ke tipe yang dibutuhkan Prisma. */
const asString = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

/**
 * Konversi nilai XLS ke Date, dengan validasi rentang tahun.
 * Mencegah nilai absurd seperti tahun +044834 yang ditolak Prisma.
 */
const asDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) {
    const y = value.getUTCFullYear();
    if (y < 1900 || y > 2100) return null;
    return value;
  }
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    const y = date.getUTCFullYear();
    return Number.isNaN(date.getTime()) || y < 1900 || y > 2100
      ? null
      : date;
  }
  return null;
};

const asSkills = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

const CERTIFICATION_CATEGORIES = [
  "CERTIFICATION",
  "COMPETENCY",
  "ACADEMIC",
  "TRAINING",
] as const;

type CertificationCategory =
  (typeof CERTIFICATION_CATEGORIES)[number];

/** Normalisasi kategori dari XLS; fallback ke CERTIFICATION jika tidak valid. */
const asCategory = (value: unknown): CertificationCategory => {
  const raw = typeof value === "string" ? value.trim().toUpperCase() : "";
  return (CERTIFICATION_CATEGORIES as readonly string[]).includes(raw)
    ? (raw as CertificationCategory)
    : "CERTIFICATION";
};

/**
 * Import massal certifications dari file XLS/XLSX/CSV.
 * Menerima array item dan membuat banyak record sekaligus.
 */
export async function POST(request: Request) {
  if (!(await requireAuth())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  try {
    const body = await request.json();
    const items: Array<Record<string, unknown>> = Array.isArray(body.items)
      ? body.items
      : [];

    if (!items.length) {
      return NextResponse.json(
        { success: false, error: "No items to import" },
        { status: 400 },
      );
    }

    // Validasi field wajib sebelum insert.
    const invalidRows = items
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => !item.title || !item.issuer);
    if (invalidRows.length) {
      return NextResponse.json(
        {
          success: false,
          error: `Row(s) ${invalidRows
            .map(({ idx }) => idx + 2)
            .join(", ")} missing required fields (title, issuer)`,
        },
        { status: 400 },
      );
    }

    const result = await prisma.certification.createMany({
      data: items.map((item) => ({
        title: String(item.title),
        issuer: String(item.issuer),
        category: asCategory(item.category),
        issue_date: asDate(item.issueDate) ?? new Date(),
        expiry_date: asDate(item.expiryDate),
        credential_id: asString(item.credentialId),
        credential_url: asString(item.credentialUrl),
        skills: asSkills(item.skills),
        status: "ACTIVE",
      })),
    });

    return NextResponse.json(
      { success: true, data: { count: result.count } },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error importing certifications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to import certifications" },
      { status: 500 },
    );
  }
}
