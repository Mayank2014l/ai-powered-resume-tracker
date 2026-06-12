"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import { 
  Sparkles, Lock, ArrowUpRight, MessageSquare, Send, 
  Loader2, Award, ThumbsUp, AlertCircle, RefreshCw, X
} from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  sender: "recruiter" | "user";
  text: string;
}

export default function InterviewerPage() {
  const router = useRouter();
  const { plan } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Access Control check
  const isUnlocked = plan === "ultimate" || plan === "admin";

  // Interview state: 'setup' | 'active' | 'feedback'
  const [stage, setStage] = useState<"setup" | "active" | "feedback">("setup");
  
  // Setup inputs
  const [targetRole, setTargetRole] = useState("Senior React Engineer");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");

  // Chat conversation state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Dynamic feedback report
  const [feedbackReport, setFeedbackReport] = useState<any>(null);

  // Simulated questions list
  const interviewQuestions = [
    {
      q: "Hello! Welcome to the interview. To start off, could you introduce yourself and tell me a bit about your experience with Web Development?",
      hint: "Briefly outline your background, target stack, and years of experience."
    },
    {
      q: `Great. Since you are interviewing for a ${targetRole} position, how do you go about optimizing web application performance? What tools do you use?`,
      hint: "Talk about image optimizations, bundle splitting, lazy loading, and Core Web Vitals audit metrics."
    },
    {
      q: "Excellent. Can you tell me about a challenging technical bug or architecture issue you solved recently? What was your approach?",
      hint: "Use the STAR method: Situation, Task, Action, and Result."
    },
    {
      q: "Thanks for sharing that. Finally, what are you looking for in your next role, and why are you interested in joining our engineering team?",
      hint: "Align your values with learning, development speed, and developer culture."
    }
  ];

  // Auto scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  const handleStartInterview = () => {
    setStage("active");
    setCurrentQuestionIndex(0);
    setIsTyping(true);

    setTimeout(() => {
      setChatHistory([
        { sender: "recruiter", text: interviewQuestions[0].q }
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSendResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMsg = userInput.trim();
    setUserInput("");

    // 1. Add user response to timeline
    setChatHistory(prev => [...prev, { sender: "user", text: userMsg }]);

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < interviewQuestions.length) {
      // 2. Load next recruiter question
      setCurrentQuestionIndex(nextIndex);
      setIsTyping(true);

      setTimeout(() => {
        setChatHistory(prev => [
          ...prev, 
          { sender: "recruiter", text: interviewQuestions[nextIndex].q }
        ]);
        setIsTyping(false);
      }, 2000);
    } else {
      // 3. Process mock AI feedback scorecard
      setIsTyping(true);
      setTimeout(() => {
        generateMockFeedback();
        setStage("feedback");
        setIsTyping(false);
      }, 2500);
    }
  };

  const generateMockFeedback = () => {
    setFeedbackReport({
      grade: difficulty === "Hard" ? "A-" : "A",
      overallRating: 92,
      communication: 95,
      technicalDepth: 89,
      problemSolving: 90,
      strengths: [
        "Structured communication pattern (good STAR framework usage).",
        "Clear technical articulation of React caching mechanisms.",
        "Positive cultural alignment and enthusiastic tone."
      ],
      critiques: [
        "Explain the 'why' behind using specific bundle optimizations (e.g. Next.js dynamic routing vs standard import splitting).",
        "Provide direct metrics when mentioning bundle reduction (e.g., 'reduced bundle size by 35%').",
        "Explain code testing parameters or coverage margins."
      ]
    });
  };

  const handleRestart = () => {
    setChatHistory([]);
    setStage("setup");
    setFeedbackReport(null);
  };

  // 1. LOCKED VIEW / UPSELL OVERLAY
  if (!isUnlocked) {
    return (
      <div className="relative min-h-[80vh] flex items-center justify-center p-4">
        {/* Blurred background preview */}
        <div className="absolute inset-0 filter blur-md opacity-25 pointer-events-none select-none overflow-hidden max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div className="h-8 w-48 bg-zinc-355 rounded" />
            <div className="h-10 w-24 bg-zinc-300 rounded" />
          </div>
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-80 bg-zinc-200 rounded mb-4" />
            <div className="h-4 w-96 bg-zinc-200 rounded" />
          </div>
        </div>

        {/* Upgrade Card Overlay */}
        <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-250 bg-white p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="h-12 w-12 rounded-full bg-indigo-500/10 text-indigo-650 flex items-center justify-center mx-auto">
            <MessageSquare className="h-6 w-6" />
          </div>

          <div className="space-y-2">
            <span className="rounded-full bg-indigo-550/10 text-indigo-650 px-2.5 py-0.5 text-5xs font-bold uppercase tracking-wider">
              Ultimate Tier Exclusive
            </span>
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white">AI Interview Coach</h2>
            <p className="text-3xs text-zinc-550 dark:text-zinc-400 leading-relaxed">
              Practice 1-on-1 mock interviews simulated by our AI recruitment bot. Get personalized questions based on target roles, custom advice metrics, and comprehensive scores.
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

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-zinc-150 dark:border-zinc-800 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            AI Interview Coach
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Practice mock interviews tailored to your target roles and get critical feedback.
          </p>
        </div>

        {stage !== "setup" && (
          <button
            onClick={handleRestart}
            className="rounded-lg p-2 border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-850 text-2xs font-semibold flex items-center gap-1"
          >
            <X className="h-4 w-4" /> Exit Interview
          </button>
        )}
      </div>

      {/* 1. SETUP STAGE PANEL */}
      {stage === "setup" && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/30 max-w-xl mx-auto shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-indigo-500" />
            <span>Interview Setup Settings</span>
          </h2>

          <div className="space-y-4 text-2xs">
            {/* Target Role Input */}
            <div className="space-y-1">
              <label className="text-3xs font-semibold text-zinc-450 uppercase block">Target Role / Title</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior React Engineer"
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-2xs focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-850 dark:bg-zinc-950 dark:text-white"
              />
            </div>

            {/* Difficulty Select */}
            <div className="space-y-1">
              <label className="text-3xs font-semibold text-zinc-450 uppercase block">Interview Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {(["Easy", "Medium", "Hard"] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`rounded-lg border py-2 text-center font-bold transition-all ${
                      difficulty === diff
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                        : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-350 dark:hover:bg-zinc-900"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleStartInterview}
              className="w-full inline-flex items-center justify-center rounded-lg bg-indigo-650 hover:bg-indigo-600 py-3 text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/10"
            >
              Start Practice Session <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. ACTIVE CHAT WORKSPACE */}
      {stage === "active" && (
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-850 dark:bg-zinc-900/30 shadow-sm flex flex-col h-[550px]">
          {/* Header tracker */}
          <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/20 rounded-t-xl">
            <span className="text-3xs font-bold text-zinc-450 uppercase tracking-wider">
              {targetRole} ({difficulty} Mode)
            </span>
            <span className="text-3xs font-semibold text-indigo-650 dark:text-indigo-400">
              Progress: Question {Math.min(currentQuestionIndex + 1, interviewQuestions.length)} of {interviewQuestions.length}
            </span>
          </div>

          {/* Conversation feeds */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 bg-zinc-50/20 dark:bg-zinc-950/10">
            {chatHistory.map((msg, i) => (
              <div 
                key={i} 
                className={`flex items-start gap-3 max-w-[80%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-4xs font-extrabold uppercase shrink-0 ${
                  msg.sender === "user" 
                    ? "bg-indigo-600 text-white" 
                    : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                }`}>
                  {msg.sender === "user" ? user?.name?.[0] || "U" : "AI"}
                </div>

                <div className={`rounded-xl p-3.5 text-2xs leading-relaxed ${
                  msg.sender === "user" 
                    ? "bg-indigo-600 text-white shadow-sm rounded-tr-none" 
                    : "bg-white border border-zinc-200 dark:border-zinc-850 dark:bg-zinc-900 shadow-sm rounded-tl-none text-zinc-800 dark:text-zinc-200"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start gap-3 max-w-[80%]">
                <div className="h-8 w-8 rounded-full bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 flex items-center justify-center text-4xs font-extrabold uppercase shrink-0">
                  AI
                </div>
                <div className="rounded-xl p-3 border border-zinc-200 dark:border-zinc-855 dark:bg-zinc-900 flex gap-1 items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Form response entry */}
          <div className="p-4 border-t border-zinc-150 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-b-xl">
            {currentQuestionIndex < interviewQuestions.length && !isTyping && (
              <div className="text-5xs text-zinc-450 uppercase mb-2 block tracking-wider">
                Hint: {interviewQuestions[currentQuestionIndex].hint}
              </div>
            )}
            <form onSubmit={handleSendResponse} className="flex gap-3">
              <input
                type="text"
                disabled={isTyping}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your detailed interview response here..."
                className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-2xs focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              />
              <button
                type="submit"
                disabled={isTyping || !userInput.trim()}
                className="rounded-lg bg-indigo-650 hover:bg-indigo-600 px-4 py-2.5 text-white disabled:opacity-50 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. PERFORMANCE FEEDBACK SCREEN */}
      {stage === "feedback" && feedbackReport && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Card header */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/35 shadow-sm space-y-6 text-center max-w-xl mx-auto">
            <div className="h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto text-xl font-black">
              {feedbackReport.grade}
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-zinc-950 dark:text-white">Interview Assessment Compiled</h2>
              <p className="text-3xs text-zinc-550 dark:text-zinc-400">
                Performance rating computed across core metrics relative to the target role {targetRole}.
              </p>
            </div>

            {/* Assessment split grids */}
            <div className="grid grid-cols-3 gap-4 border-t border-b border-zinc-100 dark:border-zinc-800 py-4 text-center">
              <div>
                <span className="text-5xs text-zinc-450 uppercase block font-semibold">Communication</span>
                <strong className="text-md font-bold block mt-0.5">{feedbackReport.communication}%</strong>
              </div>
              <div>
                <span className="text-5xs text-zinc-455 uppercase block font-semibold">Technical depth</span>
                <strong className="text-md font-bold block mt-0.5">{feedbackReport.technicalDepth}%</strong>
              </div>
              <div>
                <span className="text-5xs text-zinc-455 uppercase block font-semibold">Problem solving</span>
                <strong className="text-md font-bold block mt-0.5">{feedbackReport.problemSolving}%</strong>
              </div>
            </div>

            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-650 hover:underline"
            >
              <RefreshCw className="h-4 w-4" /> Restart Interview Practice
            </button>
          </div>

          {/* Critiques list details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* Strengths card */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/30 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                <ThumbsUp className="h-4.5 w-4.5" /> Core Strengths
              </h3>
              <ul className="space-y-3.5 text-2xs text-zinc-650 dark:text-zinc-350 list-disc list-inside leading-relaxed">
                {feedbackReport.strengths.map((str: string, i: number) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            </div>

            {/* Improvement critiques card */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/30 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                <AlertCircle className="h-4.5 w-4.5" /> Key Critiques
              </h3>
              <ul className="space-y-3.5 text-2xs text-zinc-650 dark:text-zinc-350 list-disc list-inside leading-relaxed">
                {feedbackReport.critiques.map((crit: string, i: number) => (
                  <li key={i}>{crit}</li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
