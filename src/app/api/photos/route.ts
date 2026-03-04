import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const featured = searchParams.get("featured");

    const where: Record<string, unknown> = {};

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    const photos = await prisma.photo.findMany({
      where,
      include: { category: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(photos);
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      filename,
      url,
      thumbnailUrl,
      blurDataUrl,
      width,
      height,
      fileSize,
      categoryId,
      isFeatured,
    } = body;

    if (!filename || !url || !categoryId) {
      return NextResponse.json(
        { error: "filename, url, and categoryId are required" },
        { status: 400 }
      );
    }

    // Get the next sort order
    const lastPhoto = await prisma.photo.findFirst({
      orderBy: { sortOrder: "desc" },
    });
    const sortOrder = (lastPhoto?.sortOrder ?? -1) + 1;

    const photo = await prisma.photo.create({
      data: {
        title: title || null,
        description: description || null,
        filename,
        url,
        thumbnailUrl: thumbnailUrl || null,
        blurDataUrl: blurDataUrl || null,
        width: width || 0,
        height: height || 0,
        fileSize: fileSize || null,
        categoryId,
        isFeatured: isFeatured ?? false,
        sortOrder,
      },
      include: { category: true },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("Error creating photo:", error);
    return NextResponse.json(
      { error: "Failed to create photo" },
      { status: 500 }
    );
  }
}
