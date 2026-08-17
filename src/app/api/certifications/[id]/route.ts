import prisma from "@/server/db";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
  try {
    const { id } = await params;
    const body = await request.json();
    const certification = await prisma.certification.update({
      where: { id: Number(id) },
      data: {
        title: body.title,
        issuer: body.issuer,
        issue_date: new Date(body.issueDate),
        expiry_date: body.expiryDate ? new Date(body.expiryDate) : null,
        credential_id: body.credentialId,
        credential_url: body.credentialUrl,
        ...(body.image !== undefined && { image: body.image }),
        skills: body.skills || [],
      },
    });
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
  try {
    const { id } = await params;
    await prisma.certification.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting certification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete certification" },
      { status: 500 },
    );
  }
}
