import prisma from "@/server/db";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const education = await prisma.education.findUnique({
      where: { id: Number(id) },
    });
    if (!education) {
      return NextResponse.json(
        { success: false, error: "Education not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: education });
  } catch (error) {
    console.error("Error fetching education:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch education" },
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
    const education = await prisma.education.update({
      where: { id: Number(id) },
      data: {
        education_type: body.educationType === "NONFORMAL" ? "NONFORMAL" : "FORMAL",
        school: body.school,
        degree: body.degree || null,
        field: body.field,
        start_date: new Date(body.startDate),
        end_date: body.endDate ? new Date(body.endDate) : null,
        grade: body.grade,
        description: body.description,
      },
    });
    return NextResponse.json({ success: true, data: education });
  } catch (error) {
    console.error("Error updating education:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update education" },
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
    const education = await prisma.education.update({
      where: { id: Number(id) },
      data: { status: body.status },
    });
    return NextResponse.json({ success: true, data: education });
  } catch (error) {
    console.error("Error toggling education status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle education status" },
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
    await prisma.education.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting education:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete education" },
      { status: 500 },
    );
  }
}
