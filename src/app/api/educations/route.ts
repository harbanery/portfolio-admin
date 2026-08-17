import prisma from "@/server/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const educations = await prisma.education.findMany({
      orderBy: { start_date: "desc" },
    });
    return NextResponse.json({ success: true, data: educations });
  } catch (error) {
    console.error("Error fetching educations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch educations" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const education = await prisma.education.create({
      data: {
        school: body.school,
        degree: body.degree,
        field: body.field,
        start_date: new Date(body.startDate),
        end_date: body.endDate ? new Date(body.endDate) : null,
        grade: body.grade,
        description: body.description,
        status: "ACTIVE",
      },
    });
    return NextResponse.json({ success: true, data: education }, { status: 201 });
  } catch (error) {
    console.error("Error creating education:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create education" },
      { status: 500 },
    );
  }
}
