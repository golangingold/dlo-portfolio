import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, videoUrl, thumbnailUrl, videoType, isPrimary, isPublished, sortOrder } = body;

    const existing = await prisma.demoReel.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Demo reel not found" },
        { status: 404 }
      );
    }

    // If setting as primary, unset all other primaries first
    if (isPrimary && !existing.isPrimary) {
      await prisma.demoReel.updateMany({
        where: { isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const reel = await prisma.demoReel.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(videoType !== undefined && { videoType }),
        ...(isPrimary !== undefined && { isPrimary }),
        ...(isPublished !== undefined && { isPublished }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json(reel);
  } catch (error) {
    console.error("Error updating demo reel:", error);
    return NextResponse.json(
      { error: "Failed to update demo reel" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.demoReel.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Demo reel not found" },
        { status: 404 }
      );
    }

    await prisma.demoReel.delete({ where: { id } });

    return NextResponse.json({ message: "Demo reel deleted" });
  } catch (error) {
    console.error("Error deleting demo reel:", error);
    return NextResponse.json(
      { error: "Failed to delete demo reel" },
      { status: 500 }
    );
  }
}
