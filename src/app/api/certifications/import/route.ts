import prisma from "@/server/db";
import { NextResponse } from "next/server";

/** Konversi nilai XLS (unknown) ke tipe yang dibutuhkan Prisma. */
const asString = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;

const asDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
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

/**
 * Import massal certifications dari file XLS/XLSX/CSV.
 * Menerima array item dan membuat banyak record sekaligus.
 */
export async function POST(request: Request) {
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
        issue_date: asDate(item.issueDate) ?? new Date(),
        expiry_date: asDate(item.expiryDate),
        credential_id: asString(item.credentialId),
        credential_url: asString(item.credentialUrl),
        file_type: (asString(item.fileType) ?? "NONE").toUpperCase() as
          | "NONE"
          | "URL"
          | "UPLOAD",
        file_url: asString(item.fileUrl),
        image: asString(item.image),
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
