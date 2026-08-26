import prisma from "@/server/db";
import { requireAuth } from "@/server/auth";
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
    const publication = await prisma.publication.findUnique({
      where: { id: Number(id) },
    });
    if (!publication) {
      return NextResponse.json(
        { success: false, error: "Publication not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: publication });
  } catch (error) {
    console.error("Error fetching publication:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch publication" },
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
    const publishDate = body.publishDate ? new Date(body.publishDate) : null;
    if (!publishDate || Number.isNaN(publishDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid publishDate" },
        { status: 400 },
      );
    }
    const publication = await prisma.publication.update({
      where: { id: Number(id) },
      data: {
        title: body.title,
        authors: body.authors || [],
        publication_type: body.publicationType ?? "JOURNAL",
        publisher: body.publisher,
        journal_name: body.journalName,
        volume: body.volume,
        issue: body.issue,
        pages: body.pages,
        doi: body.doi,
        url: body.url,
        pdf_url: body.pdfUrl,
        scholar_url: body.scholarUrl,
        abstract: body.abstract,
        publish_date: publishDate,
        citations: body.citations ?? 0,
        skills: body.skills || [],
      },
    });
    return NextResponse.json({ success: true, data: publication });
  } catch (error) {
    console.error("Error updating publication:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update publication" },
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
    const publication = await prisma.publication.update({
      where: { id: Number(id) },
      data: { status: body.status },
    });
    return NextResponse.json({ success: true, data: publication });
  } catch (error) {
    console.error("Error toggling publication status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle publication status" },
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
    await prisma.publication.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting publication:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete publication" },
      { status: 500 },
    );
  }
}
