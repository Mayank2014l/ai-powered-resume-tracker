"use client";

import React, { useState, useEffect } from "react";
import { UploadCloud, Loader2, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Info, FileText, ChevronRight, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { UploadDropzone } from "@/lib/uploadthing";

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

interface Resume {
  id: string;
  filename: string;
  candidateName?: string;
}

const SeverityBadge = ({ severity }: { severity: string }) => {
  const map = {
    high: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    low: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  } as any;
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${map[severity]}`}>
      {severity}
    </span>
  );
};

export default function ResumeCheckPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [result, setResult] = useState<ATSResult | null>(null);

  useEffect(() => {
    fetch("/api/resumes")
      .then(r => r.json())
      .then(data => {
        setResumes(data);
        if (data.length > 0) setSelectedId(data[0].id);
      })
      .catch(() => toast.error("Failed to load resumes"))
      .finally(() => setResumesLoading(false));
  }, []);

  const handleCheck = async () => {
    if (!selectedId) { toast.error("Please select or upload a resume first"); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/resume-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: selectedId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      toast.success("Resume analysis complete!");
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (s: number) => s >= 75 ? "text-emerald-500" : s >= 50 ? "text-amber-500" : "text-red-500";
  const scoreStroke = (s: number) => s >= 75 ? "text-emerald-500" : s >= 50 ? "text-amber-500" : "text-red-500";

  const highIssues = result?.issues.filter(i => i.severity === "high") || [];
  const medIssues = result?.issues.filter(i => i.severity === "medium") || [];
  const lowIssues = result?.issues.filter(i => i.severity === "low") || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-indigo-500" />
          Resume ATS Checker
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          Check if your resume is ATS-friendly, find issues, and get fixes — before applying.
        </p>
      </div>

      {/* Input Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Select Resume */}
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40 p-6 space-y-5">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-500" />
            Select Your Resume
          </h2>

          {!resumesLoading && resumes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Uploaded Resumes</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {resumes.map(r => (
                  <button
                    key={r.id}
                    onClick={() => { setSelectedId(r.id); setResult(null); }}
                    className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all ${
                      selectedId === r.id
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <FileText className={`h-4 w-4 shrink-0 ${selectedId === r.id ? "text-indigo-500" : "text-zinc-400"}`} />
                    <span className="text-xs font-medium truncate">{r.filename}</span>
                    {selectedId === r.id && <ChevronRight className="h-3.5 w-3.5 ml-auto text-indigo-500" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Upload New</label>
            <div className="rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 p-3">
              <UploadDropzone
                endpoint="resumeUploader"
                onClientUploadComplete={async (res: any) => {
                  if (res?.[0]) {
                    try {
                      const dbRes = await fetch("/api/resumes/upload", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ filename: res[0].name, fileUrl: res[0].url }),
                      });
                      if (dbRes.ok) {
                        const newResume = await dbRes.json();
                        setResumes(prev => [newResume, ...prev]);
                        setSelectedId(newResume.id);
                        toast.success(`Resume uploaded: ${res[0].name}`);
                      }
                    } catch { toast.error("Failed to save resume"); }
                  }
                }}
                onUploadError={(e: Error) => toast.error(e.message)}
                className="ut-label:text-xs ut-button:bg-indigo-600 ut-button:text-white ut-button:text-xs ut-button:py-1.5 ut-button:rounded-md ut-allowed-content:text-[10px]"
              />
            </div>

            {/* Simulate upload for demo */}
            <button
              onClick={async () => {
                const names = ["Rahul_Sharma_Resume.pdf", "Priya_Singh_CV.pdf", "Arjun_Verma_Resume.pdf"];
                const fn = names[Math.floor(Math.random() * names.length)];
                const r = await fetch("/api/resumes/upload", {
                  method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ filename: fn, fileUrl: "https://utfs.io/f/mock.pdf" }),
                });
                if (r.ok) {
                  const nr = await r.json();
                  setResumes(prev => [nr, ...prev]);
                  setSelectedId(nr.id);
                  toast.success(`Loaded demo resume: ${fn}`);
                }
              }}
              className="w-full text-center text-xs text-indigo-500 hover:text-indigo-400 py-1 transition-colors"
            >
              Load Demo Resume →
            </button>
          </div>
        </div>

        {/* Right: Info + CTA */}
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">What We Check</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "🎯", label: "ATS Score", desc: "Parsed by ATS bots?" },
                { icon: "📋", label: "Section Check", desc: "All key sections present?" },
                { icon: "💡", label: "Content Quality", desc: "Action verbs & numbers?" },
                { icon: "📏", label: "Length Check", desc: "Too short or too long?" },
                { icon: "🔑", label: "Keywords", desc: "Industry terms found?" },
                { icon: "⚡", label: "Format Tips", desc: "Formatting issues?" },
              ].map(({ icon, label, desc }) => (
                <div key={label} className="flex items-start gap-2 rounded-lg bg-zinc-50 dark:bg-zinc-950/50 p-3">
                  <span className="text-lg">{icon}</span>
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-white">{label}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleCheck}
            disabled={loading || !selectedId}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing Resume...</>
            ) : (
              <><ShieldCheck className="h-4 w-4" /> Run ATS Check</>
            )}
          </button>
        </div>
      </div>

      {/* RESULTS */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Score Header */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ATS Score Ring */}
              <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40 p-8 flex flex-col items-center justify-center text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">ATS Score</p>
                <div className="relative h-36 w-36">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="72" cy="72" r="60" strokeWidth="10" fill="transparent" className="stroke-zinc-100 dark:stroke-zinc-800" />
                    <circle
                      cx="72" cy="72" r="60" strokeWidth="10" fill="transparent"
                      className={scoreStroke(result.atsScore) + " stroke-current"}
                      strokeDasharray={377}
                      strokeDashoffset={377 - (377 * result.atsScore) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-extrabold ${scoreColor(result.atsScore)}`}>{result.atsScore}</span>
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold">/100</span>
                  </div>
                </div>
                <p className="mt-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {result.atsScore >= 75 ? "🎉 ATS Friendly!" : result.atsScore >= 50 ? "⚠️ Needs Improvement" : "🚨 Major Issues Found"}
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">Detected: <span className="font-bold text-zinc-700 dark:text-zinc-300">{result.detectedName}</span></p>
              </div>

              {/* Quick Stats */}
              <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40 p-6">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500">Word Count</span>
                    <span className={`text-xs font-bold ${result.resumeLength === "ideal" ? "text-emerald-500" : "text-amber-500"}`}>
                      {result.wordCount} words ({result.resumeLength})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500">Issues Found</span>
                    <span className="text-xs font-bold text-red-500">{result.issues.length} issues</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500">Strengths</span>
                    <span className="text-xs font-bold text-emerald-500">{result.strengths.length} found</span>
                  </div>
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                    {Object.entries(result.sectionsFound).map(([key, found]) => {
                      const labels: any = {
                        hasSummary: "Summary", hasExperience: "Experience", hasEducation: "Education",
                        hasSkills: "Skills", hasProjects: "Projects", hasContact: "Contact",
                        hasCertifications: "Certifications", hasAchievements: "Achievements",
                      };
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-[11px] text-zinc-500">{labels[key]}</span>
                          {found
                            ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            : <XCircle className="h-3.5 w-3.5 text-red-400" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Strengths */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800/40 dark:bg-emerald-500/5 p-6">
                <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> What's Working ✅
                </h3>
                {result.strengths.length > 0 ? (
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">{s}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-zinc-400">No major strengths detected. Follow the fixes below.</p>
                )}
              </div>
            </div>

            {/* Issues */}
            {result.issues.length > 0 && (
              <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40 p-6">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1 flex items-center gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-500" /> Issues Found ({result.issues.length})
                </h3>
                <p className="text-[11px] text-zinc-400 mb-5">Fix these to increase your ATS score and recruiter visibility.</p>

                <div className="space-y-3">
                  {[...highIssues, ...medIssues, ...lowIssues].map((issue, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-lg border border-zinc-100 dark:border-zinc-800 p-4 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">{issue.issue}</span>
                        <SeverityBadge severity={issue.severity} />
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        <span className="font-semibold text-indigo-500">Fix: </span>{issue.fix}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ATS Tips */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 dark:border-indigo-800/40 dark:bg-indigo-500/5 p-6">
              <h3 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2">
                <Info className="h-4 w-4" /> Pro ATS Tips to Beat the Bots
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.atsTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-indigo-800 dark:text-indigo-300 leading-relaxed">
                    <span className="text-indigo-400 mt-0.5">→</span> {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA to Job Analyzer */}
            <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40 p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">Ready to match against a job?</p>
                <p className="text-xs text-zinc-500 mt-0.5">Use Job Analyzer to see how your resume scores against a specific job description.</p>
              </div>
              <a
                href="/dashboard/analyzer"
                className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-md"
              >
                <Zap className="h-3.5 w-3.5" /> Job Analyzer
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
