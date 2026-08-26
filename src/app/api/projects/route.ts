import prisma from "@/server/db";
import { requireAuth } from "@/server/auth";
import { NextResponse } from "next/server";

export type ProjectStatus = "ACTIVE" | "NONACTIVE";

export async function GET() {
  if (!(await requireAuth())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  try {
    const projects = await prisma.portfolio.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}

/** Reorder batch: terima array of { id, order } lalu update satu per satu. */
export async function PUT(request: Request) {
  if (!(await requireAuth())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  try {
    const body = await request.json();
    const items: Array<{ id: number; order: number }> = body.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "No items to reorder" },
        { status: 400 },
      );
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.portfolio.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering projects:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reorder projects" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await requireAuth())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  try {
    const body = await request.json();
    const project = await prisma.portfolio.create({
      data: {
        title: body.title,
        subtitle: body.subtitle,
        project_type: body.projectType || "personal",
        client_name: body.clientName,
        company_name: body.companyName,
        role: body.role,
        image: body.image || "",
        images: body.images || [],
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
        status: "ACTIVE",
      },
    });
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create project" },
      { status: 500 },
    );
  }
}
