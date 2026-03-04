import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reels = await prisma.demoReel.findMany({
      orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
    });

    return NextResponse.json(reels);
  } catch (error) {
    console.error("Error fetching demo reels:", error);
    return NextResponse.json(
      { error: "Failed to fetch demo reels" },
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
    const { title, description, videoUrl, thumbnailUrl, videoType, isPrimary, isPublished } = body;

    if (!title || !videoUrl) {
      return NextResponse.json(
        { error: "Title and videoUrl are required" },
        { status: 400 }
      );
    }

    // If this reel is primary, unset all other primaries
    if (isPrimary) {
      await prisma.demoReel.updateMany({
        where: { isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // Get next sort order
    const lastReel = await prisma.demoReel.findFirst({
      orderBy: { sortOrder: "desc" },
    });
    const sortOrder = (lastReel?.sortOrder ?? -1) + 1;

    const reel = await prisma.demoReel.create({
      data: {
        title,
        description: description || null,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        videoType: videoType || "YOUTUBE",
        isPrimary: isPrimary ?? false,
        isPublished: isPublished ?? true,
        sortOrder,
      },
    });

    return NextResponse.json(reel, { status: 201 });
  } catch (error) {
    console.error("Error creating demo reel:", error);
    return NextResponse.json(
      { error: "Failed to create demo reel" },
      { status: 500 }
    );
  }
}
