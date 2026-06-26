"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { useAnalyses } from "@/hooks/use-analyses";
import { CustomUploader } from "@/components/custom-uploader";
import { 
  Sparkles, FileText, UploadCloud, Globe, Cpu, 
  CheckCircle2, AlertTriangle, ArrowRight, FileCheck, 
  Trash2, Filter, Loader2, ArrowDownToLine, Zap, ListFilter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Resume, Analysis } from "@/types";

export default function ResumeAnalyzerPage() {
  const { plan } = useUser();
  const { analyses, loading: analysesLoading, analyze } = useAnalyses();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumesLoading, setResumesLoading] = useState(true);

  // Selected state
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [jdUrl, setJdUrl] = useState<string>("");
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Results view
  const [currentReport, setCurrentReport] = useState<Analysis | null>(null);
  
  // History table filters
  const [searchFilter, setSearchFilter] = useState("");

  const fetchResumes = async () => {
    try {
      const res = await fetch("/api/resumes");
      if (res.ok) {
        const data = await res.json();
        setResumes(data);
        if (data.length > 0) {
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
  }, []);

  const handleUrlFetch = async () => {
    if (!jdUrl) {
      toast.warning("Please enter a valid job URL first.");
      return;
    }
    setFetchingUrl(true);
    // Simulate fetching job description from URL
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setJobDescription(`ROLE: Senior Full Stack Developer (Next.js & TypeScript)\n\nWe are looking for a Senior Developer to own frontend architectures and integrate complex payments and subscription models. \n\nREQUIREMENTS:\n- 5+ years with React and modern SSR frameworks like Next.js.\n- Strong expertise in TypeScript, Node.js, and Postgres.\n- Experience configuring database ORMs (Prisma preferred).\n- Deep understanding of Stripe integrations and payment flows.\n- Mastery of Tailwind CSS layouts.\n- Experience with GraphQL, Docker, and CI/CD pipelines.`);
    toast.success("Successfully fetched job description!");
    setFetchingUrl(false);
  };

  const handleStartAnalysis = async () => {
    if (!selectedResumeId) {
      toast.error("Please upload or select a resume first.");
      return;
    }
    if (!jobDescription || jobDescription.length < 20) {
      toast.error("Please enter a comprehensive job description.");
      return;
    }

    setAnalyzing(true);
    try {
      const report = await analyze(selectedResumeId, jobDescription);
      setCurrentReport(report);
      toast.success("AI Analysis complete!");
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze resume.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExportPDF = () => {
    toast.info("Generating PDF report...");
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  // Filter history
  const filteredHistory = analyses
    .filter(a => {
      const jdMatch = a.jobDescription.toLowerCase().includes(searchFilter.toLowerCase());
      const fileMatch = a.resume?.filename.toLowerCase().includes(searchFilter.toLowerCase()) || false;
      return jdMatch || fileMatch;
    })
    .slice(0, 10);

  return (
    <div className="space-y-8 max-w-7xl mx-auto print:bg-white print:p-0">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl flex items-center gap-3">
            <FileSearch className="h-8 w-8 text-indigo-500" />
            Job Match Analyzer
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Paste a job description and see exactly how well your resume matches — keyword gaps, score, and fixes.
          </p>
          <a href="/dashboard/resume-check" className="mt-2 inline-flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-400 transition-colors">
            <FileCheck className="h-3.5 w-3.5" /> Want to check overall resume quality? → Resume ATS Checker
          </a>
        </div>
      </div>

      {/* INPUT CONTROLS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:hidden">
        
        {/* Left Side: Upload & Select (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/30 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-indigo-500" />
                <span>1. Select or Upload Resume</span>
              </h2>
            </div>

            {/* Resume Selector */}
            {resumes.length > 0 && (
              <div className="space-y-2">
                <label className="text-3xs font-semibold text-zinc-500 uppercase tracking-wider">Select Existing Resume</label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => {
                    setSelectedResumeId(e.target.value);
                    setCurrentReport(null);
                  }}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-zinc-850 dark:bg-zinc-950 dark:text-white"
                >
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.filename}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom uploader container */}
            <div className="space-y-2">
              <label className="text-3xs font-semibold text-zinc-500 uppercase tracking-wider block">Upload New Resume (PDF / TXT)</label>
              <CustomUploader
                onUploadComplete={(newResume) => {
                  setResumes(prev => [newResume, ...prev]);
                  setSelectedResumeId(newResume.id);
                  toast.success(`Resume uploaded and parsed: ${newResume.filename}`);
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Job Description input (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/35 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-500" />
                <span>2. Job Description</span>
              </h2>
              
              {/* URL fetch mockup */}
              <div className="flex gap-1.5 shrink-0 max-w-full sm:max-w-xs">
                <input
                  type="text"
                  placeholder="https://jobs.lever.co/company/..."
                  value={jdUrl}
                  onChange={(e) => setJdUrl(e.target.value)}
                  className="rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-4xs focus:border-indigo-500 focus:outline-none dark:border-zinc-850 dark:bg-zinc-950 dark:text-white w-full sm:w-44"
                />
                <button
                  type="button"
                  onClick={handleUrlFetch}
                  disabled={fetchingUrl}
                  className="rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-3xs font-semibold px-2 py-1 flex items-center gap-1 shrink-0"
                >
                  {fetchingUrl ? <Loader2 className="h-3 w-3 animate-spin" /> : <Globe className="h-3 w-3" />}
                  Fetch
                </button>
              </div>
            </div>

            <textarea
              rows={8}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job description or requirements here to analyze your match score..."
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs placeholder-zinc-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-850 dark:bg-zinc-950 dark:text-white dark:focus:bg-zinc-950"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleStartAnalysis}
              disabled={analyzing || !selectedResumeId || !jobDescription}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-indigo-600/10"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" /> Analyzing Resume...
                </>
              ) : (
                <>
                  <Cpu className="mr-2 h-4.5 w-4.5" /> Analyze Now <ArrowRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* ANALYSIS RESULTS DASHBOARD */}
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
              <div className="lg:col-span-4 rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900/40 shadow-sm flex flex-col items-center justify-center text-center">
                <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-6">Overall Match</h3>
                
                {/* Circular ring representation */}
                <div className="relative flex items-center justify-center h-36 w-36">
                  {/* SVG circular progress indicator */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      cx="72" cy="72" r="62" 
                      className="text-zinc-150 dark:text-zinc-800 stroke-current" 
                      strokeWidth="12" fill="transparent" 
                    />
                    <circle 
                      cx="72" cy="72" r="62" 
                      className={`${
                        currentReport.matchScore < 50 ? "text-red-500" : currentReport.matchScore <= 75 ? "text-amber-500" : "text-emerald-500"
                      } stroke-current`} 
                      strokeWidth="12" fill="transparent" 
                      strokeDasharray={389.5}
                      strokeDashoffset={389.5 - (389.5 * currentReport.matchScore) / 100}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">{currentReport.matchScore}%</span>
                    <span className="text-5xs text-zinc-400 uppercase tracking-widest font-semibold mt-0.5">Score</span>
                  </div>
                </div>

                <p className="mt-6 text-2xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-normal">
                  {currentReport.matchScore < 50 
                    ? "Significant skill gaps identified. Follow improvements to qualify." 
                    : currentReport.matchScore <= 75 
                    ? "Good base compatibility. Add missing keywords to stand out." 
                    : "Highly compatible alignment! Ready to apply."}
                </p>
              </div>

              {/* Score breakdown bar charts (8 cols) */}
              <div className="lg:col-span-8 rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-850 dark:bg-zinc-900/30 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-6">Compatibility Audit</h3>
                  
                  <div className="space-y-4">
                    {/* Meter 1: Keywords */}
                    <div>
                      <div className="flex justify-between text-3xs font-semibold uppercase text-zinc-500 mb-1">
                        <span>Keywords Match</span>
                        <span>{currentReport.keywordsScore}%</span>
                      </div>
                      <div className="h-2 w-full rounded bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded" style={{ width: `${currentReport.keywordsScore}%` }} />
                      </div>
                    </div>

                    {/* Meter 2: Skills Match */}
                    <div>
                      <div className="flex justify-between text-3xs font-semibold uppercase text-zinc-500 mb-1">
                        <span>Skills Match</span>
                        <span>{currentReport.skillsScore}%</span>
                      </div>
                      <div className="h-2 w-full rounded bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded" style={{ width: `${currentReport.skillsScore}%` }} />
                      </div>
                    </div>

                    {/* Meter 3: Experience Relevance */}
                    <div>
                      <div className="flex justify-between text-3xs font-semibold uppercase text-zinc-500 mb-1">
                        <span>Experience Relevance</span>
                        <span>{currentReport.experienceScore}%</span>
                      </div>
                      <div className="h-2 w-full rounded bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded" style={{ width: `${currentReport.experienceScore}%` }} />
                      </div>
                    </div>

                    {/* Meter 4: Format Score */}
                    <div>
                      <div className="flex justify-between text-3xs font-semibold uppercase text-zinc-500 mb-1">
                        <span>Format & Reading flow</span>
                        <span>{currentReport.formatScore}%</span>
                      </div>
                      <div className="h-2 w-full rounded bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded" style={{ width: `${currentReport.formatScore}%` }} />
                      </div>
                    </div>

                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 print:hidden">
                  <button 
                    onClick={handleExportPDF}
                    className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-3xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                  >
                    <ArrowDownToLine className="mr-1.5 h-3.5 w-3.5" /> Export Report
                  </button>
                  <button 
                    onClick={() => toast.success("Analysis report stored to your dashboard library.")}
                    className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-3xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/10"
                  >
                    Save Results
                  </button>
                </div>
              </div>

            </div>

            {/* Missing Keywords (tag cloud) */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/35 shadow-sm">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
                Missing Core Keywords
              </h3>
              <p className="text-4xs text-zinc-500 dark:text-zinc-400 mb-4 leading-normal">
                Integrate these target tokens in your bullet points to score higher in recruiter parsers. Click to copy suggestions.
              </p>
              
              <div className="flex flex-wrap gap-2.5">
                {currentReport.missingKeywords.map((keyword, index) => (
                  <span 
                    key={index}
                    onClick={() => {
                      navigator.clipboard.writeText(keyword);
                      toast.success(`Copied keyword suggestion: "${keyword}"`);
                    }}
                    className="rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-1 text-3xs font-medium text-zinc-700 hover:border-indigo-500 hover:bg-indigo-500/10 hover:text-indigo-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-indigo-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    + {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Strengths & Improvements List (before/after columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Strengths Panel */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/35 shadow-sm">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                  <span>Resume Strengths</span>
                </h3>
                
                <ul className="space-y-3">
                  {(currentReport.strengths as string[]).map((strength, index) => (
                    <li key={index} className="flex gap-2.5 text-2xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements Panel */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/35 shadow-sm">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4 flex items-center gap-1.5">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                  <span>Actionable Improvements</span>
                </h3>

                <div className="space-y-5">
                  {(currentReport.improvements as any[]).map((imp, index) => (
                    <div key={index} className="space-y-2.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-2xs font-bold text-zinc-900 dark:text-white">{imp.issue}</span>
                        <span className="text-4xs text-zinc-500 dark:text-zinc-400 leading-normal">{imp.suggestion}</span>
                      </div>
                      
                      {/* Before / After layout */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-3xs rounded-lg overflow-hidden border border-zinc-150 dark:border-zinc-800">
                        <div className="bg-red-500/5 p-2 border-b sm:border-b-0 sm:border-r border-zinc-150 dark:border-zinc-800">
                          <span className="text-4xs font-bold text-red-600 uppercase block mb-1">Before:</span>
                          <p className="text-zinc-500 italic">"{imp.before}"</p>
                        </div>
                        <div className="bg-emerald-500/5 p-2">
                          <span className="text-4xs font-bold text-emerald-600 uppercase block mb-1">After:</span>
                          <p className="text-zinc-850 dark:text-zinc-200 font-medium">"{imp.after}"</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ATS compatibility */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/35 shadow-sm">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
                ATS Compatibility Audit (Score: {currentReport.atsScore || 70}%)
              </h3>
              <p className="text-2xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {(currentReport as any).atsSuggestions}
              </p>
              
              <div className="mt-5 border-t border-zinc-100 dark:border-zinc-800 pt-5 flex justify-between items-center">
                <div>
                  <span className="text-3xs font-semibold text-zinc-400 uppercase block">Pro feature</span>
                  <span className="text-2xs text-zinc-700 dark:text-zinc-300 font-medium mt-0.5 block">Generate optimized PDF utilizing exact AI keywords</span>
                </div>
                <button
                  onClick={() => {
                    if (plan === "pro") {
                      toast.success("Downloading optimized resume PDF...");
                    } else {
                      toast.warning("Optimization is a Pro plan feature. Please upgrade to unlock.", {
                        action: {
                          label: "Upgrade",
                          onClick: () => window.location.href = "/dashboard/billing",
                        }
                      });
                    }
                  }}
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-3xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-sm"
                >
                  <Zap className="mr-1.5 h-3.5 w-3.5 fill-current" /> Generate Optimized Resume
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ANALYSIS AUDITING HISTORY LIST */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/35 shadow-sm print:hidden">
        
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4 gap-3">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Analysis History</h2>
            <p className="text-4xs text-zinc-400 mt-0.5">Filter and review previous feedback reports.</p>
          </div>
          
          <div className="flex gap-2">
            <div className="relative w-64 max-w-full">
              <Filter className="absolute inset-y-0 left-2.5 h-full w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full rounded-md border border-zinc-200 bg-zinc-50 py-1.5 pl-8 pr-2.5 text-4xs focus:border-indigo-500 focus:outline-none dark:border-zinc-850 dark:bg-zinc-950 dark:text-white"
              />
            </div>
          </div>
        </div>

        {analysesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <ListFilter className="h-8 w-8 text-zinc-350 mb-2" />
            <span className="text-xs font-semibold text-zinc-950 dark:text-white">No historical audits found</span>
            <span className="text-4xs text-zinc-500 mt-0.5">Adjust filter keywords or execute a new analysis.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-2xs">
              <thead>
                <tr className="border-b border-zinc-150 dark:border-zinc-800 text-zinc-400 uppercase text-3xs font-semibold">
                  <th className="py-2.5 px-4 font-bold">Resume Filename</th>
                  <th className="py-2.5 px-4 font-bold">Job Description Snippet</th>
                  <th className="py-2.5 px-4 font-bold">Date Checked</th>
                  <th className="py-2.5 px-4 font-bold">Match Score</th>
                  <th className="py-2.5 px-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                {filteredHistory.map((report) => (
                  <tr key={report.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                    <td className="py-3 px-4 font-medium truncate max-w-[160px]">
                      {report.resume?.filename || "Resume File"}
                    </td>
                    <td className="py-3 px-4 text-zinc-500 truncate max-w-[280px]">
                      {report.jobDescription}
                    </td>
                    <td className="py-3 px-4 text-zinc-400">
                      {new Date(report.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex rounded px-1.5 py-0.5 text-4xs font-extrabold ${
                        report.matchScore < 50 
                          ? "bg-red-500/10 text-red-600" 
                          : report.matchScore <= 75 
                          ? "bg-amber-500/10 text-amber-600" 
                          : "bg-emerald-500/10 text-emerald-600"
                      }`}>
                        {report.matchScore}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          setCurrentReport(report);
                          window.scrollTo({ top: 300, behavior: "smooth" });
                        }}
                        className="rounded border border-zinc-200 px-2 py-1 text-3xs font-semibold hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
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
