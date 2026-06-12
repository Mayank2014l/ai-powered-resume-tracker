import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { analyzeResume } from "@/lib/claude";
import { z } from "zod";

const analyzeSchema = z.object({
  resumeId: z.string(),
  jobDescription: z.string().min(10, "Job description must be at least 10 characters long."),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = analyzeSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { resumeId, jobDescription } = parsed.data;

    // Fetch the resume from the database
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId, userId: session.user.id },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 444 });
    }

    // Call Claude API for analysis
    const analysisResult = await analyzeResume(resume.extractedText, jobDescription);

    // Save the analysis to the database
    const analysis = await prisma.analysis.create({
      data: {
        userId: session.user.id,
        resumeId,
        jobDescription,
        matchScore: analysisResult.matchScore,
        keywordsScore: analysisResult.keywordsScore,
        skillsScore: analysisResult.skillsScore,
        experienceScore: analysisResult.experienceScore,
        formatScore: analysisResult.formatScore,
        missingKeywords: JSON.stringify(analysisResult.missingKeywords),
        strengths: JSON.stringify(analysisResult.strengths),
        improvements: JSON.stringify(analysisResult.improvements),
        atsScore: analysisResult.atsScore,
      },
    });

    return NextResponse.json({
      ...analysis,
      missingKeywords: JSON.parse(analysis.missingKeywords),
      strengths: JSON.parse(analysis.strengths),
      improvements: JSON.parse(analysis.improvements),
    });
  } catch (error: any) {
    console.error("AI Analysis API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze resume" },
      { status: 500 }
    );
  }
}
export const runtime = "nodejs";
