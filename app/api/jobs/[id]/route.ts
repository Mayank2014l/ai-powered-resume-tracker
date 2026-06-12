import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const jobUpdateSchema = z.object({
  company: z.string().optional(),
  role: z.string().optional(),
  jdUrl: z.string().url().or(z.literal("")).nullable().optional(),
  jdText: z.string().nullable().optional(),
  status: z.enum(["saved", "applied", "interview", "offer", "rejected"]).optional(),
  matchScore: z.number().min(0).max(100).nullable().optional(),
  notes: z.string().nullable().optional(),
  salary: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  appliedAt: z.string().nullable().optional(),
  followUpDate: z.string().nullable().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const body = await req.json();
    const parsed = jobUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const updates: any = { ...parsed.data };
    
    // Convert date strings if provided
    if (updates.appliedAt !== undefined) {
      updates.appliedAt = updates.appliedAt ? new Date(updates.appliedAt) : null;
    }
    if (updates.followUpDate !== undefined) {
      updates.followUpDate = updates.followUpDate ? new Date(updates.followUpDate) : null;
    }

    const job = await prisma.job.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!job) {
      return NextResponse.json({ error: "Job application not found" }, { status: 404 });
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json(updatedJob);
  } catch (error: any) {
    console.error("Update job error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update job application" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const job = await prisma.job.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!job) {
      return NextResponse.json({ error: "Job application not found" }, { status: 404 });
    }

    await prisma.job.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete job error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete job application" },
      { status: 500 }
    );
  }
}
export const runtime = "nodejs";
