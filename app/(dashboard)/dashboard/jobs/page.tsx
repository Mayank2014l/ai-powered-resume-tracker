"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { useJobs } from "@/hooks/use-jobs";
import { 
  Briefcase, Sparkles, Link2, CheckCircle2, AlertTriangle, 
  Search, MapPin, DollarSign, Plus, Loader2, FileText, 
  ChevronRight, RefreshCw, Layers, ShieldCheck, X
} from "lucide-react";
import { toast } from "sonner";
import { Resume } from "@/types";

// Mock jobs database with matching keys
const MOCK_JOBS_DB = [
  {
    id: "job-1",
    company: "Stripe",
    role: "Senior React Engineer",
    location: "Remote (USA)",
    salary: "$140k - $180k",
    type: "Full-Time",
    tags: ["React", "TypeScript", "Next.js", "TailwindCSS"],
    jdText: "We are looking for a Senior React Engineer to build secure, modular checkout experiences. Expert knowledge of React, Next.js, state management, and semantic CSS layout is required.",
    matchRate: 98,
    matchedSkills: ["React", "TypeScript", "Next.js", "TailwindCSS"],
    missingSkills: ["GraphQL"],
    atsScore: 96,
    recommendations: "Highlight your experience with global payment interfaces or financial state machines. Emphasize performance-centric Next.js projects."
  },
  {
    id: "job-2",
    company: "Google",
    role: "Frontend Engineer (Cloud Console)",
    location: "Sunnyvale, CA",
    salary: "$160k - $210k",
    type: "Full-Time",
    tags: ["React", "TypeScript", "Design Systems", "Web Performance"],
    jdText: "Join Google Cloud to refactor console interfaces. Experience designing enterprise design components and optimizing core web vitals in large single-page applications is critical.",
    matchRate: 94,
    matchedSkills: ["React", "TypeScript", "Web Performance"],
    missingSkills: ["Angular", "Monorepos"],
    atsScore: 91,
    recommendations: "Include achievements detailing bundle-size reduction by percentage metrics. Call out component refactoring for micro-frontends."
  },
  {
    id: "job-3",
    company: "Vercel",
    role: "Next.js Developer Advocate",
    location: "Remote (Global)",
    salary: "$130k - $165k",
    type: "Full-Time",
    tags: ["Next.js", "React", "Server Components", "Technical Writing"],
    jdText: "Translate advanced Next.js feature deployments into clean educational docs. Experience with React Server Components, server-side caching, and open-source contributions is highly valued.",
    matchRate: 91,
    matchedSkills: ["Next.js", "React", "Technical Writing"],
    missingSkills: ["Serverless Architecture"],
    atsScore: 89,
    recommendations: "Add a link to a blog post, Github repository, or video detailing Next.js Server Components. Show clear technical presentation skills."
  },
  {
    id: "job-4",
    company: "Airbnb",
    role: "UI Engineer",
    location: "San Francisco, CA",
    salary: "$150k - $190k",
    type: "Full-Time",
    tags: ["React", "CSS Modules", "Framer Motion", "Accessibility"],
    jdText: "Build responsive, accessible, and delightful booking widgets. Experience with Framer Motion, micro-interactions, WCAG compliance, and testing is key.",
    matchRate: 85,
    matchedSkills: ["React", "Framer Motion"],
    missingSkills: ["Accessibility (WCAG)", "Jest"],
    atsScore: 82,
    recommendations: "Add details around user interface accessibility testing (e.g. screen readers, keyboard-only access). Mention micro-animations."
  },
  {
    id: "job-5",
    company: "Supabase",
    role: "Fullstack Developer (Growth)",
    location: "Remote (Singapore/Europe)",
    salary: "$120k - $155k",
    type: "Full-Time",
    tags: ["Next.js", "PostgreSQL", "Node.js", "TypeScript"],
    jdText: "We need a Growth Fullstack developer to deploy onboarding templates. Familiarity with Postgres triggers, Next.js Server Actions, and user acquisition metrics is required.",
    matchRate: 78,
    matchedSkills: ["Next.js", "TypeScript", "Node.js"],
    missingSkills: ["PostgreSQL", "SQL Tuning"],
    atsScore: 75,
    recommendations: "Incorporate database experience and SQL queries. Highlight growth metrics or conversion optimizations you implemented in past startups."
  },
  {
    id: "job-6",
    company: "Netflix",
    role: "UI Developer (Growth Engine)",
    location: "Los Gatos, CA",
    salary: "$200k - $280k",
    type: "Full-Time",
    tags: ["React", "A/B Testing", "CSS", "Web Performance"],
    jdText: "Run high-throughput testing interfaces for signup funnels. Strong expertise in optimizing vanilla CSS pipelines and writing highly efficient Javascript loops is mandatory.",
    matchRate: 74,
    matchedSkills: ["React", "CSS", "Web Performance"],
    missingSkills: ["A/B Testing Frameworks", "Node.js"],
    atsScore: 71,
    recommendations: "Mention statistical metrics from A/B testing models. Highlight performance audits showing improvements in First Contentful Paint."
  }
];

