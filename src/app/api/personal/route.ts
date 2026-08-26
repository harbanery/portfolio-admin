import prisma from "@/server/db";
import { requireAuth } from "@/server/auth";
import { deleteCloudinaryUrls } from "@/server/cloudinary";
import { NextResponse } from "next/server";

export async function GET() {
  if (!(await requireAuth())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  try {
    const personal = await prisma.personal.findFirst({
      include: { PersonalImage: { orderBy: { order: "asc" } } },
    });
    return NextResponse.json({ success: true, data: personal });
  } catch (error) {
    console.error("Error fetching personal:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch personal data" },
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

    const data = {
      name: body.name,
      about: body.about,
      availability: body.availability || "AVAILABLE",
      open_to: body.openTo || [],
      skills: body.skills || [],
      priority_skills: body.prioritySkills || [],
      languages: body.languages ?? undefined,
      contacts: body.contacts ?? undefined,
    };

    const imageUrls: string[] = Array.isArray(body.imageUrls)
      ? body.imageUrls
      : [];

    const existing = await prisma.personal.findFirst();

    if (existing) {
      const updated = await prisma.personal.update({
        where: { id: existing.id },
        data,
        include: { PersonalImage: { orderBy: { order: "asc" } } },
      });

      // Sinkronisasi gambar: hapus yang tidak ada lagi, tambah yang baru.
      const removedImages = updated.PersonalImage.filter(
        (img) => !imageUrls.includes(img.url),
      );
      await prisma.personalImage.deleteMany({
        where: {
          personalId: updated.id,
          url: { notIn: imageUrls },
        },
      });

      // Hapus juga aset gambar yang dibuang dari Cloudinary
      // (hindari aset yatim setelah dihapus dari profil).
      if (removedImages.length > 0) {
        await deleteCloudinaryUrls(removedImages.map((img) => img.url));
      }
      const existingUrls = updated.PersonalImage.map((img) => img.url);
      const newUrls = imageUrls.filter((url) => !existingUrls.includes(url));
      if (newUrls.length > 0) {
        await prisma.personalImage.createMany({
          data: newUrls.map((url, idx) => ({
            personalId: updated.id,
            url,
            storagePath: url,
            mimeType: "image/*",
            size: 0,
            order: existingUrls.length + idx,
          })),
        });
      }

      const result = await prisma.personal.findUnique({
        where: { id: updated.id },
        include: { PersonalImage: { orderBy: { order: "asc" } } },
      });
      return NextResponse.json({ success: true, data: result });
    }

    const created = await prisma.personal.create({
      data: {
        ...data,
        PersonalImage: {
          create: imageUrls.map((url, idx) => ({
            url,
            storagePath: url,
            mimeType: "image/*",
            size: 0,
            order: idx,
          })),
        },
      },
      include: { PersonalImage: { orderBy: { order: "asc" } } },
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("Error saving personal:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save personal data" },
      { status: 500 },
    );
  }
}
