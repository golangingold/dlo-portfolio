import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const entries = await prisma.resumeEntry.findMany({
      orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching resume entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume entries" },
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
    const { title, role, company, type, year, director, description, isPublished } = body;

    if (!title || !type) {
      return NextResponse.json(
        { error: "Title and type are required" },
        { status: 400 }
      );
    }

    // Get next sort order within the same type
    const lastEntry = await prisma.resumeEntry.findFirst({
      where: { type },
      orderBy: { sortOrder: "desc" },
    });
    const sortOrder = (lastEntry?.sortOrder ?? -1) + 1;

    const entry = await prisma.resumeEntry.create({
      data: {
        title,
        role: role || null,
        company: company || null,
        type,
        year: year || null,
        director: director || null,
        description: description || null,
        sortOrder,
        isPublished: isPublished ?? true,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Error creating resume entry:", error);
    return NextResponse.json(
      { error: "Failed to create resume entry" },
      { status: 500 }
    );
  }
}
