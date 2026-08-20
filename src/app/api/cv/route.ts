import prisma from "@/server/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cvs = await prisma.cv.findMany({
      orderBy: [{ is_primary: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ success: true, data: cvs });
  } catch (error) {
    console.error("Error fetching cvs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cvs" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Jika CV baru ditandai primary, matikan flag primary CV lain.
    if (body.isPrimary) {
      await prisma.cv.updateMany({ data: { is_primary: false } });
    }
    const cv = await prisma.cv.create({
      data: {
        name: body.name,
        file_type: body.fileType ?? "URL",
        file_url: body.fileUrl ?? "",
        file_storage_path: body.fileStoragePath ?? null,
        description: body.description,
        is_primary: body.isPrimary ?? false,
        status: "ACTIVE",
      },
    });
    return NextResponse.json({ success: true, data: cv }, { status: 201 });
  } catch (error) {
    console.error("Error creating cv:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create cv" },
      { status: 500 },
    );
  }
}
