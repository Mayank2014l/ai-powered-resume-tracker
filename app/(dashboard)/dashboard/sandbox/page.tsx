"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import { 
  Sparkles, Lock, ChevronRight, CheckCircle2, AlertCircle, 
  Layers, RefreshCw, HelpCircle, Save, FileDown, ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";

export default function SandboxPage() {
  const router = useRouter();
  const { plan } = useUser();
  
  // Guard check: Unlocked for Ultimate & Admin only
  const isUnlocked = plan === "ultimate" || plan === "admin";

  // Sandbox inputs
  const [resumeText, setResumeText] = useState(
    "JOHN DOE\nSoftware Engineer\n\nExperience:\n- Built web applications using HTML and standard Javascript.\n- Collaborated with UI design developers.\n- Maintained server databases."
  );
  
  const [jobDescription, setJobDescription] = useState(
    "Target Job: Senior Frontend Engineer\nRequirements:\nWe are looking for a developer who excels in React, TypeScript, Next.js, and TailwindCSS. Experience with State Management and Web Performance is a big plus."
  );

  // Scoring states
  const [score, setScore] = useState(45);
  const [detectedKeywords, setDetectedKeywords] = useState<string[]>([]);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([
    "React", "TypeScript", "Next.js", "TailwindCSS", "State Management", "Web Performance"
  ]);

  // Checklist updates based on text inclusion
  const keywordsList = [
    { key: "React", weight: 10 },
    { key: "TypeScript", weight: 10 },
    { key: "Next.js", weight: 15 },
    { key: "TailwindCSS", weight: 8 },
    { key: "State Management", weight: 6 },
    { key: "Web Performance", weight: 6 }
  ];

  // Live analyzer logic
  useEffect(() => {
    let currentScore = 40; // Base score
    const detected: string[] = [];
    const missing: string[] = [];

    keywordsList.forEach((item) => {
      // Perform case-insensitive check
      const regex = new RegExp(`\\b${item.key}\\b`, "i");
      if (regex.test(resumeText)) {
        detected.push(item.key);
        currentScore += item.weight;
      } else {
        missing.push(item.key);
      }
    });

    // Experience depth mock check
    if (resumeText.toLowerCase().includes("senior") || resumeText.toLowerCase().includes("architect")) {
      currentScore += 5;
    }
    if (resumeText.split(" ").length > 150) {
      currentScore += 5;
    }

    setScore(Math.min(currentScore, 100));
    setDetectedKeywords(detected);
    setMissingKeywords(missing);
  }, [resumeText]);

  const handleExport = () => {
    toast.success("Optimized resume content copied to clipboard!");
    navigator.clipboard.writeText(resumeText);
  };

  // 1. LOCKED VIEW / UPSELL OVERLAY
  if (!isUnlocked) {
    return (
      <div className="relative min-h-[80vh] flex items-center justify-center p-4">
        {/* Blurred background preview */}
        <div className="absolute inset-0 filter blur-md opacity-25 pointer-events-none select-none overflow-hidden max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div className="h-8 w-48 bg-zinc-350 rounded" />
            <div className="h-10 w-24 bg-zinc-300 rounded" />
          </div>
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8 h-[350px] bg-zinc-200 rounded-xl" />
            <div className="col-span-4 h-[350px] bg-zinc-200 rounded-xl" />
          </div>
        </div>

        {/* Upgrade Card Overlay */}
        <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-250 bg-white p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="h-12 w-12 rounded-full bg-indigo-500/10 text-indigo-650 flex items-center justify-center mx-auto">
            <Lock className="h-6 w-6" />
          </div>

          <div className="space-y-2">
            <span className="rounded-full bg-indigo-550/10 text-indigo-650 px-2.5 py-0.5 text-5xs font-bold uppercase tracking-wider">
              Ultimate Tier Exclusive
            </span>
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white">Live ATS Sandbox</h2>
            <p className="text-3xs text-zinc-550 dark:text-zinc-400 leading-relaxed">
              Tweak your resume details and see your compatibility metrics change in real-time. Our sandbox provides exact keyword matches, structural alerts, and live score updates.
            </p>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-5 space-y-3">
            <button
              onClick={() => router.push("/dashboard/billing")}
              className="w-full inline-flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-550 py-2.5 text-2xs font-semibold text-white transition-all shadow-md shadow-indigo-600/10"
            >
              Upgrade to Ultimate Tier <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </button>
            <button
              onClick={() => router.push("/dashboard/billing")}
              className="text-4xs font-bold text-zinc-500 hover:text-zinc-700 block mx-auto hover:underline"
            >
              Compare subscription advantages
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. UNLOCKED WORKING SANDBOX VIEW
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-150 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Live ATS Sandbox
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Edit your resume content in real-time and watch your compatibility metrics adapt immediately.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 px-4 py-2 text-xs font-semibold shadow-sm transition-all"
          >
            <FileDown className="mr-1.5 h-4.5 w-4.5" /> Copy Copywriter Text
          </button>
        </div>
      </div>

      {/* CORE WORKSPACE SPLIT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Live Resume Text Editor (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/30 flex flex-col justify-between h-[500px]">
          <div className="space-y-3 flex-grow flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
              <h2 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider block">
                Resume Content Canvas
              </h2>
              <span className="text-4xs text-zinc-400 font-semibold uppercase">{resumeText.split(" ").length} Words</span>
            </div>
            
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full flex-grow rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs font-mono focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-850 dark:bg-zinc-950 dark:text-white min-h-[350px]"
              placeholder="Paste your resume raw details and begin editing..."
            />
          </div>
        </div>

        {/* Right Side: Job Description & Live Metrics (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Box 1: Dynamic ATS Score Dial */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-850 dark:bg-zinc-900/30 shadow-sm flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-4xs font-bold text-zinc-400 uppercase tracking-wider block">Live Compatibility Score</span>
              <p className="text-4xs text-zinc-500 dark:text-zinc-400 leading-normal">
                Score adjusts as you add keywords or experience credentials. Target &gt;85% matching rate.
              </p>
            </div>

            {/* Circular dial meter */}
            <div className="relative h-20 w-20 shrink-0 flex items-center justify-center">
              <svg className="h-full w-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  strokeWidth="6"
                  stroke={theme => "rgba(229,231,235,0.3)"}
                  fill="transparent"
                  className="stroke-zinc-200 dark:stroke-zinc-800"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 34}
                  strokeDashoffset={2 * Math.PI * 34 * (1 - score / 100)}
                  strokeLinecap="round"
                  stroke={score >= 80 ? "#10B981" : "#F59E0B"}
                  fill="transparent"
                  className="transition-all duration-300"
                />
              </svg>
              <span className="absolute text-sm font-extrabold text-zinc-900 dark:text-white">
                {score}%
              </span>
            </div>
          </div>

          {/* Box 2: Job description & keywords check */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/30 shadow-sm flex-grow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  Live Keywords checklist
                </h3>
              </div>

              {/* Suggestions items */}
              <div className="space-y-3 text-2xs">
                {keywordsList.map((item) => {
                  const detected = detectedKeywords.includes(item.key);
                  return (
                    <div 
                      key={item.key} 
                      className={`flex justify-between items-center p-2 rounded-lg border transition-all ${
                        detected 
                          ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-zinc-50 border-zinc-150 text-zinc-550 dark:bg-zinc-950 dark:border-zinc-850 dark:text-zinc-400"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className={`h-4 w-4 shrink-0 ${detected ? "text-emerald-500" : "text-zinc-300"}`} />
                        <span>{item.key}</span>
                      </span>
                      <span className="text-4xs font-semibold">+{item.weight}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-indigo-500/5 border border-indigo-600/10 rounded-lg flex items-start gap-2 mt-4 text-indigo-600 dark:text-indigo-400 text-4xs leading-relaxed">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>
                <strong>Tip:</strong> Incorporate the missing keywords in a natural context (e.g. <em>"Leveraged React and Next.js to construct high performance..."</em>) to watch the score grow.
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
