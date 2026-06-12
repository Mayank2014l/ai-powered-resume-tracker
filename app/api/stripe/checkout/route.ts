import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const plan = body.plan === "ultimate" ? "ultimate" : "pro";
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const checkoutUrl = await createCheckoutSession(
      session.user.id,
      session.user.email || "",
      origin,
      plan
    );

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error("Create checkout session error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate checkout session" },
      { status: 500 }
    );
  }
}
export const runtime = "nodejs";
