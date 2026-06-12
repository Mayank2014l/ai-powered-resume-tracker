"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Sparkles, FileSearch, PenTool, PlusCircle, Calendar, 
  ArrowUpRight, ArrowDownRight, TrendingUp, Briefcase, 
  Award, Clock, CheckCircle2, AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
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
    async function fetchStats() {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      } finally {
        setLoadingStats(false);
      }
    }
    fetchStats();
  }, [jobs, analyses]);

  // Extract upcoming followups
  const upcomingFollowups = jobs
    .filter(j => j.followUpDate && new Date(j.followUpDate) >= new Date() && j.status !== "rejected" && j.status !== "offer")
    .sort((a, b) => new Date(a.followUpDate!).getTime() - new Date(b.followUpDate!).getTime())
    .slice(0, 5);

  const recentAnalyses = analyses.slice(0, 5);
  const isLoading = loadingStats || jobsLoading || analysesLoading;

  const quickActions = [
    {
      title: "Analyze New Resume",
      desc: "Run ATS and skill audits against a JD",
      href: "/dashboard/analyzer",
      icon: <FileSearch className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      color: "bg-indigo-500/10 dark:bg-indigo-500/5 hover:border-indigo-500/50"
    },
    {
      title: "Add Job Application",
      desc: "Log a new opportunity on the Kanban",
      href: "/dashboard/tracker?add=true",
      icon: <PlusCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
      color: "bg-emerald-500/10 dark:bg-emerald-500/5 hover:border-emerald-500/50"
    },
    {
      title: "Generate Cover Letter",
      desc: "Draft a personalized Claude-powered letter",
      href: "/dashboard/cover-letter",
      icon: <PenTool className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
      color: "bg-amber-500/10 dark:bg-amber-500/5 hover:border-amber-500/50"
    }
  ];

  return (
    <div className="space-y-8">
      
      {/* Header welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Welcome back, {user?.name || "Job Seeker"}!
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Here's what is happening with your job search today.
          </p>
        </div>
        
        <div className="flex items-center gap-2 rounded-lg border border-zinc-200/60 bg-white p-3 text-xs font-medium dark:border-zinc-800 dark:bg-zinc-900/50 shadow-sm">
          <TrendingUp className="h-4 w-4 text-indigo-500" />
          <span>Active search status: <strong className="text-indigo-600 dark:text-indigo-400">On Track</strong></span>
        </div>
      </div>

      {/* SKELETON LOADER FOR STATS */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/40">
              <div className="h-4 w-2/5 rounded bg-zinc-200 dark:bg-zinc-850 mb-3" />
              <div className="h-8 w-3/5 rounded bg-zinc-200 dark:bg-zinc-850" />
            </div>
          ))}
        </div>
      ) : (
        /* Stats Metric Cards Grid */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Card 1: Total Applications */}
          <div className="rounded-xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800/80 dark:bg-zinc-900/40 hover-card shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Applications</span>
              <div className="rounded-lg bg-indigo-500/10 p-2 dark:bg-indigo-500/5">
                <Briefcase className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{stats.totalApplications}</span>
              <span className="inline-flex items-center gap-0.5 text-3xs font-semibold text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="h-3 w-3" /> +12%
              </span>
            </div>
            <span className="text-4xs text-zinc-400 block mt-1">v.s. last month</span>
          </div>

          {/* Card 2: Interview Conversion Rate */}
          <div className="rounded-xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800/80 dark:bg-zinc-900/40 hover-card shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Interview Rate</span>
              <div className="rounded-lg bg-indigo-500/10 p-2 dark:bg-indigo-500/5">
                <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{stats.interviewRate}%</span>
              <span className="inline-flex items-center gap-0.5 text-3xs font-semibold text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="h-3 w-3" /> +4%
              </span>
            </div>
            <span className="text-4xs text-zinc-400 block mt-1">Average conversion rate</span>
          </div>

          {/* Card 3: Average Match Score */}
          <div className="rounded-xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800/80 dark:bg-zinc-900/40 hover-card shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Avg Match Score</span>
              <div className="rounded-lg bg-indigo-500/10 p-2 dark:bg-indigo-500/5">
                <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{stats.avgMatchScore}%</span>
              <span className="inline-flex items-center gap-0.5 text-3xs font-semibold text-zinc-500">
                0% change
              </span>
            </div>
            <span className="text-4xs text-zinc-400 block mt-1">Across all AI resume audits</span>
          </div>

          {/* Card 4: Active Open Jobs */}
          <div className="rounded-xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800/80 dark:bg-zinc-900/40 hover-card shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Active Opportunities</span>
              <div className="rounded-lg bg-indigo-500/10 p-2 dark:bg-indigo-500/5">
                <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{stats.activeJobs}</span>
              <span className="inline-flex items-center gap-0.5 text-3xs font-semibold text-red-655 text-red-500">
                <ArrowDownRight className="h-3 w-3" /> -2
              </span>
            </div>
            <span className="text-4xs text-zinc-400 block mt-1">Applied & Interviewing stages</span>
          </div>

        </div>
      )}

      {/* QUICK ACTION CONTROLS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className={`flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-850 dark:bg-zinc-900/45 transition-all duration-200 ${action.color} group shadow-sm`}
          >
            <div className="rounded-lg bg-white p-2.5 shadow-sm dark:bg-zinc-950">
              {action.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {action.title}
              </h3>
              <p className="text-4xs text-zinc-500 dark:text-zinc-400 mt-1 leading-normal">
                {action.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* MAIN LAYOUT SPLIT PANELS */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Left Side Panel: Recent Activity (60%) */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/35 shadow-sm lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Recent AI Analyses</h2>
                <p className="text-4xs text-zinc-400 mt-0.5">Your last 5 resume match checks.</p>
              </div>
              <Link 
                href="/dashboard/analyzer" 
                className="text-4xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                View Analyzer
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center justify-between py-2">
                    <div className="space-y-2 flex-1">
                      <div className="h-3.5 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                      <div className="h-3 w-1/5 rounded bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                    <div className="h-6 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                ))}
              </div>
            ) : recentAnalyses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileSearch className="h-10 w-10 text-zinc-350 mb-3" />
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-white">No analyses run yet</h3>
                <p className="text-4xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs leading-normal">
                  Upload a resume and paste a job description to get your first match score.
                </p>
                <Link 
                  href="/dashboard/analyzer"
                  className="mt-4 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3 py-1.5 text-4xs font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  Analyze Resume
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-850">
                {recentAnalyses.map((analysis) => {
                  const matchScore = analysis.matchScore;
                  let badgeColor = "bg-red-500/10 text-red-600 dark:text-red-400";
                  if (matchScore >= 50 && matchScore <= 75) badgeColor = "bg-amber-500/10 text-amber-600 dark:text-amber-400";
                  if (matchScore > 75) badgeColor = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";

                  return (
                    <div key={analysis.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                      <div className="min-w-0 pr-4">
                        <h3 className="text-2xs font-semibold text-zinc-900 dark:text-white truncate">
                          {analysis.resume?.filename || "Resume"}
                        </h3>
                        <p className="text-4xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate leading-relaxed">
                          Job Audit: {analysis.jobDescription.slice(0, 75)}...
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-4xs text-zinc-400">
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

        {/* Right Side Panel: Upcoming Follow-ups (40%) */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/35 shadow-sm lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Upcoming Follow-ups</h2>
                <p className="text-4xs text-zinc-400 mt-0.5">Stay active with recruiter conversations.</p>
              </div>
              <Calendar className="h-4.5 w-4.5 text-zinc-400" />
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse flex gap-3 py-2">
                    <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                    <div className="space-y-2 flex-grow">
                      <div className="h-3.5 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
                      <div className="h-3 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingFollowups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="h-10 w-10 text-zinc-350 mb-3" />
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-white">All caught up!</h3>
                <p className="text-4xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xs leading-normal">
                  No pending recruiter follow-ups found on your job tracker board.
                </p>
                <Link 
                  href="/dashboard/tracker"
                  className="mt-4 inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-4xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                >
                  Manage Jobs
                </Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                {upcomingFollowups.map((job) => (
                  <div key={job.id} className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-850 dark:bg-zinc-900/60 shadow-sm">
                    {/* Small initials circular representation */}
                    <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-3xs uppercase shrink-0">
                      {job.company.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xs font-bold truncate text-zinc-900 dark:text-white">
                        {job.role}
                      </h3>
                      <p className="text-4xs text-zinc-500 dark:text-zinc-400 truncate leading-relaxed">
                        {job.company} &bull; {job.location || "Remote"}
                      </p>
                      
                      <div className="flex items-center gap-1.5 text-4xs font-medium text-amber-600 dark:text-amber-400 mt-1.5">
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
