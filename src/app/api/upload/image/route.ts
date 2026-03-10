import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const webpBuffer = await sharp(buffer).webp({ quality: 90 }).toBuffer();
  const filename = `uploads/${Date.now()}.webp`;

  const blob = await put(filename, webpBuffer, {
    access: "public",
    contentType: "image/webp",
  });

  return NextResponse.json({ url: blob.url });
}
