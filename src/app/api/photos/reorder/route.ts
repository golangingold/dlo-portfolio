import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const items: { id: string; sortOrder: number }[] = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Expected an array of { id, sortOrder } pairs" },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      items.map(({ id, sortOrder }) =>
        prisma.photo.update({
          where: { id },
          data: { sortOrder },
        })
      )
    );

    return NextResponse.json({ message: "Reorder successful" });
  } catch (error) {
    console.error("Error reordering photos:", error);
    return NextResponse.json(
      { error: "Failed to reorder photos" },
      { status: 500 }
    );
  }
}
