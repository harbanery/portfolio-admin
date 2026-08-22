import prisma from "@/server/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Summary card dashboard: hanya jumlah data berstatus ACTIVE.
    const [
      activeProjects,
      activeExperiences,
      activeCertifications,
      activeEducations,
      activePublications,
      activeCvs,
    ] = await Promise.all([
      prisma.portfolio.count({ where: { status: "ACTIVE" } }),
      prisma.experience.count({ where: { status: "ACTIVE" } }),
      prisma.certification.count({ where: { status: "ACTIVE" } }),
      prisma.education.count({ where: { status: "ACTIVE" } }),
      prisma.publication.count({ where: { status: "ACTIVE" } }),
      prisma.cv.count({ where: { status: "ACTIVE" } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          activeProjectsCount: activeProjects,
          activeExperiencesCount: activeExperiences,
          activeCertificationsCount: activeCertifications,
          activeEducationsCount: activeEducations,
          activePublicationsCount: activePublications,
          activeCvsCount: activeCvs,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
