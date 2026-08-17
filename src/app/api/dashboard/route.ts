import prisma from "@/server/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [
      personal,
      totalProjects,
      activeProjects,
      totalExperiences,
      activeExperiences,
      totalCertifications,
      totalEducations,
      totalCvs,
      recentProjects,
    ] = await Promise.all([
      prisma.personal.findFirst(),
      prisma.portfolio.count(),
      prisma.portfolio.count({ where: { status: "ACTIVE" } }),
      prisma.experience.count(),
      prisma.experience.count({ where: { status: "ACTIVE" } }),
      prisma.certification.count(),
      prisma.education.count(),
      prisma.cv.count(),
      prisma.portfolio.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          role: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    // Distribusi status project (untuk pie chart).
    const [activeCount, inactiveCount] = await Promise.all([
      prisma.portfolio.count({ where: { status: "ACTIVE" } }),
      prisma.portfolio.count({ where: { status: "NONACTIVE" } }),
    ]);

    // Aktivitas project 6 bulan terakhir (untuk bar chart).
    const now = new Date();
    const monthlyData: Array<{ month: string; count: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = await prisma.portfolio.count({
        where: { createdAt: { gte: start, lt: end } },
      });
      monthlyData.push({
        month: start.toLocaleDateString("en-US", { month: "short" }),
        count,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          personalCount: personal ? 1 : 0,
          totalProjectsCount: totalProjects,
          activeProjectsCount: activeProjects,
          totalExperiencesCount: totalExperiences,
          activeExperiencesCount: activeExperiences,
          totalCertificationsCount: totalCertifications,
          totalEducationsCount: totalEducations,
          totalCvsCount: totalCvs,
        },
        analytics: {
          statusDistribution: {
            ACTIVE: activeCount,
            NONACTIVE: inactiveCount,
          },
          monthlyData,
        },
        recentProjects,
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
