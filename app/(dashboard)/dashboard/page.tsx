"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Sparkles, FileSearch, PenTool, PlusCircle, Calendar, 
  ArrowUpRight, ArrowDownRight, TrendingUp, Briefcase, 
  Award, Clock, CheckCircle2, AlertCircle
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useJobs } from "@/hooks/use-jobs";
import { useAnalyses } from "@/hooks/use-analyses";

export default function DashboardPage() {
  const { user } = useUser();
  const { jobs, loading: jobsLoading } = useJobs();
  const { analyses, loading: analysesLoading } = useAnalyses();
  const [stats, setStats] = useState<any>({
    totalApplications: 0,
    interviewRate: 0,
    avgMatchScore: 0,
    activeJobs: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok && isMounted) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      } finally {
        if (isMounted) setLoadingStats(false);
      }
    }
    fetchStats();
    return () => { isMounted = false; };
  }, [jobs.length, analyses.length]);

  // Extract upcoming followups
  const upcomingFollowups = jobs
    .filter(j => j.followUpDate && new Date(j.followUpDate) >= new Date() && j.status !== "rejected" && j.status !== "offer")
    .sort((a, b) => new Date(a.followUpDate!).getTime() - new Date(b.followUpDate!).getTime())
    .slice(0, 5);

  const recentAnalyses = analyses.slice(0, 5);
  const isLoading = loadingStats || jobsLoading || analysesLoading;

  const quickActions = [
    {
      title: "Analyze Resume",
      desc: "Run ATS audit or job match scoring",
      href: "/dashboard/analyzer",
      icon: <FileSearch className="h-5 w-5 text-emerald-400" />,
      color: "border-graphite-border hover:border-emerald-500/50 bg-graphite-surface"
    },
    {
      title: "Track New Application",
      desc: "Log an opportunity on the Kanban board",
      href: "/dashboard/tracker?add=true",
      icon: <PlusCircle className="h-5 w-5 text-teal-400" />,
      color: "border-graphite-border hover:border-teal-500/50 bg-graphite-surface"
    },
    {
      title: "Generate Cover Letter",
      desc: "Draft a personalized AI application letter",
      href: "/dashboard/cover-letter",
      icon: <PenTool className="h-5 w-5 text-emerald-400" />,
      color: "border-graphite-border hover:border-emerald-500/50 bg-graphite-surface"
    }
  ];

  return (
    <div className="space-y-8">
      
      {/* Header welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Welcome back, {user?.name || "Job Seeker"}!
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Here's what is happening with your job pipeline today.
          </p>
        </div>
        
        <div className="flex items-center gap-2 rounded-lg border border-graphite-border bg-graphite-surface px-3.5 py-2 text-xs font-medium text-gray-300 shadow-sm">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <span>Pipeline status: <strong className="text-emerald-400">Active</strong></span>
        </div>
      </div>

      {/* SKELETON LOADER FOR STATS */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-graphite-border bg-graphite-surface p-6">
              <div className="h-4 w-2/5 rounded bg-graphite-border mb-3" />
              <div className="h-8 w-3/5 rounded bg-graphite-border" />
            </div>
          ))}
        </div>
      ) : (
        /* Stats Metric Cards Grid */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Card 1: Total Applications */}
          <div className="rounded-xl border border-graphite-border bg-graphite-surface p-6 hover-card shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">Total Applications</span>
              <div className="rounded-lg bg-emerald-500/10 p-2 border border-emerald-500/20">
                <Briefcase className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{stats.totalApplications}</span>
              <span className="inline-flex items-center gap-0.5 text-3xs font-semibold text-emerald-400">
                <ArrowUpRight className="h-3 w-3" /> +12%
              </span>
            </div>
            <span className="text-4xs text-gray-500 block mt-1">vs last month</span>
          </div>

          {/* Card 2: Interview Conversion Rate */}
          <div className="rounded-xl border border-graphite-border bg-graphite-surface p-6 hover-card shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">Interview Rate</span>
              <div className="rounded-lg bg-teal-500/10 p-2 border border-teal-500/20">
                <CheckCircle2 className="h-4 w-4 text-teal-400" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{stats.interviewRate}%</span>
              <span className="inline-flex items-center gap-0.5 text-3xs font-semibold text-emerald-400">
                <ArrowUpRight className="h-3 w-3" /> +4%
              </span>
            </div>
            <span className="text-4xs text-gray-500 block mt-1">Conversion velocity</span>
          </div>

          {/* Card 3: Average Match Score */}
          <div className="rounded-xl border border-graphite-border bg-graphite-surface p-6 hover-card shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">Avg Match Score</span>
              <div className="rounded-lg bg-emerald-500/10 p-2 border border-emerald-500/20">
                <Award className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{stats.avgMatchScore}%</span>
              <span className="inline-flex items-center gap-0.5 text-3xs font-semibold text-gray-400">
                Active audits
              </span>
            </div>
            <span className="text-4xs text-gray-500 block mt-1">Across all AI resume audits</span>
          </div>

          {/* Card 4: Active Open Jobs */}
          <div className="rounded-xl border border-graphite-border bg-graphite-surface p-6 hover-card shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">Active Pipeline</span>
              <div className="rounded-lg bg-teal-500/10 p-2 border border-teal-500/20">
                <Clock className="h-4 w-4 text-teal-400" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{stats.activeJobs}</span>
              <span className="inline-flex items-center gap-0.5 text-3xs font-semibold text-emerald-400">
                In progress
              </span>
            </div>
            <span className="text-4xs text-gray-500 block mt-1">Applied & Interviewing stages</span>
          </div>

        </div>
      )}

      {/* QUICK ACTION CONTROLS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className={`flex items-start gap-4 rounded-xl border p-5 transition-all duration-200 ${action.color} group shadow-sm`}
          >
            <div className="rounded-lg bg-graphite-base p-2.5 shadow-sm border border-graphite-border">
              {action.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                {action.title}
              </h3>
              <p className="text-4xs text-gray-400 mt-1 leading-normal">
                {action.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* MAIN LAYOUT SPLIT PANELS */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Left Side Panel: Recent Activity */}
        <div className="rounded-xl border border-graphite-border bg-graphite-surface p-6 shadow-sm lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-graphite-border pb-4 mb-4">
              <div>
                <h2 className="text-sm font-bold text-white">Recent AI Analyses</h2>
                <p className="text-4xs text-gray-400 mt-0.5">Your latest resume match and ATS checks.</p>
              </div>
              <Link 
                href="/dashboard/analyzer" 
                className="text-4xs font-semibold text-emerald-400 hover:underline"
              >
                View Analyzer
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center justify-between py-2">
                    <div className="space-y-2 flex-1">
                      <div className="h-3.5 w-1/3 rounded bg-graphite-border" />
                      <div className="h-3 w-1/5 rounded bg-graphite-border" />
                    </div>
                    <div className="h-6 w-12 rounded bg-graphite-border" />
                  </div>
                ))}
              </div>
            ) : recentAnalyses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileSearch className="h-10 w-10 text-gray-600 mb-3" />
                <h3 className="text-xs font-semibold text-white">No analyses run yet</h3>
                <p className="text-4xs text-gray-400 mt-1 max-w-xs leading-normal">
                  Upload a resume and click Run ATS Check or Match Analysis to generate scores.
                </p>
                <Link 
                  href="/dashboard/analyzer"
                  className="mt-4 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-3xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-600/10"
                >
                  Analyze Resume
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-graphite-border">
                {recentAnalyses.map((analysis) => {
                  const matchScore = analysis.matchScore;
                  let badgeColor = "bg-red-500/10 text-red-400 border border-red-500/20";
                  if (matchScore >= 50 && matchScore <= 75) badgeColor = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                  if (matchScore > 75) badgeColor = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";

                  return (
                    <div key={analysis.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                      <div className="min-w-0 pr-4">
                        <h3 className="text-2xs font-semibold text-white truncate">
                          {analysis.resume?.filename || "Resume"}
                        </h3>
                        <p className="text-4xs text-gray-400 mt-0.5 truncate leading-relaxed">
                          Job: {analysis.jobDescription.slice(0, 75)}...
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-4xs text-gray-500">
                          {new Date(analysis.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-2xs font-bold ${badgeColor}`}>
                          {matchScore}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side Panel: Upcoming Follow-ups */}
        <div className="rounded-xl border border-graphite-border bg-graphite-surface p-6 shadow-sm lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-graphite-border pb-4 mb-4">
              <div>
                <h2 className="text-sm font-bold text-white">Upcoming Follow-ups</h2>
                <p className="text-4xs text-gray-400 mt-0.5">Stay active with recruiter conversations.</p>
              </div>
              <Calendar className="h-4.5 w-4.5 text-gray-400" />
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse flex gap-3 py-2">
                    <div className="h-8 w-8 rounded-full bg-graphite-border shrink-0" />
                    <div className="space-y-2 flex-grow">
                      <div className="h-3.5 w-1/2 rounded bg-graphite-border" />
                      <div className="h-3 w-1/3 rounded bg-graphite-border" />
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingFollowups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="h-10 w-10 text-gray-600 mb-3" />
                <h3 className="text-xs font-semibold text-white">All caught up!</h3>
                <p className="text-4xs text-gray-400 mt-1 max-w-2xs leading-normal">
                  No pending recruiter follow-ups found on your job tracker board.
                </p>
                <Link 
                  href="/dashboard/tracker"
                  className="mt-4 inline-flex items-center justify-center rounded-lg border border-graphite-border bg-graphite-base px-3.5 py-1.5 text-4xs font-semibold text-gray-300 hover:bg-graphite-surfaceHover hover:text-white transition-colors"
                >
                  Manage Jobs
                </Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                {upcomingFollowups.map((job) => (
                  <div key={job.id} className="flex items-start gap-3 rounded-lg border border-graphite-border bg-graphite-base p-3 shadow-sm">
                    <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-3xs uppercase shrink-0">
                      {job.company.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xs font-bold truncate text-white">
                        {job.role}
                      </h3>
                      <p className="text-4xs text-gray-400 truncate leading-relaxed">
                        {job.company} &bull; {job.location || "Remote"}
                      </p>
                      
                      <div className="flex items-center gap-1.5 text-4xs font-medium text-amber-400 mt-1.5">
                        <Calendar className="h-3 w-3" />
                        <span>Due {new Date(job.followUpDate!).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

