import prisma from "@/server/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const publications = await prisma.publication.findMany({
      orderBy: { publish_date: "desc" },
    });
    return NextResponse.json({ success: true, data: publications });
  } catch (error) {
    console.error("Error fetching publications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch publications" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const publishDate = body.publishDate ? new Date(body.publishDate) : null;
    if (!publishDate || Number.isNaN(publishDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid publishDate" },
        { status: 400 },
      );
    }
    const publication = await prisma.publication.create({
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
        status: "ACTIVE",
      },
    });
    return NextResponse.json(
      { success: true, data: publication },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating publication:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create publication" },
      { status: 500 },
    );
  }
}
