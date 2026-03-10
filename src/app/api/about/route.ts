import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_ID = "default";

export async function GET() {
  try {
    const about = await prisma.about.findUnique({
      where: { id: DEFAULT_ID },
    });

    if (!about) {
      return NextResponse.json(null);
    }

    // Parse stats JSON for the response
    return NextResponse.json({
      ...about,
      stats: about.stats ? JSON.parse(about.stats) : null,
    });
  } catch (error) {
    console.error("Error fetching about:", error);
    return NextResponse.json(
      { error: "Failed to fetch about data" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { headline, bio, shortBio, profileImageUrl, compCardImageUrl, stats } = body;

    if (!bio) {
      return NextResponse.json(
        { error: "Bio is required" },
        { status: 400 }
      );
    }

    const statsJson = stats ? JSON.stringify(stats) : null;

    const about = await prisma.about.upsert({
      where: { id: DEFAULT_ID },
      update: {
        headline: headline || null,
        bio,
        shortBio: shortBio || null,
        profileImageUrl: profileImageUrl || null,
        compCardImageUrl: compCardImageUrl || null,
        stats: statsJson,
      },
      create: {
        id: DEFAULT_ID,
        headline: headline || null,
        bio,
        shortBio: shortBio || null,
        profileImageUrl: profileImageUrl || null,
        compCardImageUrl: compCardImageUrl || null,
        stats: statsJson,
      },
    });

    return NextResponse.json({
      ...about,
      stats: about.stats ? JSON.parse(about.stats) : null,
    });
  } catch (error) {
    console.error("Error updating about:", error);
    return NextResponse.json(
      { error: "Failed to update about data" },
      { status: 500 }
    );
  }
}
