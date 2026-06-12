import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const jobCreateSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Job role is required"),
  jdUrl: z.string().url().or(z.literal("")).nullable().optional(),
  jdText: z.string().nullable().optional(),
  status: z.enum(["saved", "applied", "interview", "offer", "rejected"]),
  matchScore: z.number().min(0).max(100).nullable().optional(),
  notes: z.string().nullable().optional(),
  salary: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  appliedAt: z.string().nullable().optional(),
  followUpDate: z.string().nullable().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const jobs = await prisma.job.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(jobs);
  } catch (error: any) {
    console.error("Fetch jobs error:", error);
    return NextResponse.json({ error: "Failed to retrieve jobs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = jobCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      company,
      role,
      jdUrl,
      jdText,
      status,
      matchScore,
      notes,
      salary,
      location,
      appliedAt,
      followUpDate,
    } = parsed.data;

    const job = await prisma.job.create({
      data: {
        userId: session.user.id,
        company,
        role,
        jdUrl: jdUrl || null,
        jdText: jdText || null,
        status,
        matchScore: matchScore || null,
        notes: notes || null,
        salary: salary || null,
        location: location || null,
        appliedAt: appliedAt ? new Date(appliedAt) : null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      },
    });

    return NextResponse.json(job);
  } catch (error: any) {
    console.error("Create job error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create job application" },
      { status: 500 }
    );
  }
}
export const runtime = "nodejs";
