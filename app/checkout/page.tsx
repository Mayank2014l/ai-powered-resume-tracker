"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  CreditCard, ShieldCheck, ArrowLeft, Loader2, Lock, 
  QrCode, Building, Wallet, Check, AlertCircle, Copy, CheckCircle
} from "lucide-react";
import { toast } from "sonner";

type PaymentMethod = "card" | "upi" | "netbanking" | "wallet";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Payment States
  const [method, setMethod] = useState<PaymentMethod>("upi"); // Default to UPI as requested
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState<"usd" | "inr">("inr");
  
  // Card Inputs
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [cardBrand, setCardBrand] = useState<"visa" | "mastercard" | "rupay" | "unknown">("unknown");

  // UPI Inputs
  const [upiId, setUpiId] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 min
  
  // Netbanking Inputs
  const [selectedBank, setSelectedBank] = useState("");

  // Wallet Inputs
  const [selectedWallet, setSelectedWallet] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  // QR Code Timer
  useEffect(() => {
    if (method !== "upi") return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(interval);
  }, [method]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    
    // Simple Card Brand Identification
    if (formatted.startsWith("4")) {
      setCardBrand("visa");
    } else if (formatted.startsWith("5")) {
      setCardBrand("mastercard");
    } else if (formatted.startsWith("6") || formatted.startsWith("8")) {
      setCardBrand("rupay");
    } else {
      setCardBrand("unknown");
    }

    const matches = formatted.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    setCardNumber(parts.length > 0 ? parts.join(" ") : formatted);
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  // Trigger Mock Success redirection
  const triggerSuccess = (toastId: string | number, paymentDetails: string) => {
    setTimeout(() => {
      toast.dismiss(toastId);
      toast.success(`Payment authorized successfully via ${paymentDetails}!`);
      router.push(`/dashboard/billing?success=true&plan=${plan}&session_id=mock_stripe_session_${Date.now()}`);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (method === "card") {
      if (cardNumber.replace(/\s/g, "").length < 16) {
        toast.error("Please enter a valid 16-digit card number.");
        setLoading(false);
        return;
      }
      if (expiry.length < 5) {
        toast.error("Please enter a valid expiry date (MM/YY).");
        setLoading(false);
        return;
      }
      if (cvv.length < 3) {
        toast.error("Please enter a valid CVV.");
        setLoading(false);
        return;
      }
      if (!name) {
        toast.error("Please enter cardholder name.");
        setLoading(false);
        return;
      }

      const toastId = toast.loading("Processing card authorization secure token...");
      triggerSuccess(toastId, `Card (${cardBrand.toUpperCase()})`);
    }

    else if (method === "upi") {
      if (!upiId || !upiId.includes("@")) {
        toast.error("Please enter a valid UPI ID (e.g. user@okaxis).");
        setLoading(false);
        return;
      }
      const toastId = toast.loading(`Sending collect request to ${upiId}...`);
      triggerSuccess(toastId, `UPI (${upiId})`);
    }

    else if (method === "netbanking") {
      if (!selectedBank) {
        toast.error("Please select your bank.");
        setLoading(false);
        return;
      }
      const toastId = toast.loading(`Redirecting to secure ${selectedBank} Net Banking portal...`);
      triggerSuccess(toastId, `Netbanking (${selectedBank})`);
    }

    else if (method === "wallet") {
      if (!selectedWallet) {
        toast.error("Please select your wallet.");
        setLoading(false);
        return;
      }
      if (mobileNumber.length < 10) {
        toast.error("Please enter a valid 10-digit mobile number.");
        setLoading(false);
        return;
      }
      const toastId = toast.loading(`Sending OTP to ${mobileNumber} for ${selectedWallet}...`);
      triggerSuccess(toastId, `${selectedWallet} Wallet`);
    }
  };

  const handleConfirmQRTransfer = () => {
    setLoading(true);
    const toastId = toast.loading("Checking transaction logs for UPI ID 8076973546@nyes...");
    
    // Play simulation of transaction confirmation
    setTimeout(() => {
      triggerSuccess(toastId, "Direct UPI QR Scan (8076973546@nyes)");
    }, 1500);
  };

  const popularBanks = [
    { id: "sbi", name: "State Bank of India" },
    { id: "hdfc", name: "HDFC Bank" },
    { id: "icici", name: "ICICI Bank" },
    { id: "axis", name: "Axis Bank" },
    { id: "kotak", name: "Kotak Mahindra Bank" },
    { id: "pnb", name: "Punjab National Bank" },
    { id: "bob", name: "Bank of Baroda" },
    { id: "union", name: "Union Bank of India" },
    { id: "canara", name: "Canara Bank" },
    { id: "idfc", name: "IDFC FIRST Bank" },
    { id: "indusind", name: "IndusInd Bank" },
    { id: "yes", name: "YES Bank" }
  ];

  const wallets = [
    { id: "gpay", name: "Google Pay" },
    { id: "phonepe", name: "PhonePe" },
    { id: "paytm", name: "Paytm" },
    { id: "navi", name: "Navi" },
    { id: "fampay", name: "FamPay" },
    { id: "amazonpay", name: "Amazon Pay" },
    { id: "cred", name: "CRED" }
  ];

  const plan = searchParams.get("plan") === "ultimate" ? "ultimate" : "pro";
  const priceAmount = plan === "ultimate"
    ? (currency === "usd" ? "$9.99" : "₹599")
    : (currency === "usd" ? "$4.99" : "₹299");

  // Real, Scannable UPI URL matching user ID 8076973546@nyes
  const upiMerchantId = "8076973546@nyes";
  const upiAmount = plan === "ultimate"
    ? (currency === "inr" ? "599" : "10")
    : (currency === "inr" ? "299" : "5"); // UPI works best with INR
  const upiString = `upi://pay?pa=${upiMerchantId}&pn=ResumeIQ&am=${upiAmount}&cu=INR&tn=ResumeIQ%20${plan === "ultimate" ? "Ultimate" : "Pro"}%20Upgrade`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(upiString)}`;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row items-stretch text-zinc-900 dark:text-zinc-50 font-sans">
      
      {/* Left Column: Order Summary */}
      <div className="md:w-5/12 bg-zinc-900 text-zinc-100 p-8 md:p-16 flex flex-col justify-between border-r border-zinc-800">
        <div className="space-y-8">
          <button 
            onClick={() => router.push("/dashboard/billing")}
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs font-semibold"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">ResumeIQ</span>
            </div>
            
            <span className="text-4xs uppercase tracking-wider text-zinc-455 font-bold block">Subscribe to Pro Access</span>
            
            {/* Currency Switcher */}
            <div className="flex bg-zinc-850 p-1 rounded-lg w-fit border border-zinc-700/50">
              <button 
                onClick={() => setCurrency("inr")}
                className={`px-3 py-1 text-5xs font-bold rounded ${currency === "inr" ? "bg-indigo-600 text-white" : "text-zinc-400"}`}
              >
                INR (₹)
              </button>
              <button 
                onClick={() => setCurrency("usd")}
                className={`px-3 py-1 text-5xs font-bold rounded ${currency === "usd" ? "bg-indigo-600 text-white" : "text-zinc-400"}`}
              >
                USD ($)
              </button>
            </div>

            <div className="flex items-baseline gap-1.5 mt-2 animate-in fade-in duration-200">
              <span className="text-4xl font-extrabold text-white">{priceAmount}</span>
              <span className="text-xs text-zinc-400">/ month</span>
            </div>
          </div>

          {/* Line items list */}
          <div className="border-t border-zinc-800 pt-6 space-y-4 text-xs">
            <div className="flex justify-between items-center text-zinc-300">
              <span>ResumeIQ Pro Plan (Recurring)</span>
              <span className="font-semibold text-white">{priceAmount}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-400 text-2xs">
              <span>Taxes & Gateway Processing</span>
              <span>Included</span>
            </div>
            <div className="border-t border-zinc-800 pt-4 flex justify-between items-center text-sm font-bold text-white">
              <span>Total Due Today</span>
              <span>{priceAmount}</span>
            </div>
          </div>
        </div>

        {/* Footer assurances */}
        <div className="space-y-4 pt-8 md:pt-0">
          <div className="flex items-center gap-2 text-2xs text-zinc-400">
            <Lock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Guaranteed Safe & Secure Checkout</span>
          </div>
          <p className="text-5xs text-zinc-500 leading-normal">
            Your billing period begins immediately. Transaction processing is completed securely. Cancel anytime via your user portal dashboard.
          </p>
        </div>
      </div>

      {/* Right Column: Interactive payment tabs and inputs */}
      <div className="flex-1 p-6 md:p-12 flex flex-col justify-center items-center overflow-y-auto">
        <div className="w-full max-w-lg space-y-6">
          <div>
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white">Choose Payment Method</h2>
            <p className="text-4xs text-zinc-500 dark:text-zinc-400 mt-1">
              Select one of our simulated checkout integrations to upgrade your subscription.
            </p>
          </div>

          {/* METHOD SELECTION TABS */}
          <div className="grid grid-cols-4 gap-2 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-xl border border-zinc-200/50 dark:border-zinc-850">
            <button
              onClick={() => setMethod("upi")}
              className={`flex flex-col items-center justify-center py-2.5 rounded-lg text-center transition-all ${
                method === "upi"
                  ? "bg-white dark:bg-zinc-800 text-indigo-650 dark:text-white shadow-sm border border-zinc-200/40 dark:border-zinc-700/30"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
              }`}
            >
              <QrCode className="h-4 w-4 mb-1" />
              <span className="text-5xs font-bold uppercase">UPI / QR</span>
            </button>

            <button
              onClick={() => setMethod("card")}
              className={`flex flex-col items-center justify-center py-2.5 rounded-lg text-center transition-all ${
                method === "card" 
                  ? "bg-white dark:bg-zinc-800 text-indigo-650 dark:text-white shadow-sm border border-zinc-200/40 dark:border-zinc-700/30"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
              }`}
            >
              <CreditCard className="h-4 w-4 mb-1" />
              <span className="text-5xs font-bold uppercase">Card</span>
            </button>

            <button
              onClick={() => setMethod("netbanking")}
              className={`flex flex-col items-center justify-center py-2.5 rounded-lg text-center transition-all ${
                method === "netbanking"
                  ? "bg-white dark:bg-zinc-800 text-indigo-650 dark:text-white shadow-sm border border-zinc-200/40 dark:border-zinc-700/30"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
              }`}
            >
              <Building className="h-4 w-4 mb-1" />
              <span className="text-5xs font-bold uppercase">Net Banking</span>
            </button>

            <button
              onClick={() => setMethod("wallet")}
              className={`flex flex-col items-center justify-center py-2.5 rounded-lg text-center transition-all ${
                method === "wallet"
                  ? "bg-white dark:bg-zinc-800 text-indigo-650 dark:text-white shadow-sm border border-zinc-200/40 dark:border-zinc-700/30"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
              }`}
            >
              <Wallet className="h-4 w-4 mb-1" />
              <span className="text-5xs font-bold uppercase">Wallets</span>
            </button>
          </div>

          {/* DYNAMIC FORMS PANEL */}
          <div className="bg-white dark:bg-zinc-900/40 rounded-xl border border-zinc-200 dark:border-zinc-850 p-6 min-h-[300px] flex flex-col justify-between">
            <div className="text-2xs flex-grow">
              
              {/* 1. UPI / QR Form (REAL SCANNING COMPATIBLE) */}
              {method === "upi" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  
                  {/* Mock UPI QR Code Panel */}
                  <div className="flex flex-col sm:flex-row gap-5 items-center p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 shadow-sm">
                    <div className="bg-white p-3 rounded-lg border border-zinc-200 shadow-sm shrink-0 flex items-center justify-center">
                      {/* Real dynamic scannable QR Code */}
                      <img 
                        src={qrCodeImageUrl} 
                        alt="UPI Payment QR Code" 
                        className="h-28 w-28 object-contain"
                      />
                    </div>

                    <div className="space-y-1.5 text-center sm:text-left flex-grow">
                      <span className="text-3xs font-semibold text-zinc-400 block uppercase">Scan & Pay Direct</span>
                      <strong className="text-xs font-bold text-zinc-800 dark:text-white block select-all">
                        {upiMerchantId}
                      </strong>
                      <span className="text-4xs text-zinc-400 leading-normal block">
                        Scan with GPay, PhonePe, Paytm, FamPay, CRED, or BHIM. Pre-filled with amount: <strong>{priceAmount}</strong>.
                      </span>
                      <span className="font-mono text-3xs font-bold text-indigo-600 dark:text-indigo-400 block mt-1">
                        Expires in: {formatTime(timerSeconds)}
                      </span>

                      {/* Confirm payment scanner action */}
                      <button
                        type="button"
                        onClick={handleConfirmQRTransfer}
                        disabled={loading}
                        className="mt-3 rounded-lg bg-indigo-600 px-4 py-1.5 text-4xs font-bold text-white hover:bg-indigo-500 flex items-center justify-center gap-1.5 transition-all shadow-sm w-full sm:w-auto"
                      >
                        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "I've paid, Confirm payment"}
                      </button>
                    </div>
                  </div>

                  <div className="relative flex py-2 items-center justify-center">
                    <div className="flex-grow border-t border-zinc-150 dark:border-zinc-800"></div>
                    <span className="flex-shrink mx-3 text-4xs text-zinc-400 uppercase font-semibold">Or enter custom UPI ID</span>
                    <div className="flex-grow border-t border-zinc-150 dark:border-zinc-800"></div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-1">
                    <label className="text-3xs font-semibold text-zinc-450 uppercase block">Enter VPA / UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@upi or username@okaxis"
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-mono"
                    />
                  </form>
                </div>
              )}

              {/* 2. Credit/Debit Card Form */}
              {method === "card" && (
                <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-150">
                  <div className="space-y-1">
                    <label className="text-3xs font-semibold text-zinc-450 uppercase block">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-semibold text-zinc-450 uppercase block">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        placeholder="4242 4242 4242 4242"
                        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-10 pr-3 py-2 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-mono tracking-wider"
                      />
                      <div className="absolute inset-y-0 left-3.5 flex items-center">
                        <CreditCard className="h-4 w-4 text-zinc-400" />
                      </div>
                      {cardBrand !== "unknown" && (
                        <span className="absolute inset-y-0 right-3.5 flex items-center text-4xs font-bold text-indigo-500 uppercase font-mono">
                          {cardBrand}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-3xs font-semibold text-zinc-450 uppercase block">Expiration Date</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white text-center font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-3xs font-semibold text-zinc-455 uppercase block">CVV</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="123"
                        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white text-center font-mono"
                      />
                    </div>
                  </div>
                </form>
              )}

              {/* 3. Net Banking Form */}
              {method === "netbanking" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <span className="text-3xs font-semibold text-zinc-455 uppercase block">Select your Bank</span>
                  
                  {/* Expanded Bank Grid */}
                  <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                    {popularBanks.map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setSelectedBank(bank.name)}
                        className={`p-2.5 rounded-lg border text-left font-semibold text-3xs transition-all flex items-center gap-2 ${
                          selectedBank === bank.name 
                            ? "border-indigo-600 bg-indigo-550/5 text-indigo-650 dark:border-indigo-500 dark:bg-indigo-950/10 dark:text-indigo-400"
                            : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-750 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-350 dark:hover:bg-zinc-900"
                        }`}
                      >
                        <Building className={`h-3.5 w-3.5 shrink-0 ${selectedBank === bank.name ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400"}`} />
                        <span className="truncate">{bank.name}</span>
                      </button>
                    ))}
                  </div>

                  {selectedBank && (
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-4xs">
                      <Check className="h-4 w-4 shrink-0" />
                      <span>Ready to authenticate connection to secure {selectedBank} gateway.</span>
                    </div>
                  )}
                </div>
              )}

              {/* 4. Wallet Form */}
              {method === "wallet" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <span className="text-3xs font-semibold text-zinc-455 uppercase block">Select Wallet App</span>
                  
                  {/* Expanded Wallet Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {wallets.map((wallet) => (
                      <button
                        key={wallet.id}
                        type="button"
                        onClick={() => setSelectedWallet(wallet.name)}
                        className={`py-2 rounded-lg border text-center text-3xs font-bold transition-all ${
                          selectedWallet === wallet.name 
                            ? "border-indigo-600 bg-indigo-550/5 text-indigo-650 dark:border-indigo-500 dark:bg-indigo-950/10 dark:text-indigo-400 shadow-sm"
                            : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-350 dark:hover:bg-zinc-900"
                        }`}
                      >
                        {wallet.name}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-semibold text-zinc-450 uppercase block">Linked Mobile Number</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-zinc-450 font-bold">
                        +91
                      </span>
                      <input
                        type="text"
                        maxLength={10}
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="98765 43210"
                        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-10 pr-3 py-2 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* ACTION BUTTON (Universal) */}
            <div className="mt-6">
              {method !== "upi" || upiId ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-bold text-white transition-all disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-indigo-600/10"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" /> Authorizing Payment...
                    </>
                  ) : (
                    <>
                      Pay {priceAmount} & Subscribe
                    </>
                  )}
                </button>
              ) : (
                <div className="text-center text-4xs text-zinc-400">
                  Scan the dynamic UPI QR Code to execute direct transfer or enter custom VPA ID above.
                </div>
              )}
            </div>

          </div>

          {/* SECURE ASSURANCE WIDGET */}
          <div className="flex gap-2.5 items-start p-3 bg-indigo-500/5 dark:bg-indigo-950/10 border border-indigo-600/10 dark:border-indigo-500/20 rounded-xl">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-3xs font-semibold text-zinc-800 dark:text-zinc-200">Payment Routing Info</span>
              <p className="text-4xs text-zinc-450 dark:text-zinc-400 leading-normal">
                QR payments are generated dynamically as a localized UPI payment intent link mapping directly to <strong className="select-all">8076973546@nyes</strong>.
              </p>
            </div>
          </div>

          {/* PAYMENT SUPPORT HELPLINE */}
          <div className="flex gap-2.5 items-start p-3 bg-amber-500/5 dark:bg-amber-955/10 border border-amber-600/15 dark:border-amber-500/20 rounded-xl">
            <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-left">
              <span className="text-3xs font-semibold text-zinc-850 dark:text-zinc-250">Payment Support</span>
              <p className="text-4xs text-zinc-500 dark:text-zinc-400 leading-normal">
                Agar payment hone ke baad bhi plan activate nahi hota, to payment screenshot aur transaction ID ke saath details **support@resumeiq.co** par send karein. Hum immediately check karke update kar denge.
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen flex-col items-center justify-center gap-2 bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
        <span className="text-3xs text-zinc-400">Loading Secure checkout...</span>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
