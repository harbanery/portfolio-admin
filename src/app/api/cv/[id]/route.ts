import prisma from "@/server/db";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const cv = await prisma.cv.findUnique({ where: { id: Number(id) } });
    if (!cv) {
      return NextResponse.json(
        { success: false, error: "CV not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: cv });
  } catch (error) {
    console.error("Error fetching cv:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cv" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    // Jika ditandai primary, matikan flag primary CV lain.
    if (body.isPrimary) {
      await prisma.cv.updateMany({ data: { is_primary: false } });
    }
    const cv = await prisma.cv.update({
      where: { id: Number(id) },
      data: {
        name: body.name,
        file_type: body.fileType ?? "URL",
        file_url: body.fileUrl ?? "",
        file_storage_path: body.fileStoragePath ?? null,
        description: body.description,
        is_primary: body.isPrimary ?? false,
      },
    });
    return NextResponse.json({ success: true, data: cv });
  } catch (error) {
    console.error("Error updating cv:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update cv" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (body.status) {
      const cv = await prisma.cv.update({
        where: { id: Number(id) },
        data: { status: body.status },
      });
      return NextResponse.json({ success: true, data: cv });
    }
    if (body.isPrimary) {
      await prisma.cv.updateMany({ data: { is_primary: false } });
      const cv = await prisma.cv.update({
        where: { id: Number(id) },
        data: { is_primary: true },
      });
      return NextResponse.json({ success: true, data: cv });
    }
    return NextResponse.json(
      { success: false, error: "Nothing to update" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error toggling cv:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle cv" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.cv.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting cv:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete cv" },
      { status: 500 },
    );
  }
}
