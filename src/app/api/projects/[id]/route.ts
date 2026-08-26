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
    const project = await prisma.portfolio.findUnique({ where: { id: Number(id) } });
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch project" },
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

    // Rekaman lama dipakai untuk membersihkan aset Cloudinary yang
    // tidak direferensikan lagi setelah update (diganti/dibuang).
    const existing = await prisma.portfolio.findUnique({
      where: { id: Number(id) },
    });

    const project = await prisma.portfolio.update({
      where: { id: Number(id) },
      data: {
        title: body.title,
        subtitle: body.subtitle,
        project_type: body.projectType || "personal",
        client_name: body.clientName,
        company_name: body.companyName,
        role: body.role,
        ...(body.image && { image: body.image }),
        ...(body.images && { images: body.images }),
        description: body.description,
        api_documentation: body.apiDocumentation,
        features: body.features || [],
        highlights: body.highlights || [],
        challenges: body.challenges,
        solutions: body.solutions,
        story: body.story,
        outcomes: body.outcomes || [],
        skills: body.skills,
        repo_links: body.repoLinks || [],
        web_link: body.webLink,
        start_date: body.startDate ? new Date(body.startDate) : null,
        is_ongoing: body.isOngoing ?? true,
        end_date: body.isOngoing === false && body.endDate ? new Date(body.endDate) : null,
      },
    });

    // Hapus aset Cloudinary lama yang hilang setelah update
    // (mirror semantik update: field kosong mempertahankan nilai lama).
    if (existing) {
      const finalImage = body.image || existing.image;
      const finalImages = body.images || existing.images;
      const kept = new Set(
        [finalImage, ...finalImages].filter(Boolean) as string[],
      );
      const removed = [existing.image, ...(existing.images ?? [])].filter(
        (url) => url && !kept.has(url),
      );
      if (removed.length > 0) {
        await deleteCloudinaryUrls(removed);
      }
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update project" },
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
    const project = await prisma.portfolio.update({
      where: { id: Number(id) },
      data: { status: body.status },
    });
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error("Error toggling project status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle project status" },
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
    const project = await prisma.portfolio.findUnique({
      where: { id: Number(id) },
    });
    await prisma.portfolio.delete({ where: { id: Number(id) } });

    // Hapus juga aset gambar terkait di Cloudinary agar tidak menjadi
    // aset yatim (orphan) setelah record dihapus.
    if (project) {
      await deleteCloudinaryUrls([project.image, ...(project.images ?? [])]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
