import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  
  // Enforce admin authorization
  if (!session?.user?.email || session.user.email !== "admin@resumeiq.co") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Collect database stats
    const totalUsers = await prisma.user.count();
    const freeUsers = await prisma.user.count({ where: { plan: "free" } });
    const proUsers = await prisma.user.count({ where: { plan: "pro" } });
    const ultimateUsers = await prisma.user.count({ where: { plan: "ultimate" } });
    const adminUsers = await prisma.user.count({ where: { plan: "admin" } });
    
    const totalResumes = await prisma.resume.count();
    const totalJobsTracked = await prisma.job.count();

    // Fetch user details for display
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        createdAt: true,
        _count: {
          select: {
            resumes: true,
            jobs: true,
            coverLetters: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        freeUsers,
        proUsers,
        ultimateUsers,
        adminUsers,
        totalResumes,
        totalJobsTracked
      },
      users
    });
  } catch (error: any) {
    console.error("Admin user fetch error:", error);
    return NextResponse.json({ error: "Failed to load admin logs" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== "admin@resumeiq.co") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { userId, plan } = body;

    if (!userId || !plan) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { plan },
    });

    return NextResponse.json({
      message: "Plan updated successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        plan: updatedUser.plan
      }
    });
  } catch (error: any) {
    console.error("Admin user plan update error:", error);
    return NextResponse.json({ error: "Failed to update user plan" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== "admin@resumeiq.co") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId query" }, { status: 400 });
    }

    // Do not allow deleting own admin account
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (userToDelete?.email === "admin@resumeiq.co") {
      return NextResponse.json({ error: "Cannot delete the primary administrator account" }, { status: 403 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Admin user delete error:", error);
    return NextResponse.json({ error: "Failed to remove user account" }, { status: 500 });
  }
}

export const runtime = "nodejs";
