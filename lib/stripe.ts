import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "mock_secret_key";

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-04-10" as any,
});

export async function createCheckoutSession(userId: string, userEmail: string, origin: string, plan: string = "pro") {
  if (!process.env.STRIPE_SECRET_KEY) {
    // Return mock session URL to allow local testing of plan upgrading/downgrading
    return `${origin}/checkout?userId=${userId}&plan=${plan}`;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID || "price_1MockPriceId",
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/billing?canceled=true`,
      customer_email: userEmail,
      metadata: {
        userId,
      },
    });

    return session.url;
  } catch (error) {
    console.error("Stripe checkout creation failed, serving mock URL:", error);
    return `${origin}/dashboard/billing?mock_upgrade=true&session_id=mock_stripe_session_err_${Date.now()}`;
  }
}
