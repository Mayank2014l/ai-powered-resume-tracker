import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id },
      include: {
        analyses: {
          select: {
            matchScore: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(resumes);
  } catch (error: any) {
    console.error("Fetch resumes error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve resumes" },
      { status: 500 }
    );
  }
}
export const runtime = "nodejs";
