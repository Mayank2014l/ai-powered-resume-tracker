"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useUser } from "@/hooks/use-user";
import { useAnalyses } from "@/hooks/use-analyses";
import { CustomUploader } from "@/components/custom-uploader";
import { 
  Sparkles, FileText, UploadCloud, Globe, Cpu, FileSearch,
  CheckCircle2, AlertTriangle, ArrowRight, FileCheck, XCircle, Info,
  Trash2, Filter, Loader2, ArrowDownToLine, Zap, ListFilter, ShieldCheck, ChevronRight, Copy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Resume, Analysis } from "@/types";
import { useSearchParams } from "next/navigation";

interface ATSResult {
  detectedName: string;
  atsScore: number;
  wordCount: number;
  issues: { severity: "high" | "medium" | "low"; issue: string; fix: string }[];
  strengths: string[];
  atsTips: string[];
  sectionsFound: Record<string, boolean>;
  resumeLength: "short" | "ideal" | "long";
}

function AnalyzerContent() {
  const searchParams = useSearchParams();
  const queryResumeId = searchParams.get("resumeId");
  const { plan } = useUser();
  const { analyses, loading: analysesLoading, analyze } = useAnalyses();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumesLoading, setResumesLoading] = useState(true);

  // Input states
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [jdUrl, setJdUrl] = useState<string>("");
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Results view: either full JD Analysis or standalone ATS Audit
  const [currentReport, setCurrentReport] = useState<Analysis | null>(null);
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [activeTab, setActiveTab] = useState<"match" | "ats">("match");
  
  // History table filters
  const [searchFilter, setSearchFilter] = useState("");

  const fetchResumes = async () => {
    try {
      const res = await fetch("/api/resumes");
      if (res.ok) {
        const data = await res.json();
        setResumes(data);
        if (queryResumeId && data.some((r: any) => r.id === queryResumeId)) {
          setSelectedResumeId(queryResumeId);
        } else if (data.length > 0) {
          setSelectedResumeId(data[0].id);
        }
      }
    } catch (e) {
      toast.error("Failed to load your resumes.");
    } finally {
      setResumesLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [queryResumeId]);

  const handleUrlFetch = async () => {
    if (!jdUrl) {
      toast.warning("Please enter a valid job URL first.");
      return;
    }
    setFetchingUrl(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setJobDescription(`ROLE: Senior Full Stack Developer (Next.js & TypeScript)\n\nWe are looking for a Senior Developer to own frontend architectures and integrate complex payments and subscription models.\n\nREQUIREMENTS:\n- 4+ years with React and modern SSR frameworks like Next.js.\n- Strong expertise in TypeScript, Node.js, and Postgres.\n- Experience configuring database ORMs (Prisma preferred).\n- Deep understanding of Stripe integrations and payment flows.\n- Mastery of Tailwind CSS layouts.\n- Experience with GraphQL, Docker, and CI/CD pipelines.`);
    toast.success("Job description template loaded!");
    setFetchingUrl(false);
  };

  const handleRunAudit = async () => {
    if (!selectedResumeId) {
      toast.error("Please upload or select a resume first.");
      return;
    }

    setAnalyzing(true);
    setCurrentReport(null);
    setAtsResult(null);

    const hasJD = jobDescription && jobDescription.trim().length >= 20;

    try {
      if (hasJD) {
        // Run full semantic match against JD
        const report = await analyze(selectedResumeId, jobDescription);
        setCurrentReport(report);
        setActiveTab("match");
        toast.success("Job match analysis complete!");
      } else {
        // Run general ATS Structure & Quality check
        const res = await fetch("/api/resume-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeId: selectedResumeId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setAtsResult(data);
        setActiveTab("ats");
        toast.success("ATS Quality audit complete!");
      }
    } catch (err: any) {
      toast.error(err.message || "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExportPDF = () => {
    toast.info("Generating PDF report...");
    setTimeout(() => {
      window.print();
    }, 800);
  };

  const filteredHistory = analyses
    .filter(a => {
      const jdMatch = a.jobDescription.toLowerCase().includes(searchFilter.toLowerCase());
      const fileMatch = a.resume?.filename.toLowerCase().includes(searchFilter.toLowerCase()) || false;
      return jdMatch || fileMatch;
    })
    .slice(0, 10);

  const isJDProvided = jobDescription.trim().length >= 20;

  return (
    <div className="space-y-8 max-w-7xl mx-auto print:bg-white print:p-0">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileSearch className="h-6 w-6" />
            </span>
            Analyze Resume
          </h1>
          <p className="mt-1.5 text-sm text-gray-400">
            Upload your resume and optionally paste a job description for instant ATS quality audits, keyword gaps, and semantic match scoring.
          </p>
        </div>
      </div>

      {/* INPUT CONTROLS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:hidden">
        
        {/* Left Side: Upload & Select (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-graphite-border bg-graphite-surface p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-b border-graphite-border pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-emerald-400" />
                <span>1. Select or Upload Resume</span>
              </h2>
            </div>

            {/* Resume Selector */}
            {resumes.length > 0 && (
              <div className="space-y-2">
                <label className="text-3xs font-semibold text-gray-400 uppercase tracking-wider">Select Existing Resume</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {resumes.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setSelectedResumeId(r.id);
                        setCurrentReport(null);
                        setAtsResult(null);
                      }}
                      className={`w-full flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-all ${
                        selectedResumeId === r.id
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold"
                          : "border-graphite-border bg-graphite-base text-gray-300 hover:border-gray-600"
                      }`}
                    >
                      <FileText className={`h-4 w-4 shrink-0 ${selectedResumeId === r.id ? "text-emerald-400" : "text-gray-500"}`} />
                      <span className="text-xs truncate">{r.filename}</span>
                      {selectedResumeId === r.id && <ChevronRight className="h-3.5 w-3.5 ml-auto text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom uploader container */}
            <div className="space-y-2">
              <label className="text-3xs font-semibold text-gray-400 uppercase tracking-wider block">Upload New Resume (PDF / TXT)</label>
              <CustomUploader
                onUploadComplete={(newResume) => {
                  setResumes(prev => [newResume, ...prev]);
                  setSelectedResumeId(newResume.id);
                  setCurrentReport(null);
                  setAtsResult(null);
                  toast.success(`Resume uploaded: ${newResume.filename}`);
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Job Description input (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-graphite-border bg-graphite-surface p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-graphite-border pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-teal-400" />
                  <span>2. Target Job Description</span>
                  <span className="text-4xs px-2 py-0.5 rounded-full bg-graphite-base border border-graphite-border text-gray-400 font-normal">Optional</span>
                </h2>
              </div>
              
              {/* URL fetch mockup */}
              <div className="flex gap-1.5 shrink-0 max-w-full sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Paste Lever/Greenhouse URL..."
                  value={jdUrl}
                  onChange={(e) => setJdUrl(e.target.value)}
                  className="rounded border border-graphite-border bg-graphite-base px-2.5 py-1 text-4xs text-gray-200 focus:border-emerald-500 focus:outline-none w-full sm:w-48"
                />
                <button
                  type="button"
                  onClick={handleUrlFetch}
                  disabled={fetchingUrl}
                  className="rounded bg-graphite-base border border-graphite-border hover:bg-graphite-surfaceHover text-gray-300 text-3xs font-semibold px-2.5 py-1 flex items-center gap-1 shrink-0 transition-colors"
                >
                  {fetchingUrl ? <Loader2 className="h-3 w-3 animate-spin" /> : <Globe className="h-3 w-3" />}
                  Sample
                </button>
              </div>
            </div>

            <p className="text-2xs text-gray-400 leading-relaxed">
              {isJDProvided
                ? "💡 Job Description detected — we will run a deep Semantic Match and Keyword Gap analysis against this specific role."
                : "ℹ️ Leave blank to run a standalone ATS Quality & Structure check (formatting, section checklist, action verbs, and word count)."}
            </p>

            <textarea
              rows={8}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Optional: Paste the target job description or requirements here..."
              className="w-full rounded-lg border border-graphite-border bg-graphite-base p-3 text-xs placeholder-gray-500 text-gray-200 focus:border-emerald-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-graphite-border">
            <span className="text-4xs text-gray-400">
              {isJDProvided ? "Mode: Job Match & Keyword Gap" : "Mode: General ATS Structure Check"}
            </span>

            <button
              onClick={handleRunAudit}
              disabled={analyzing || !selectedResumeId}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-all duration-150 shadow-md shadow-emerald-600/20 active:scale-[0.98]"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" /> Analyzing Resume...
                </>
              ) : isJDProvided ? (
                <>
                  <Cpu className="mr-2 h-4.5 w-4.5" /> Run Job Match Analysis <ArrowRight className="ml-1.5 h-4 w-4" />
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4.5 w-4.5" /> Run ATS Quality Check <ArrowRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* RESULTS DASHBOARD: MATCH ANALYSIS VIEW */}
      <AnimatePresence>
        {currentReport && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-8"
          >
            
            {/* Summary score cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Match Score Ring (4 cols) */}
              <div className="lg:col-span-4 rounded-xl border border-graphite-border bg-graphite-surface p-8 shadow-sm flex flex-col items-center justify-center text-center">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Overall Job Match</h3>
                
                <div className="relative flex items-center justify-center h-36 w-36">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      cx="72" cy="72" r="62" 
                      className="text-graphite-border stroke-current" 
                      strokeWidth="12" fill="transparent" 
                    />
                    <circle 
                      cx="72" cy="72" r="62" 
                      className={`${
                        currentReport.matchScore < 50 ? "text-red-500" : currentReport.matchScore <= 75 ? "text-amber-500" : "text-emerald-500"
                      } stroke-current transition-all duration-700`} 
                      strokeWidth="12" fill="transparent" 
                      strokeDasharray={389.5}
                      strokeDashoffset={389.5 - (389.5 * currentReport.matchScore) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-extrabold text-white">{currentReport.matchScore}%</span>
                    <span className="text-5xs text-gray-400 uppercase tracking-widest font-semibold mt-0.5">Score</span>
                  </div>
                </div>

                <p className="mt-6 text-2xs text-gray-400 max-w-xs leading-normal">
                  {currentReport.matchScore < 50 
                    ? "⚠️ Significant skill gaps identified. Follow improvements to qualify." 
                    : currentReport.matchScore <= 75 
                    ? "✨ Good base compatibility. Add missing keywords to stand out." 
                    : "🎉 Highly compatible alignment! Ready to apply."}
                </p>
              </div>

              {/* Score breakdown bar charts (8 cols) */}
              <div className="lg:col-span-8 rounded-xl border border-graphite-border bg-graphite-surface p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white border-b border-graphite-border pb-3 mb-6 flex items-center justify-between">
                    <span>Compatibility Breakdown</span>
                    <span className="text-4xs text-emerald-400 font-semibold">ATS Readiness: {currentReport.atsScore}%</span>
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Meter 1: Keywords */}
                    <div>
                      <div className="flex justify-between text-3xs font-semibold uppercase text-gray-400 mb-1">
                        <span>Keywords Match</span>
                        <span className="text-white">{currentReport.keywordsScore}%</span>
                      </div>
                      <div className="h-2 w-full rounded bg-graphite-base overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded transition-all duration-500" style={{ width: `${currentReport.keywordsScore}%` }} />
                      </div>
                    </div>

                    {/* Meter 2: Skills Match */}
                    <div>
                      <div className="flex justify-between text-3xs font-semibold uppercase text-gray-400 mb-1">
                        <span>Skills Match</span>
                        <span className="text-white">{currentReport.skillsScore}%</span>
                      </div>
                      <div className="h-2 w-full rounded bg-graphite-base overflow-hidden">
                        <div className="h-full bg-teal-500 rounded transition-all duration-500" style={{ width: `${currentReport.skillsScore}%` }} />
                      </div>
                    </div>

                    {/* Meter 3: Experience Relevance */}
                    <div>
                      <div className="flex justify-between text-3xs font-semibold uppercase text-gray-400 mb-1">
                        <span>Experience Relevance</span>
                        <span className="text-white">{currentReport.experienceScore}%</span>
                      </div>
                      <div className="h-2 w-full rounded bg-graphite-base overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded transition-all duration-500" style={{ width: `${currentReport.experienceScore}%` }} />
                      </div>
                    </div>

                    {/* Meter 4: Format Score */}
                    <div>
                      <div className="flex justify-between text-3xs font-semibold uppercase text-gray-400 mb-1">
                        <span>Format & Reading flow</span>
                        <span className="text-white">{currentReport.formatScore}%</span>
                      </div>
                      <div className="h-2 w-full rounded bg-graphite-base overflow-hidden">
                        <div className="h-full bg-teal-600 rounded transition-all duration-500" style={{ width: `${currentReport.formatScore}%` }} />
                      </div>
                    </div>

                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 print:hidden">
                  <button 
                    onClick={handleExportPDF}
                    className="inline-flex items-center justify-center rounded-lg border border-graphite-border bg-graphite-base px-4 py-2 text-3xs font-bold text-gray-200 hover:bg-graphite-surfaceHover transition-colors shadow-sm"
                  >
                    <ArrowDownToLine className="mr-1.5 h-3.5 w-3.5 text-emerald-400" /> Export Report
                  </button>
                  <button 
                    onClick={() => toast.success("Analysis report stored to your dashboard library.")}
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-3xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-600/10"
                  >
                    Save Results
                  </button>
                </div>
              </div>

            </div>

            {/* Missing Keywords (tag cloud) */}
            {currentReport.missingKeywords && currentReport.missingKeywords.length > 0 && (
              <div className="rounded-xl border border-graphite-border bg-graphite-surface p-6 shadow-sm">
                <h3 className="text-xs font-bold text-white border-b border-graphite-border pb-3 mb-4 flex items-center justify-between">
                  <span>Missing Core Keywords</span>
                  <span className="text-4xs text-gray-400 font-normal">Click to copy</span>
                </h3>
                <p className="text-4xs text-gray-400 mb-4 leading-normal">
                  Integrate these target tokens in your bullet points to score higher in recruiter parsers.
                </p>
                
                <div className="flex flex-wrap gap-2.5">
                  {currentReport.missingKeywords.map((keyword, index) => (
                    <span 
                      key={index}
                      onClick={() => {
                        navigator.clipboard.writeText(keyword);
                        toast.success(`Copied keyword suggestion: "${keyword}"`);
                      }}
                      className="rounded-full border border-graphite-border bg-graphite-base px-3.5 py-1 text-3xs font-medium text-gray-300 hover:border-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="text-emerald-400">+</span> {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths & Improvements List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Strengths Panel */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 shadow-sm">
                <h3 className="text-xs font-bold text-emerald-400 border-b border-emerald-500/20 pb-3 mb-4 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                  <span>Resume Strengths</span>
                </h3>
                
                <ul className="space-y-3">
                  {(currentReport.strengths as string[]).map((strength, index) => (
                    <li key={index} className="flex gap-2.5 text-2xs text-gray-300 leading-relaxed">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0 mt-2" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements Panel */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 shadow-sm">
                <h3 className="text-xs font-bold text-amber-400 border-b border-amber-500/20 pb-3 mb-4 flex items-center gap-1.5">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-400" />
                  <span>Actionable Improvements</span>
                </h3>

                <div className="space-y-4">
                  {(currentReport.improvements as any[]).map((imp, index) => (
                    <div key={index} className="space-y-2 border-b border-graphite-border/50 pb-3 last:border-b-0 last:pb-0">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-2xs font-bold text-white">{imp.issue}</span>
                        <span className="text-4xs text-gray-400 leading-normal">{imp.suggestion}</span>
                      </div>
                      
                      {/* Before / After */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-3xs rounded-lg overflow-hidden border border-graphite-border">
                        <div className="bg-red-500/10 p-2 border-b sm:border-b-0 sm:border-r border-graphite-border">
                          <span className="text-4xs font-bold text-red-400 uppercase block mb-1">Before:</span>
                          <p className="text-gray-400 italic">"{imp.before}"</p>
                        </div>
                        <div className="bg-emerald-500/10 p-2">
                          <span className="text-4xs font-bold text-emerald-400 uppercase block mb-1">After:</span>
                          <p className="text-gray-200 font-medium">"{imp.after}"</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* RESULTS DASHBOARD: STANDALONE ATS AUDIT VIEW */}
      <AnimatePresence>
        {atsResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ATS Score Ring */}
              <div className="rounded-xl border border-graphite-border bg-graphite-surface p-8 flex flex-col items-center justify-center text-center shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">ATS Overall Score</p>
                <div className="relative h-36 w-36">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="72" cy="72" r="60" strokeWidth="10" fill="transparent" className="stroke-graphite-border" />
                    <circle
                      cx="72" cy="72" r="60" strokeWidth="10" fill="transparent"
                      className={`${atsResult.atsScore >= 75 ? "text-emerald-500" : atsResult.atsScore >= 50 ? "text-amber-500" : "text-red-500"} stroke-current transition-all duration-700`}
                      strokeDasharray={377}
                      strokeDashoffset={377 - (377 * atsResult.atsScore) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-extrabold text-white">{atsResult.atsScore}</span>
                    <span className="text-4xs text-gray-400 uppercase font-semibold">/100</span>
                  </div>
                </div>
                <p className="mt-4 text-xs font-semibold text-gray-200">
                  {atsResult.atsScore >= 75 ? "🎉 ATS Friendly!" : atsResult.atsScore >= 50 ? "⚠️ Needs Minor Improvements" : "🚨 Major Issues Found"}
                </p>
                <p className="text-3xs text-gray-400 mt-1">Detected Candidate: <span className="font-bold text-white">{atsResult.detectedName}</span></p>
              </div>

              {/* Quick Stats & Section Checklist */}
              <div className="rounded-xl border border-graphite-border bg-graphite-surface p-6 shadow-sm">
                <h3 className="text-xs font-bold text-white mb-4">Section & Format Audit</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-2xs">
                    <span className="text-gray-400">Word Count</span>
                    <span className={`font-bold ${atsResult.resumeLength === "ideal" ? "text-emerald-400" : "text-amber-400"}`}>
                      {atsResult.wordCount} words ({atsResult.resumeLength})
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-2xs">
                    <span className="text-gray-400">Issues Flagged</span>
                    <span className="font-bold text-amber-400">{atsResult.issues.length} items</span>
                  </div>
                  <div className="flex justify-between items-center text-2xs">
                    <span className="text-gray-400">Strengths Detected</span>
                    <span className="font-bold text-emerald-400">{atsResult.strengths.length} items</span>
                  </div>
                  <div className="pt-3 border-t border-graphite-border space-y-2">
                    {Object.entries(atsResult.sectionsFound).map(([key, found]) => {
                      const labels: any = {
                        hasSummary: "Summary Section", hasExperience: "Work Experience", hasEducation: "Education",
                        hasSkills: "Technical Skills", hasProjects: "Projects & Portfolio", hasContact: "Contact Information",
                        hasCertifications: "Certifications", hasAchievements: "Achievements",
                      };
                      return (
                        <div key={key} className="flex items-center justify-between text-3xs">
                          <span className="text-gray-400">{labels[key]}</span>
                          {found
                            ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            : <XCircle className="h-3.5 w-3.5 text-gray-600" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Pro ATS Tips */}
              <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-6 shadow-sm">
                <h3 className="text-xs font-bold text-teal-400 mb-4 flex items-center gap-2">
                  <Info className="h-4 w-4" /> ATS Recommendations
                </h3>
                <ul className="space-y-2.5">
                  {atsResult.atsTips.slice(0, 5).map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-3xs text-gray-300 leading-relaxed">
                      <span className="text-teal-400 font-bold mt-0.5">→</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Issues List */}
            {atsResult.issues.length > 0 && (
              <div className="rounded-xl border border-graphite-border bg-graphite-surface p-6 shadow-sm">
                <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-400" /> Issues to Fix ({atsResult.issues.length})
                </h3>
                <p className="text-3xs text-gray-400 mb-4">Fix these formatting and structure gaps to ensure top ATS readability.</p>

                <div className="space-y-3">
                  {atsResult.issues.map((issue, i) => (
                    <div key={i} className="rounded-lg border border-graphite-border bg-graphite-base p-4">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <span className="text-xs font-bold text-white">{issue.issue}</span>
                        <span className={`text-4xs font-bold uppercase px-2 py-0.5 rounded-full ${
                          issue.severity === "high" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                          issue.severity === "medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                          "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-3xs text-gray-400 leading-relaxed">
                        <strong className="text-emerald-400">Fix: </strong>{issue.fix}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

      {/* ANALYSIS HISTORY LIST */}
      <div className="rounded-xl border border-graphite-border bg-graphite-surface p-6 shadow-sm print:hidden">
        
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-graphite-border pb-4 mb-4 gap-3">
          <div>
            <h2 className="text-sm font-bold text-white">Analysis History</h2>
            <p className="text-4xs text-gray-400 mt-0.5">Filter and review previous audit reports.</p>
          </div>
          
          <div className="flex gap-2">
            <div className="relative w-64 max-w-full">
              <Filter className="absolute inset-y-0 left-2.5 h-full w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full rounded-md border border-graphite-border bg-graphite-base py-1.5 pl-8 pr-2.5 text-4xs text-gray-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {analysesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <ListFilter className="h-8 w-8 text-gray-600 mb-2" />
            <span className="text-xs font-semibold text-white">No historical audits found</span>
            <span className="text-4xs text-gray-500 mt-0.5">Upload a resume and click Run to generate your first audit.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-2xs">
              <thead>
                <tr className="border-b border-graphite-border text-gray-400 uppercase text-3xs font-semibold">
                  <th className="py-2.5 px-4 font-bold">Resume Filename</th>
                  <th className="py-2.5 px-4 font-bold">Job Description Snippet</th>
                  <th className="py-2.5 px-4 font-bold">Date Checked</th>
                  <th className="py-2.5 px-4 font-bold">Match Score</th>
                  <th className="py-2.5 px-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-border">
                {filteredHistory.map((report) => (
                  <tr key={report.id} className="hover:bg-graphite-surfaceHover/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-200 truncate max-w-[160px]">
                      {report.resume?.filename || "Resume"}
                    </td>
                    <td className="py-3 px-4 text-gray-400 truncate max-w-[280px]">
                      {report.jobDescription}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex rounded px-2 py-0.5 text-4xs font-bold ${
                        report.matchScore < 50 
                          ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                          : report.matchScore <= 75 
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {report.matchScore}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          setCurrentReport(report);
                          setAtsResult(null);
                          window.scrollTo({ top: 350, behavior: "smooth" });
                        }}
                        className="rounded border border-graphite-border bg-graphite-base px-2.5 py-1 text-3xs font-semibold text-gray-300 hover:bg-graphite-surfaceHover hover:text-white transition-colors"
                      >
                        Load Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default function ResumeAnalyzerPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    }>
      <AnalyzerContent />
    </Suspense>
  );
}
