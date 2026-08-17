import prisma from "@/server/db";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
  try {
    const { id } = await params;
    const body = await request.json();
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
      },
    });
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
  try {
    const { id } = await params;
    await prisma.portfolio.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
