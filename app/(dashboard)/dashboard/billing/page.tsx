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
            // Clear URL params
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
      // Downgrade plan in settings DB
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
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
          Billing & Subscriptions
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Manage your subscription plans, view invoice history, and configure card details.
        </p>
      </div>

      {/* PLAN CARD WRAPPER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        
        {/* Card 1: Free Plan */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/30 shadow-sm flex flex-col justify-between h-[420px]">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Free Plan</h3>
                <span className="text-5xs text-zinc-400">Basic tracker limits</span>
              </div>
              {plan === "free" && (
                <span className="rounded-full bg-indigo-500/10 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 px-2 py-0.5 text-5xs font-bold uppercase tracking-wider">
                  Active
                </span>
              )}
            </div>
            
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">₹0</span>
              <span className="text-4xs text-zinc-400">/ month</span>
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2 text-2xs text-zinc-650 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>5 AI Analyses / month</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>3 Resumes max</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400 line-through">
                <X className="h-4 w-4 shrink-0 text-zinc-350" />
                <span>AI Cover Letter drafts</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            {plan === "free" ? (
              <span className="text-4xs text-zinc-400 italic block text-center">Your current basic plan</span>
            ) : (
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full text-center py-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950 text-4xs font-bold uppercase"
              >
                Downgrade to Free
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Pro Plan */}
        <div className={`rounded-xl border p-6 shadow-sm flex flex-col justify-between h-[420px] relative ${
          plan === "pro" 
            ? "border-indigo-650 bg-indigo-500/5 dark:border-indigo-500 dark:bg-indigo-950/5" 
            : "border-zinc-200 bg-white dark:border-zinc-850 dark:bg-zinc-900/30"
        }`}>
          {plan === "pro" && (
            <span className="absolute top-0 right-6 -translate-y-1/2 rounded-full bg-indigo-650 px-2 py-0.5 text-5xs font-bold text-white uppercase tracking-wider">
              Active Plan
            </span>
          )}
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Pro Plan</h3>
                <span className="text-5xs text-zinc-400">Most popular for job seekers</span>
              </div>
            </div>

            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">₹299</span>
              <span className="text-4xs text-zinc-400">/ month</span>
              <span className="text-5xs text-zinc-450 ml-1">($4.99/mo)</span>
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2 text-2xs text-zinc-650 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="font-semibold">Unlimited AI Analyses</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Unlimited Resumes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>AI Cover Letter drafts</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            {plan === "pro" ? (
              <div className="flex justify-between items-center text-4xs">
                <span className="text-zinc-400">July 12, 2026</span>
                <button onClick={() => setShowCancelModal(true)} className="text-red-500 font-bold hover:underline">Cancel</button>
              </div>
            ) : (
              <button
                onClick={() => handleUpgradeClick("pro")}
                disabled={loadingUpgrade}
                className="w-full text-center py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-550 disabled:opacity-50 text-4xs font-bold uppercase text-white shadow-sm"
              >
                {loadingUpgrade ? "Redirecting..." : "Upgrade to Pro"}
              </button>
            )}
          </div>
        </div>

        {/* Card 3: Ultimate Plan */}
        <div className={`rounded-xl border p-6 shadow-sm flex flex-col justify-between h-[420px] relative ${
          plan === "ultimate" 
            ? "border-indigo-650 bg-indigo-500/5 dark:border-indigo-500 dark:bg-indigo-950/5" 
            : "border-zinc-200 bg-white dark:border-zinc-850 dark:bg-zinc-900/30"
        }`}>
          {plan === "ultimate" && (
            <span className="absolute top-0 right-6 -translate-y-1/2 rounded-full bg-indigo-650 px-2 py-0.5 text-5xs font-bold text-white uppercase tracking-wider">
              Active Plan
            </span>
          )}
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Ultimate Tier</h3>
                <span className="text-5xs text-zinc-400">Total interview readiness</span>
              </div>
            </div>

            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">₹599</span>
              <span className="text-4xs text-zinc-400">/ month</span>
              <span className="text-5xs text-zinc-450 ml-1">($9.99/mo)</span>
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2 text-2xs text-zinc-650 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">Everything in Pro</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Live ATS Sandbox Sim</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>1-on-1 AI Interview coach</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            {plan === "ultimate" ? (
              <div className="flex justify-between items-center text-4xs">
                <span className="text-zinc-400">July 12, 2026</span>
                <button onClick={() => setShowCancelModal(true)} className="text-red-500 font-bold hover:underline">Cancel</button>
              </div>
            ) : (
              <button
                onClick={() => handleUpgradeClick("ultimate")}
                disabled={loadingUpgrade}
                className="w-full text-center py-2.5 rounded-lg bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 disabled:opacity-50 text-4xs font-bold uppercase shadow-sm"
              >
                {loadingUpgrade ? "Redirecting..." : "Upgrade to Ultimate"}
              </button>
            )}
          </div>
        </div>

      </div>

      {/* BILLING INVOICES HISTORY TABLE */}
      {plan !== "free" && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/35 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4 flex items-center gap-1.5">
            <Calendar className="h-4.5 w-4.5 text-zinc-400" />
            <span>Billing Invoices</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-2xs">
              <thead>
                <tr className="border-b border-zinc-150 dark:border-zinc-800 text-zinc-400 uppercase text-3xs font-semibold">
                  <th className="py-2 px-4 font-bold">Invoice ID</th>
                  <th className="py-2 px-4 font-bold">Billing Date</th>
                  <th className="py-2 px-4 font-bold">Amount</th>
                  <th className="py-2 px-4 font-bold">Status</th>
                  <th className="py-2 px-4 font-bold">Document</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">{inv.id}</td>
                    <td className="py-3 px-4 text-zinc-500">{inv.date}</td>
                    <td className="py-3 px-4 text-zinc-500">{inv.amount}</td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 text-3xs font-semibold">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toast.success(`Receipt document fetched for ${inv.id}`)}
                        className="rounded border border-zinc-200 px-2 py-1 text-3xs hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-850"
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

      {/* CANCEL SUBSCRIPTION MODAL WITH FEEDBACK FORM */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Cancel Subscription</h2>
              <button 
                onClick={() => setShowCancelModal(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCancelSubscriptionSubmit} className="space-y-4 text-2xs">
              <p className="text-zinc-550 dark:text-zinc-400 leading-normal">
                We are sorry to see you go! Please take a second to tell us why you are canceling so we can improve ResumeIQ:
              </p>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="reason"
                    value="too-expensive"
                    required
                    checked={cancelReason === "too-expensive"}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="text-indigo-600 focus:ring-indigo-500"
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
                    className="text-indigo-600 focus:ring-indigo-500"
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
                    className="text-indigo-600 focus:ring-indigo-500"
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
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Other reasons</span>
                </label>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-850 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="rounded border border-zinc-250 bg-white px-4 py-2 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
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
        <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
        <span className="text-3xs text-zinc-400">Loading Billing panel...</span>
      </div>
    }>
      <BillingContent />
    </Suspense>
  );
}
