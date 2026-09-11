import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  destroyCloudinaryAsset,
  publicIdFromUrl,
  resolveUploadFolder,
  signCloudinaryParams,
} from "@/lib/cloudinary";
import {
  MAX_DOCUMENT_SIZE,
  MAX_IMAGE_SIZE,
  validateUploadFile,
} from "@/utils/server/upload";

export async function POST(request: NextRequest) {
  if (!(await requireAuth())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  try {
    const data = await request.formData();
    const file: File | null = (data.get("image") ||
      data.get("file") ||
      data.get("images") ||
      data.get("file_upload")) as unknown as File;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 },
      );
    }

    // Validasi server-side: whitelist tipe + ekstensi + batas ukuran.
    // (Client memeriksa hal yang sama via beforeUpload, tapi request
    // bisa dibuat langsung tanpa UI.)
    const validation = validateUploadFile(file);
    if (!validation.ok) {
      const maxMb =
        validation.kind === "image"
          ? MAX_IMAGE_SIZE / (1024 * 1024)
          : MAX_DOCUMENT_SIZE / (1024 * 1024);
      const error =
        validation.code === "TOO_LARGE"
          ? `File exceeds the ${maxMb}MB size limit`
          : "File type is not allowed (images: jpg/png/webp/gif, documents: pdf/doc/docx)";
      return NextResponse.json(
        { success: false, code: validation.code, error },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Subfolder per menu (mis. "projects" → admin-portfolio/projects)
    // dikirim client via field "folder" pada FormData.
    const folder = resolveUploadFolder(data.get("folder") as string | null);
    if (!folder) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid upload folder. Send a 'folder' field matching the target menu (e.g. projects, experiences, certifications, cv, personal).",
        },
        { status: 400 },
      );
    }

    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    const isImage = validation.kind === "image";
    // Gunakan endpoint `image` untuk gambar dan `raw` untuk dokumen
    // (PDF/Microsoft Word). Resource `raw` disimpan apa adanya sehingga
    // file dikirim sebagai byte asli.
    const resourceSegment = isImage ? "image" : "raw";

    /**
     * Cloudinary memblokir delivery file ber-ekstensi .pdf/.zip (401
     * "deny or ACL failure") ketika setting keamanan "Allow delivery of
     * PDF and ZIP files" nonaktif. Sebagai workaround, PDF disimpan
     * dengan ekstensi .docx (isi file tetap PDF apa adanya) sehingga
     * tetap bisa dideliver; proxy /api/admin/file menyajikannya kembali
     * sebagai PDF (Content-Type application/pdf + nama file asli).
     */
    let storedFilename = filename;
    if (!isImage && filename.toLowerCase().endsWith(".pdf")) {
      storedFilename = `${filename.slice(0, -4)}.docx`;
    }

    const uploadTimestamp = Math.floor(Date.now() / 1000);
    const params = {
      timestamp: uploadTimestamp,
      public_id: storedFilename,
      folder: folder,
    };

    const signature = signCloudinaryParams(
      params,
      process.env.CLOUDINARY_API_SECRET || "",
    );

    const formData = new FormData();
    formData.append(
      "file",
      new Blob([buffer], { type: file.type }),
      storedFilename,
    );
    formData.append("api_key", process.env.CLOUDINARY_API_KEY || "");
    formData.append("timestamp", uploadTimestamp.toString());
    formData.append("public_id", storedFilename);
    formData.append("folder", folder);
    formData.append("signature", signature);

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceSegment}/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!cloudinaryResponse.ok) {
      // Detail error Cloudinary hanya dicatat di log server; client
      // hanya menerima pesan generik (jangan bocorkan error internal).
      const errorData = await cloudinaryResponse.json().catch(() => null);
      throw new Error(
        errorData?.error?.message ||
          `Cloudinary upload failed (HTTP ${cloudinaryResponse.status})`,
      );
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
    // Log lengkap untuk observability server; respons client generik.
    console.error("Upload error:", error);

    return NextResponse.json(
      { success: false, code: "UPLOAD_FAILED", error: "Failed to upload file" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await requireAuth())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  try {
    const { searchParams } = new URL(request.url);

    // Identitas aset: public_id langsung (`path`) atau URL delivery
    // (`url`) yang dikonversi menjadi public_id di sisi server.
    const pathParam = searchParams.get("path");
    const urlParam = searchParams.get("url");
    const publicId =
      pathParam ?? (urlParam ? publicIdFromUrl(urlParam) : null);

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid asset identifier" },
        { status: 400 },
      );
    }

    const deleted = await destroyCloudinaryAsset(publicId);
    if (!deleted) {
      throw new Error("Cloudinary delete failed");
    }

    return NextResponse.json({
      success: true,
      message: "Successfully deleted asset from Cloudinary",
    });
  } catch (error: unknown) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { success: false, code: "DELETE_FAILED", error: "Failed to delete file" },
      { status: 500 },
    );
  }
}
