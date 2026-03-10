import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteImageFiles } from "@/lib/upload";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const photo = await prisma.photo.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    return NextResponse.json(photo);
  } catch (error) {
    console.error("Error fetching photo:", error);
    return NextResponse.json(
      { error: "Failed to fetch photo" },
      { status: 500 }
    );
  }
}

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
    const { title, description, categoryId, isFeatured, isHero, isPublished } = body;

    const existing = await prisma.photo.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Only one photo can be the hero — clear others first
    if (isHero === true) {
      await prisma.photo.updateMany({
        where: { isHero: true, id: { not: id } },
        data: { isHero: false },
      });
    }

    const photo = await prisma.photo.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(categoryId !== undefined && { categoryId }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isHero !== undefined && { isHero }),
        ...(isPublished !== undefined && { isPublished }),
      },
      include: { category: true },
    });

    return NextResponse.json(photo);
  } catch (error) {
    console.error("Error updating photo:", error);
    return NextResponse.json(
      { error: "Failed to update photo" },
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
    const photo = await prisma.photo.findUnique({ where: { id } });
    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Delete image files from disk
    await deleteImageFiles(photo.url, photo.thumbnailUrl);

    // Delete database record
    await prisma.photo.delete({ where: { id } });

    return NextResponse.json({ message: "Photo deleted" });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