export default function LinkedInJobsPage() {
  const router = useRouter();
  const { plan } = useUser();
  const { addJob, jobs: existingJobs } = useJobs();

  // LinkedIn connection states
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [syncedProfile, setSyncedProfile] = useState<any>(null);

  // Resume selection & data states
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [selectedResumeId, setSelectedResumeId] = useState("");

  // Filters & job list states
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("Remote");
  const [filteredJobs, setFilteredJobs] = useState(MOCK_JOBS_DB);
  const [searching, setSearching] = useState(false);

  // Match report modal states
  const [selectedReportJob, setSelectedReportJob] = useState<any>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);

  // Fetch resumes on load
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
      toast.error("Failed to load resumes.");
    } finally {
      setResumesLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  // Sync LinkedIn Profile simulation
  const handleLinkedinSync = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedinUrl || !linkedinUrl.includes("linkedin.com")) {
      toast.error("Please enter a valid LinkedIn profile URL (e.g. linkedin.com/in/username)");
      return;
    }

    setIsSyncing(true);
    toast.info("Connecting to LinkedIn Sync Gateway...");

    setTimeout(() => {
      // Simulate profile parse
      const username = linkedinUrl.split("/in/")[1] || "candidate";
      const cleanedName = username
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());

      setSyncedProfile({
        name: cleanedName || "Alex Peterson",
        headline: "Senior Frontend Engineer | Next.js & React Architect",
        company: "Vercel Partner",
        skills: ["React", "TypeScript", "Next.js", "TailwindCSS", "Node.js", "Web Performance", "Framer Motion"],
        location: "San Francisco Bay Area",
        connections: "500+"
      });
      setIsSyncing(false);
      setIsSynced(true);
      toast.success("LinkedIn profile parsed & matched successfully!");
    }, 2500);
  };

  // Job Search / Filter apply logic
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearching(true);
    
    setTimeout(() => {
      let results = MOCK_JOBS_DB;
      
      if (keyword) {
        results = results.filter(job => 
          job.role.toLowerCase().includes(keyword.toLowerCase()) || 
          job.company.toLowerCase().includes(keyword.toLowerCase()) ||
          job.tags.some(t => t.toLowerCase().includes(keyword.toLowerCase()))
        );
      }
      
      if (location) {
        results = results.filter(job => 
          job.location.toLowerCase().includes(location.toLowerCase()) ||
          (location.toLowerCase() === "remote" && job.location.toLowerCase().includes("remote"))
        );
      }

      setFilteredJobs(results);
      setSearching(false);
    }, 800);
  };

  // Trigger search on filter adjustments
  useEffect(() => {
    handleSearch();
  }, [keyword, location]);

  // Open dynamic match report
  const handleViewReport = (job: any) => {
    setIsReportLoading(true);
    setSelectedReportJob(job);
    
    setTimeout(() => {
      setIsReportLoading(false);
    }, 1200);
  };

  // Quick Tracker push
  const handleAddToTracker = async (job: any) => {
    // Check if user already added this job
    const alreadyExists = existingJobs.some(
      j => j.company.toLowerCase() === job.company.toLowerCase() && j.role.toLowerCase() === job.role.toLowerCase()
    );

    if (alreadyExists) {
      toast.warning("This job is already logged in your Tracker board!");
      return;
    }

    try {
      await addJob({
        company: job.company,
        role: job.role,
        location: job.location,
        salary: job.salary,
        matchScore: job.matchRate,
        status: "saved",
        jdText: job.jdText,
        notes: "Suggested via LinkedIn match engine based on profile."
      });
      toast.success(`Successfully logged ${job.role} at ${job.company} inside your Job Tracker!`);
    } catch (e) {
      toast.error("Failed to add job to tracker.");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
          LinkedIn Match & Suggestions
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Sync credentials with LinkedIn to scan, audit, and extract matching jobs tailored to your resumes.
        </p>
      </div>

      {/* TOP ROW: LINKEDIN SYNC & RESUME SELECT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: LinkedIn Connect Widget (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/30 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <Link2 className="h-5 w-5 text-indigo-500" />
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">LinkedIn Sync Gateway</h2>
            </div>

            {!isSynced ? (
              <form onSubmit={handleLinkedinSync} className="space-y-4">
                <p className="text-2xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Connect your LinkedIn Profile URL below. The AI matching model will scan your profile experiences, endorsements, and target keywords to pull matching live opportunities.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-3 flex items-center text-4xs font-bold text-indigo-500">
                      in/
                    </span>
                    <input
                      type="text"
                      required
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-10 pr-3 py-2 text-xs placeholder-zinc-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-850 dark:bg-zinc-950 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSyncing}
                    className="rounded-lg bg-indigo-650 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-600 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Syncing...
                      </>
                    ) : (
                      "Sync Profile"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Synced Profile Layout */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100/30">
                  <div className="h-12 w-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-md uppercase">
                    {syncedProfile?.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {syncedProfile?.name}
                      </h3>
                      <span className="rounded bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 text-5xs font-bold uppercase tracking-wider flex items-center gap-0.5">
                        <ShieldCheck className="h-2.5 w-2.5" /> Synced
                      </span>
                    </div>
                    <p className="text-3xs text-zinc-650 dark:text-zinc-400 font-semibold mt-0.5 truncate">
                      {syncedProfile?.headline}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {syncedProfile?.skills.map((skill: string) => (
                        <span key={skill} className="rounded bg-zinc-150 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 px-2 py-0.5 text-4xs font-semibold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-4xs">
                  <span className="text-zinc-400">Location: {syncedProfile?.location} | Connections: {syncedProfile?.connections}</span>
                  <button
                    onClick={() => {
                      setIsSynced(false);
                      setSyncedProfile(null);
                    }}
                    className="text-indigo-650 font-bold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" /> Reconnect profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Select Base Resume Filter (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/30 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <FileText className="h-5 w-5 text-indigo-500" />
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Analyze Compatibility</h2>
            </div>
            
            <p className="text-2xs text-zinc-500 dark:text-zinc-400 leading-normal">
              Select one of your saved resumes. The matcher will cross-reference its experience vectors against target job roles.
            </p>

            <div className="space-y-2">
              <label className="text-3xs font-semibold text-zinc-450 uppercase tracking-wider block">Target Resume</label>
              {resumesLoading ? (
                <div className="h-10 w-full bg-zinc-100 dark:bg-zinc-850 animate-pulse rounded-lg" />
              ) : resumes.length === 0 ? (
                <div className="p-4 border border-dashed rounded-lg text-center text-3xs text-zinc-500">
                  No resumes found.{" "}
                  <Link href="/dashboard/resumes" className="text-indigo-650 font-semibold hover:underline">
                    Upload here
                  </Link>
                </div>
              ) : (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-zinc-850 dark:bg-zinc-950 dark:text-white"
                >
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.filename}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="text-4xs text-zinc-400 mt-4">
            * Selected Resume: <span className="font-semibold text-zinc-600 dark:text-zinc-250">{resumes.find(r => r.id === selectedResumeId)?.filename || "None selected"}</span>
          </div>
        </div>

      </div>

      {/* FILTER BAR ROW */}
      <div className="rounded-xl border border-zinc-250/60 bg-white p-4 dark:border-zinc-850 dark:bg-zinc-900/30">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Keyword Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute inset-y-0 left-3 h-full w-4 text-zinc-450" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search Role or Company... (e.g. Stripe, React)"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-850 dark:bg-zinc-950 dark:text-white"
            />
          </div>

          {/* Location */}
          <div className="relative w-full sm:w-64">
            <MapPin className="absolute inset-y-0 left-3 h-full w-4 text-zinc-455" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location... (e.g. Remote)"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-850 dark:bg-zinc-950 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={searching}
            className="w-full sm:w-auto rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 px-5 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            {searching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Filter"}
          </button>
        </form>
      </div>

      {/* RESULTS LIST */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800 pb-3">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
            <Briefcase className="h-4.5 w-4.5 text-zinc-500" />
            <span>Matching Positions ({filteredJobs.length})</span>
          </h2>
          <span className="text-4xs text-zinc-400">Match score based on selected resume profile</span>
        </div>

        {searching ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
            <span className="text-3xs text-zinc-400">Filtering suggested jobs...</span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-zinc-200/50 dark:border-zinc-800/40 rounded-xl">
            <Briefcase className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-350 block">No matching jobs found</span>
            <span className="text-4xs text-zinc-400 mt-1">Try refining search keyword parameters.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map((job) => {
              // Get color coding based on match score
              const isHighMatch = job.matchRate >= 90;
              const matchBadgeClass = isHighMatch
                ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                : "bg-amber-500/10 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400";

              return (
                <div 
                  key={job.id} 
                  className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-850 dark:bg-zinc-900/35 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-[280px]"
                >
                  <div className="space-y-3 min-h-0">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[180px]">
                          {job.role}
                        </h3>
                        <p className="text-3xs text-zinc-500 mt-0.5 font-semibold">
                          {job.company}
                        </p>
                      </div>
                      
                      <span className={`rounded-full px-2 py-0.5 text-4xs font-bold flex items-center gap-1 ${matchBadgeClass}`}>
                        <Sparkles className="h-3 w-3 fill-current animate-pulse" /> {job.matchRate}% Match
                      </span>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap gap-3 text-4xs text-zinc-450 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 shrink-0" /> {job.salary}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.tags.slice(0, 4).map(tag => {
                        const matched = job.matchedSkills.includes(tag);
                        return (
                          <span 
                            key={tag}
                            className={`rounded px-1.5 py-0.5 text-5xs font-bold uppercase tracking-wide border ${
                              matched 
                                ? "border-emerald-500/10 bg-emerald-500/5 text-emerald-600 dark:border-emerald-500/20 dark:text-emerald-400"
                                : "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-450"
                            }`}
                          >
                            {tag}
                          </span>
                        );
                      })}
                    </div>

                    {/* Preview description */}
                    <p className="text-3xs text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed mt-2.5">
                      {job.jdText}
                    </p>
                  </div>

                  {/* Actions footer */}
                  <div className="mt-4 border-t border-zinc-100 dark:border-zinc-800 pt-3 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleViewReport(job)}
                      className="rounded border border-zinc-200 px-3 py-1.5 text-3xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-950 flex items-center gap-1"
                    >
                      <Layers className="h-3.5 w-3.5" /> Reports
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToTracker(job)}
                        className="rounded border border-indigo-650 bg-indigo-500/5 hover:bg-indigo-600 hover:text-white px-3 py-1.5 text-3xs font-semibold text-indigo-650 dark:hover:text-white flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" /> Tracker
                      </button>
                      
                      <button
                        onClick={() => router.push("/dashboard/cover-letter")}
                        className="rounded bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 px-3 py-1.5 text-3xs font-semibold flex items-center gap-1"
                      >
                        Draft Letter <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REPORT OVERLAY MODAL */}
      {selectedReportJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
              <div>
                <span className="text-5xs text-indigo-500 font-bold uppercase tracking-wider block">AI Match Audit Report</span>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                  {selectedReportJob.role} at {selectedReportJob.company}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedReportJob(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isReportLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
                <p className="text-3xs text-zinc-400">Parsing job descriptions & auditing resume keywords...</p>
              </div>
            ) : (
              <div className="space-y-5 text-2xs leading-relaxed">
                
                {/* Score panel */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 dark:border-zinc-850 dark:bg-zinc-950/20 p-4 text-center">
                    <span className="text-4xs text-zinc-400 font-semibold block uppercase">Semantic Match</span>
                    <strong className={`text-2xl font-extrabold block mt-1 ${selectedReportJob.matchRate >= 90 ? "text-emerald-500" : "text-amber-500"}`}>
                      {selectedReportJob.matchRate}%
                    </strong>
                    <span className="text-5xs text-zinc-400 mt-1 block">Vector similarity score</span>
                  </div>

                  <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 dark:border-zinc-850 dark:bg-zinc-950/20 p-4 text-center">
                    <span className="text-4xs text-zinc-400 font-semibold block uppercase">ATS Compatibility</span>
                    <strong className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 block mt-1">
                      {selectedReportJob.atsScore}%
                    </strong>
                    <span className="text-5xs text-zinc-400 mt-1 block">Parser readiness score</span>
                  </div>
                </div>

                {/* Skills breakdown */}
                <div className="space-y-2.5">
                  <h3 className="text-3xs font-semibold text-zinc-400 uppercase tracking-wider block">Key Skill Matching</h3>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-4xs text-zinc-450 font-bold w-12 shrink-0">Matched:</span>
                      {selectedReportJob.matchedSkills.map((s: string) => (
                        <span key={s} className="rounded bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 text-4xs font-semibold flex items-center gap-0.5">
                          <CheckCircle2 className="h-3 w-3" /> {s}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-4xs text-zinc-450 font-bold w-12 shrink-0">Gaps:</span>
                      {selectedReportJob.missingSkills.map((s: string) => (
                        <span key={s} className="rounded bg-amber-500/10 text-amber-600 px-1.5 py-0.5 text-4xs font-semibold flex items-center gap-0.5">
                          <AlertTriangle className="h-3 w-3" /> {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-1.5 border-t border-zinc-100 dark:border-zinc-850 pt-4">
                  <h3 className="text-3xs font-semibold text-zinc-400 uppercase tracking-wider block">Resume Tuning Recommendations</h3>
                  <p className="text-3xs text-zinc-650 dark:text-zinc-350 leading-relaxed bg-zinc-50 dark:bg-zinc-950/60 p-3 rounded-lg border border-zinc-100 dark:border-zinc-850 italic">
                    "{selectedReportJob.recommendations}"
                  </p>
                </div>

                {/* Footer buttons */}
                <div className="border-t border-zinc-100 dark:border-zinc-850 pt-4 flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setSelectedReportJob(null)}
                    className="rounded border border-zinc-250 bg-white px-4 py-2 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Close Report
                  </button>
                  <button
                    onClick={() => {
                      setSelectedReportJob(null);
                      router.push("/dashboard/cover-letter");
                    }}
                    className="rounded bg-indigo-650 px-4 py-2 font-semibold text-white hover:bg-indigo-600 shadow-sm"
                  >
                    Optimize with AI Cover Letter
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
