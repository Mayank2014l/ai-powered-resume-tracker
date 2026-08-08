"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { 
  Sparkles, CheckCircle, CreditCard, ShieldCheck, 
  ChevronRight, ArrowRight, Loader2, Calendar, FileText, X
} from "lucide-react";
import { toast } from "sonner";

function BillingContent() {
  const { plan, refreshProfile, updateSession } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loadingUpgrade, setLoadingUpgrade] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [submittingCancel, setSubmittingCancel] = useState(false);

  // Capture mock stripe checkout completion callback
  useEffect(() => {
    const mockUpgrade = searchParams.get("mock_upgrade");
    const success = searchParams.get("success");
    const planParam = searchParams.get("plan") || "pro";

    if (mockUpgrade || success) {
      const promoteUser = async () => {
        try {
          const res = await fetch("/api/user/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan: planParam }),
          });
          if (res.ok) {
            toast.success(`Successfully upgraded to ${planParam === "ultimate" ? "Ultimate" : "Pro"} Access!`);
            await updateSession({ plan: planParam });
            refreshProfile();
            router.push("/dashboard/billing");
          }
        } catch (e) {
          console.error("Mock upgrade failed:", e);
        }
      }
      promoteUser();
    }
  }, [searchParams]);

  const handleUpgradeClick = async (targetPlan: "pro" | "ultimate") => {
    setLoadingUpgrade(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          toast.info("Redirecting to Checkout...");
          window.location.href = data.url;
        } else {
          throw new Error("No URL returned");
        }
      } else {
        throw new Error("Checkout call failed");
      }
    } catch (err) {
      toast.error("Failed to start upgrade checkout.");
    } finally {
      setLoadingUpgrade(false);
    }
  };

  const handleCancelSubscriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCancel(true);
    
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "free" }),
      });

      if (res.ok) {
        toast.success("Subscription canceled successfully. Account set to Free.");
        await updateSession({ plan: "free" });
        refreshProfile();
        setShowCancelModal(false);
        setCancelReason("");
      } else {
        toast.error("Failed to cancel subscription.");
      }
    } catch (err) {
      toast.error("An error occurred during cancellation.");
    } finally {
      setSubmittingCancel(false);
    }
  };

  const invoices = [
    { id: "INV-0198", date: "May 12, 2026", amount: "$4.99", status: "Paid" },
    { id: "INV-0174", date: "Apr 12, 2026", amount: "$4.99", status: "Paid" },
    { id: "INV-0129", date: "Mar 12, 2026", amount: "$4.99", status: "Paid" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Billing & Subscriptions
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage your subscription plans, view invoice history, and configure payment methods.
        </p>
      </div>

      {/* PLAN CARD WRAPPER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        
        {/* Card 1: Free Plan */}
        <div className="rounded-xl border border-graphite-border bg-graphite-surface p-6 shadow-sm flex flex-col justify-between h-[420px]">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-white">Free Plan</h3>
                <span className="text-5xs text-gray-400">Basic tracker limits</span>
              </div>
              {plan === "free" && (
                <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-5xs font-bold uppercase tracking-wider">
                  Active
                </span>
              )}
            </div>
            
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-extrabold text-white">₹0</span>
              <span className="text-4xs text-gray-400">/ month</span>
            </div>

            <div className="border-t border-graphite-border pt-4 space-y-2 text-2xs text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>5 AI Analyses / month</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>3 Resumes max</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 line-through">
                <X className="h-4 w-4 shrink-0 text-gray-600" />
                <span>AI Cover Letter drafts</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-graphite-border">
            {plan === "free" ? (
              <span className="text-4xs text-gray-500 italic block text-center">Your current basic plan</span>
            ) : (
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full text-center py-2 rounded-lg border border-graphite-border hover:bg-graphite-surfaceHover text-4xs font-bold uppercase text-gray-300"
              >
                Downgrade to Free
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Pro Plan */}
        <div className={`rounded-xl border p-6 shadow-sm flex flex-col justify-between h-[420px] relative ${
          plan === "pro" 
            ? "border-emerald-500 bg-emerald-500/5" 
            : "border-graphite-border bg-graphite-surface"
        }`}>
          {plan === "pro" && (
            <span className="absolute top-0 right-6 -translate-y-1/2 rounded-full bg-emerald-600 px-2 py-0.5 text-5xs font-bold text-white uppercase tracking-wider shadow">
              Active Plan
            </span>
          )}
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-white">Pro Plan</h3>
                <span className="text-5xs text-emerald-400">Most popular for job seekers</span>
              </div>
            </div>

            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-extrabold text-white">₹299</span>
              <span className="text-4xs text-gray-400">/ month</span>
              <span className="text-5xs text-gray-500 ml-1">($4.99/mo)</span>
            </div>

            <div className="border-t border-graphite-border pt-4 space-y-2 text-2xs text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-white">Unlimited AI Analyses</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Unlimited Resumes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>AI Cover Letter drafts</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-graphite-border">
            {plan === "pro" ? (
              <div className="flex justify-between items-center text-4xs">
                <span className="text-gray-400">Next cycle: July 12</span>
                <button onClick={() => setShowCancelModal(true)} className="text-red-400 font-bold hover:underline">Cancel</button>
              </div>
            ) : (
              <button
                onClick={() => handleUpgradeClick("pro")}
                disabled={loadingUpgrade}
                className="w-full text-center py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-4xs font-bold uppercase text-white shadow-md shadow-emerald-600/10 transition-colors"
              >
                {loadingUpgrade ? "Redirecting..." : "Upgrade to Pro"}
              </button>
            )}
          </div>
        </div>

        {/* Card 3: Ultimate Plan */}
        <div className={`rounded-xl border p-6 shadow-sm flex flex-col justify-between h-[420px] relative ${
          plan === "ultimate" 
            ? "border-teal-500 bg-teal-500/5" 
            : "border-graphite-border bg-graphite-surface"
        }`}>
          {plan === "ultimate" && (
            <span className="absolute top-0 right-6 -translate-y-1/2 rounded-full bg-teal-600 px-2 py-0.5 text-5xs font-bold text-white uppercase tracking-wider shadow">
              Active Plan
            </span>
          )}
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-white">Ultimate Tier</h3>
                <span className="text-5xs text-teal-400">Total interview readiness</span>
              </div>
            </div>

            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-extrabold text-white">₹599</span>
              <span className="text-4xs text-gray-400">/ month</span>
              <span className="text-5xs text-gray-500 ml-1">($9.99/mo)</span>
            </div>

            <div className="border-t border-graphite-border pt-4 space-y-2 text-2xs text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-white">Everything in Pro</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Live ATS Sandbox Sim</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>1-on-1 AI Interview coach</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-graphite-border">
            {plan === "ultimate" ? (
              <div className="flex justify-between items-center text-4xs">
                <span className="text-gray-400">Next cycle: July 12</span>
                <button onClick={() => setShowCancelModal(true)} className="text-red-400 font-bold hover:underline">Cancel</button>
              </div>
            ) : (
              <button
                onClick={() => handleUpgradeClick("ultimate")}
                disabled={loadingUpgrade}
                className="w-full text-center py-2.5 rounded-lg bg-teal-600 text-white hover:bg-teal-500 disabled:opacity-50 text-4xs font-bold uppercase shadow-md shadow-teal-600/10 transition-colors"
              >
                {loadingUpgrade ? "Redirecting..." : "Upgrade to Ultimate"}
              </button>
            )}
          </div>
        </div>

      </div>

      {/* BILLING INVOICES HISTORY TABLE */}
      {plan !== "free" && (
        <div className="rounded-xl border border-graphite-border bg-graphite-surface p-6 shadow-sm">
          <h2 className="text-sm font-bold text-white border-b border-graphite-border pb-3 mb-4 flex items-center gap-1.5">
            <Calendar className="h-4.5 w-4.5 text-gray-400" />
            <span>Billing Invoices</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-2xs">
              <thead>
                <tr className="border-b border-graphite-border text-gray-400 uppercase text-3xs font-semibold">
                  <th className="py-2 px-4 font-bold">Invoice ID</th>
                  <th className="py-2 px-4 font-bold">Billing Date</th>
                  <th className="py-2 px-4 font-bold">Amount</th>
                  <th className="py-2 px-4 font-bold">Status</th>
                  <th className="py-2 px-4 font-bold">Document</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-border">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-graphite-surfaceHover/50">
                    <td className="py-3 px-4 font-semibold text-white">{inv.id}</td>
                    <td className="py-3 px-4 text-gray-400">{inv.date}</td>
                    <td className="py-3 px-4 text-gray-400">{inv.amount}</td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 text-3xs font-semibold">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toast.success(`Receipt document fetched for ${inv.id}`)}
                        className="rounded border border-graphite-border px-2 py-1 text-3xs text-gray-300 hover:bg-graphite-surfaceHover hover:text-white"
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CANCEL SUBSCRIPTION MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-graphite-border bg-graphite-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-graphite-border pb-3 mb-4">
              <h2 className="text-sm font-bold text-white">Cancel Subscription</h2>
              <button 
                onClick={() => setShowCancelModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-graphite-surfaceHover"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCancelSubscriptionSubmit} className="space-y-4 text-2xs">
              <p className="text-gray-400 leading-normal">
                We are sorry to see you go! Please take a second to tell us why you are canceling so we can improve ResumeIQ:
              </p>

              <div className="space-y-2 text-gray-300">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="reason"
                    value="too-expensive"
                    required
                    checked={cancelReason === "too-expensive"}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>It is too expensive / not worth it</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="reason"
                    value="missing-features"
                    checked={cancelReason === "missing-features"}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Missing core features</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="reason"
                    value="found-job"
                    checked={cancelReason === "found-job"}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>I successfully landed a job!</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="reason"
                    value="other"
                    checked={cancelReason === "other"}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Other reasons</span>
                </label>
              </div>

              <div className="border-t border-graphite-border pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="rounded border border-graphite-border bg-graphite-base px-4 py-2 hover:bg-graphite-surfaceHover text-gray-300"
                >
                  Keep Subscription
                </button>
                <button
                  type="submit"
                  disabled={submittingCancel}
                  className="rounded bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500 disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                >
                  {submittingCancel && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Confirm Cancellation
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="text-3xs text-gray-400">Loading Billing panel...</span>
      </div>
    }>
      <BillingContent />
    </Suspense>
  );
}
