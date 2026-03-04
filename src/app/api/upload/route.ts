import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { processAndSaveImage } from "@/lib/upload";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    // Support both "file" (single) and "files" (multiple) field names
    let files = formData.getAll("files") as File[];
    if (files.length === 0) {
      const singleFile = formData.get("file") as File | null;
      if (singleFile) files = [singleFile];
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds maximum size of 10MB` },
          { status: 400 }
        );
      }
    }

    const results = await Promise.all(
      files.map((file) => processAndSaveImage(file))
    );

    // Return single object for single file upload, array for multiple
    if (results.length === 1) {
      return NextResponse.json(results[0], { status: 201 });
    }

    return NextResponse.json(results, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}
