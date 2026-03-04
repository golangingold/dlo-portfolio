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
    const { title, role, company, type, year, director, description, sortOrder, isPublished } = body;

    const existing = await prisma.resumeEntry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Resume entry not found" },
        { status: 404 }
      );
    }

    const entry = await prisma.resumeEntry.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(role !== undefined && { role }),
        ...(company !== undefined && { company }),
        ...(type !== undefined && { type }),
        ...(year !== undefined && { year }),
        ...(director !== undefined && { director }),
        ...(description !== undefined && { description }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isPublished !== undefined && { isPublished }),
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error updating resume entry:", error);
    return NextResponse.json(
      { error: "Failed to update resume entry" },
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
    const existing = await prisma.resumeEntry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Resume entry not found" },
        { status: 404 }
      );
    }

    await prisma.resumeEntry.delete({ where: { id } });

    return NextResponse.json({ message: "Resume entry deleted" });
  } catch (error) {
    console.error("Error deleting resume entry:", error);
    return NextResponse.json(
      { error: "Failed to delete resume entry" },
      { status: 500 }
    );
  }
}
