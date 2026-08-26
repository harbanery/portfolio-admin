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
    const experience = await prisma.experience.findUnique({ where: { id: Number(id) } });
    if (!experience) {
      return NextResponse.json(
        { success: false, error: "Experience not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: experience });
  } catch (error) {
    console.error("Error fetching experience:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch experience" },
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

    // Rekaman lama untuk membersihkan aset Cloudinary yang dibuang.
    const existing = await prisma.experience.findUnique({
      where: { id: Number(id) },
    });

    const experience = await prisma.experience.update({
      where: { id: Number(id) },
      data: {
        job_title: body.jobTitle,
        company_name: body.companyName,
        employment_type: body.employmentType || "FULL_TIME",
        description: body.description,
        skills: body.skills || [],
        images: body.images || [],
        start_date: new Date(body.startDate),
        end_date: body.endDate ? new Date(body.endDate) : null,
        is_present: body.isPresent ?? false,
      },
    });

    // Hapus aset gambar lama yang tidak ada lagi setelah update.
    if (existing) {
      const kept = new Set((body.images || []) as string[]);
      const removed = (existing.images ?? []).filter(
        (url) => url && !kept.has(url),
      );
      if (removed.length > 0) {
        await deleteCloudinaryUrls(removed);
      }
    }

    return NextResponse.json({ success: true, data: experience });
  } catch (error) {
    console.error("Error updating experience:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update experience" },
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
    const experience = await prisma.experience.update({
      where: { id: Number(id) },
      data: { status: body.status },
    });
    return NextResponse.json({ success: true, data: experience });
  } catch (error) {
    console.error("Error toggling experience status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle experience status" },
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
    const experience = await prisma.experience.findUnique({
      where: { id: Number(id) },
    });
    await prisma.experience.delete({ where: { id: Number(id) } });

    // Hapus juga aset gambar terkait di Cloudinary (hindari aset yatim).
    if (experience) {
      await deleteCloudinaryUrls(experience.images ?? []);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting experience:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete experience" },
      { status: 500 },
    );
  }
}
