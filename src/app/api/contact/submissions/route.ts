import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { contactSubmissionSchema } from "@/lib/validations";
import nodemailer from "nodemailer";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const submissions = await prisma.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with zod schema (public route)
    const result = contactSubmissionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = result.data;

    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        subject: subject || null,
        message,
      },
    });

    // Send email notification (fire-and-forget — don't fail the request if email fails)
    if (process.env.GMAIL_APP_PASSWORD) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "deangelo.bwell@gmail.com",
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        });
        await transporter.sendMail({
          from: '"DeAngelo Portfolio" <deangelo.bwell@gmail.com>',
          to: "deangelo.bwell@gmail.com",
          subject: `New contact message: ${subject || "(no subject)"}`,
          text: `From: ${name} <${email}>\nSubject: ${subject || "(none)"}\n\n${message}`,
          html: `
            <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
            <p><strong>Subject:</strong> ${subject || "(none)"}</p>
            <hr />
            <p style="white-space:pre-wrap">${message}</p>
          `,
        });
      } catch (emailErr) {
        console.error("Email notification failed:", emailErr);
      }
    }

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json(
      { error: "Failed to submit contact form" },
      { status: 500 }
    );
  }
}
