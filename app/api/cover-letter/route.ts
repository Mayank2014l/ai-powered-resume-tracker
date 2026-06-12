import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateCoverLetter } from "@/lib/claude";
import { z } from "zod";

const coverLetterSchema = z.object({
  resumeId: z.string(),
  jobDescription: z.string().min(10, "Job description must be at least 10 characters long."),
  tone: z.enum(["Professional", "Enthusiastic", "Concise"]),
  personalNote: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = coverLetterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { resumeId, jobDescription, tone, personalNote } = parsed.data;

    // Fetch resume
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId, userId: session.user.id },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Generate cover letter via Claude
    const content = await generateCoverLetter(
      resume.extractedText,
      jobDescription,
      tone,
      personalNote || undefined
    );

    // Save cover letter to database
    const coverLetter = await prisma.coverLetter.create({
      data: {
        userId: session.user.id,
        resumeId,
        jobDescription,
        tone,
        content,
      },
    });

    return NextResponse.json(coverLetter);
  } catch (error: any) {
    console.error("Cover letter creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}
export const runtime = "nodejs";
