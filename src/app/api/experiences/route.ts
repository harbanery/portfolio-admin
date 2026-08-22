import prisma from "@/server/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const experiences = await prisma.experience.findMany({
      orderBy: { start_date: "desc" },
    });
    return NextResponse.json({ success: true, data: experiences });
  } catch (error) {
    console.error("Error fetching experiences:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch experiences" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const experience = await prisma.experience.create({
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
        status: "ACTIVE",
      },
    });
    return NextResponse.json({ success: true, data: experience }, { status: 201 });
  } catch (error) {
    console.error("Error creating experience:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create experience" },
      { status: 500 },
    );
  }
}
