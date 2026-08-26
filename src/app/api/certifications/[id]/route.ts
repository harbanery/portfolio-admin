import prisma from "@/server/db";
import { requireAuth } from "@/server/auth";
import { deleteCloudinaryUrls } from "@/server/cloudinary";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAuth())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  try {
    const { id } = await params;
    const certification = await prisma.certification.findUnique({
      where: { id: Number(id) },
    });
    if (!certification) {
      return NextResponse.json(
        { success: false, error: "Certification not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: certification });
  } catch (error) {
    console.error("Error fetching certification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch certification" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAuth())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  try {
    const { id } = await params;
    const body = await request.json();

    // Rekaman lama untuk membersihkan file Cloudinary yang diganti.
    const existing = await prisma.certification.findUnique({
      where: { id: Number(id) },
    });

    const certification = await prisma.certification.update({
      where: { id: Number(id) },
      data: {
        title: body.title,
        issuer: body.issuer,
        category: body.category || "CERTIFICATION",
        issue_date: new Date(body.issueDate),
        expiry_date: body.expiryDate ? new Date(body.expiryDate) : null,
        credential_id: body.credentialId,
        credential_url: body.credentialUrl,
        file_url: body.fileUrl,
        file_path: body.filePath,
        skills: body.skills || [],
      },
    });

    // Hapus file lama di Cloudinary bila diganti dengan file lain.
    if (existing?.file_url && existing.file_url !== certification.file_url) {
      await deleteCloudinaryUrls([existing.file_url]);
    }

    return NextResponse.json({ success: true, data: certification });
  } catch (error) {
    console.error("Error updating certification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update certification" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAuth())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  try {
    const { id } = await params;
    const body = await request.json();
    const certification = await prisma.certification.update({
      where: { id: Number(id) },
      data: { status: body.status },
    });
    return NextResponse.json({ success: true, data: certification });
  } catch (error) {
    console.error("Error toggling certification status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle certification status" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAuth())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  try {
    const { id } = await params;
    const certification = await prisma.certification.findUnique({
      where: { id: Number(id) },
    });
    await prisma.certification.delete({ where: { id: Number(id) } });

    // Hapus juga file terkait di Cloudinary (hindari aset yatim).
    if (certification?.file_url) {
      await deleteCloudinaryUrls([certification.file_url]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting certification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete certification" },
      { status: 500 },
    );
  }
}
