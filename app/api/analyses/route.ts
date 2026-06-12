import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const analyses = await prisma.analysis.findMany({
      where: { userId: session.user.id },
      include: {
        resume: {
          select: {
            filename: true,
            fileUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const parsedAnalyses = analyses.map((a) => ({
      ...a,
      missingKeywords: a.missingKeywords ? JSON.parse(a.missingKeywords) : [],
      strengths: a.strengths ? JSON.parse(a.strengths) : [],
      improvements: a.improvements ? JSON.parse(a.improvements) : [],
    }));

    return NextResponse.json(parsedAnalyses);
  } catch (error: any) {
    console.error("Fetch analyses error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve analysis history" },
      { status: 500 }
    );
  }
}
export const runtime = "nodejs";
