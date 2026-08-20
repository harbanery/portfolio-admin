import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

function generateUploadSignature(
  params: Record<string, string | number>,
  apiSecret: string,
): string {
  const sortedParams = Object.keys(params)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return crypto
    .createHash("sha1")
    .update(sortedParams + apiSecret)
    .digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = (data.get("image") ||
      data.get("file") ||
      data.get("images")) as unknown as File;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const folder = "admin-portfolio";
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    const uploadTimestamp = Math.floor(Date.now() / 1000);
    const params = {
      timestamp: uploadTimestamp,
      public_id: filename,
      folder: folder,
    };

    const signature = generateUploadSignature(
      params,
      process.env.CLOUDINARY_API_SECRET || "",
    );

    const formData = new FormData();
    formData.append("file", new Blob([buffer], { type: file.type }), filename);
    formData.append("api_key", process.env.CLOUDINARY_API_KEY || "");
    formData.append("timestamp", uploadTimestamp.toString());
    formData.append("public_id", filename);
    formData.append("folder", folder);
    formData.append("signature", signature);

    const isImage = file.type.startsWith("image/");
    // Gunakan endpoint `image` untuk gambar dan `auto` untuk dokumen
    // (PDF/Google Docs/Microsoft Word) agar Cloudinary menentukan
    // resource type yang tepat secara otomatis.
    const resourceSegment = isImage ? "image" : "auto";

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceSegment}/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!cloudinaryResponse.ok) {
      const errorData = await cloudinaryResponse.json();
      throw new Error(errorData.error?.message || "Cloudinary upload failed");
    }

    const cloudinaryData = await cloudinaryResponse.json();

    return NextResponse.json({
      success: true,
      data: {
        url: cloudinaryData.secure_url,
        storagePath: cloudinaryData.public_id,
        resourceType: cloudinaryData.resource_type,
        mimeType: file.type,
        size: file.size,
        name: file.name,
        width: cloudinaryData.width,
        height: cloudinaryData.height,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Upload error:", error);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to upload file: ${message}`,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("path");

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: "Missing public ID" },
        { status: 400 },
      );
    }

    const destroy = async (resourceType: "image" | "raw") => {
      const deleteTimestamp = Math.floor(Date.now() / 1000);
      const params = {
        timestamp: deleteTimestamp,
        public_id: publicId,
      };

      const signature = generateUploadSignature(
        params,
        process.env.CLOUDINARY_API_SECRET || "",
      );

      return fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/destroy`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            public_id: publicId,
            api_key: process.env.CLOUDINARY_API_KEY,
            timestamp: deleteTimestamp,
            signature: signature,
          }),
        },
      );
    };

    // Coba hapus sebagai image terlebih dahulu; jika tidak ditemukan,
    // coba sebagai raw (file dokumen seperti PDF/DOCX).
    let cloudinaryResponse = await destroy("image");
    if (!cloudinaryResponse.ok) {
      cloudinaryResponse = await destroy("raw");
    }

    if (!cloudinaryResponse.ok) {
      const errorData = await cloudinaryResponse.json();
      throw new Error(errorData.error?.message || "Cloudinary delete failed");
    }

    return NextResponse.json({
      success: true,
      message: "Successfully deleted asset from Cloudinary",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Delete error:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to delete file: ${message}`,
      },
      { status: 500 },
    );
  }
}
