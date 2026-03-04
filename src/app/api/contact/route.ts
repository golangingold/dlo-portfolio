import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_ID = "default";

export async function GET() {
  try {
    const contact = await prisma.contactInfo.findUnique({
      where: { id: DEFAULT_ID },
    });

    if (!contact) {
      return NextResponse.json(null);
    }

    // Parse customLinks JSON if present
    return NextResponse.json({
      ...contact,
      customLinks: contact.customLinks ? JSON.parse(contact.customLinks) : null,
    });
  } catch (error) {
    console.error("Error fetching contact info:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact info" },
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
    const {
      email,
      phone,
      location,
      agencyName,
      agencyUrl,
      agencyEmail,
      instagramUrl,
      twitterUrl,
      tiktokUrl,
      imdbUrl,
      linkedinUrl,
      customLinks,
      availableForWork,
    } = body;

    // Serialize customLinks to JSON string if provided
    const customLinksJson = customLinks ? JSON.stringify(customLinks) : null;

    const data = {
      email: email || null,
      phone: phone || null,
      location: location || null,
      agencyName: agencyName || null,
      agencyUrl: agencyUrl || null,
      agencyEmail: agencyEmail || null,
      instagramUrl: instagramUrl || null,
      twitterUrl: twitterUrl || null,
      tiktokUrl: tiktokUrl || null,
      imdbUrl: imdbUrl || null,
      linkedinUrl: linkedinUrl || null,
      customLinks: customLinksJson,
      availableForWork: availableForWork ?? true,
    };

    const contact = await prisma.contactInfo.upsert({
      where: { id: DEFAULT_ID },
      update: data,
      create: { id: DEFAULT_ID, ...data },
    });

    return NextResponse.json({
      ...contact,
      customLinks: contact.customLinks ? JSON.parse(contact.customLinks) : null,
    });
  } catch (error) {
    console.error("Error updating contact info:", error);
    return NextResponse.json(
      { error: "Failed to update contact info" },
      { status: 500 }
    );
  }
}
