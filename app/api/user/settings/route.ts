import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        image: true,
        plan: true,
        settings: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Default settings fallback structure
    const defaultSettings = {
      linkedinUrl: "",
      targetRole: "",
      targetSalary: "",
      emailNotifications: {
        analysisComplete: true,
        followUpReminders: true,
        weeklyReport: true,
      },
      accentColor: "indigo",
    };

    const userSettings = user.settings ? JSON.parse(user.settings) : defaultSettings;

    return NextResponse.json({
      name: user.name || "",
      email: user.email || "",
      image: user.image || "",
      plan: user.plan || "free",
      ...userSettings,
    });
  } catch (error: any) {
    console.error("GET settings error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const {
      name,
      linkedinUrl,
      targetRole,
      targetSalary,
      emailNotifications,
      accentColor,
      plan,
    } = body;

    // Fetch existing user to preserve fields
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { settings: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentSettings = user.settings ? JSON.parse(user.settings) : {};

    const updatedSettings = {
      ...currentSettings,
      linkedinUrl: linkedinUrl !== undefined ? linkedinUrl : currentSettings.linkedinUrl || "",
      targetRole: targetRole !== undefined ? targetRole : currentSettings.targetRole || "",
      targetSalary: targetSalary !== undefined ? targetSalary : currentSettings.targetSalary || "",
      emailNotifications: emailNotifications !== undefined ? emailNotifications : currentSettings.emailNotifications || {
        analysisComplete: true,
        followUpReminders: true,
        weeklyReport: true,
      },
      accentColor: accentColor !== undefined ? accentColor : currentSettings.accentColor || "indigo",
    };

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name !== undefined ? name : undefined,
        plan: plan !== undefined ? plan : undefined,
        settings: JSON.stringify(updatedSettings),
      },
    });

    return NextResponse.json({
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
      plan: updatedUser.plan,
      ...updatedSettings,
    });
  } catch (error: any) {
    console.error("PUT settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
export const runtime = "nodejs";
