import prisma from "@/server/db";
import { requireAuth } from "@/server/auth";
import { NextResponse } from "next/server";

export async function GET() {
  if (!(await requireAuth())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  try {
    const certifications = await prisma.certification.findMany({
      orderBy: { issue_date: "desc" },
    });
    return NextResponse.json({ success: true, data: certifications });
  } catch (error) {
    console.error("Error fetching certifications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch certifications" },
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
    const certification = await prisma.certification.create({
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
        status: "ACTIVE",
      },
    });
    return NextResponse.json({ success: true, data: certification }, { status: 201 });
  } catch (error) {
    console.error("Error creating certification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create certification" },
      { status: 500 },
    );
  }
}
