"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useJobs } from "@/hooks/use-jobs";
import { 
  Sparkles, Plus, Calendar, MapPin, DollarSign, 
  Trash2, Edit, CheckCircle, Clock, ExternalLink, 
  List, Kanban, Filter, Search, Loader2, X, Flag, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Job, JobStatus } from "@/types";

export default function JobTrackerPage() {
  const { jobs, loading, addJob, updateJobStatus, updateJobDetails, deleteJob } = useJobs();
  const searchParams = useSearchParams();
  
  // View states
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setShowAddModal(true);
    }
  }, [searchParams]);

  // Form states
  const [formCompany, setFormCompany] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formJdUrl, setFormJdUrl] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formSalary, setFormSalary] = useState("");
  const [formStatus, setFormStatus] = useState<JobStatus>("saved");
  const [formNotes, setFormNotes] = useState("");
  const [formMatchScore, setFormMatchScore] = useState<number>(75);
  const [submitting, setSubmitting] = useState(false);

  // Filter states
  const [searchFilter, setSearchFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  
  // Drawer edit notes state
  const [drawerNotes, setDrawerNotes] = useState("");
  const [updatingNotes, setUpdatingNotes] = useState(false);

  const columns: { id: JobStatus; name: string; color: string }[] = [
    { id: "saved", name: "Saved", color: "border-t-zinc-400 bg-zinc-500/5" },
    { id: "applied", name: "Applied", color: "border-t-indigo-500 bg-indigo-500/5" },
    { id: "interview", name: "Interview", color: "border-t-amber-500 bg-amber-500/5" },
    { id: "offer", name: "Offer", color: "border-t-emerald-500 bg-emerald-500/5" },
    { id: "rejected", name: "Rejected", color: "border-t-red-500 bg-red-500/5" },
  ];

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: JobStatus) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData("text/plain");
    if (!jobId) return;

    try {
      await updateJobStatus(jobId, targetStatus);
      toast.success(`Job status updated to ${targetStatus}!`);
      // Update selected drawer if open
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob(prev => prev ? { ...prev, status: targetStatus } : null);
      }
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  // Add Job Submit
  const handleAddJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompany || !formRole) {
      toast.error("Company and role are required.");
      return;
    }

    setSubmitting(true);
    try {
      await addJob({
        company: formCompany,
        role: formRole,
        jdUrl: formJdUrl || null,
        location: formLocation || null,
        salary: formSalary || null,
        status: formStatus,
        notes: formNotes || null,
        matchScore: formMatchScore,
      });

      toast.success("Job application added!");
      setShowAddModal(false);
      
      // Reset form
      setFormCompany("");
      setFormRole("");
      setFormJdUrl("");
      setFormLocation("");
      setFormSalary("");
      setFormStatus("saved");
      setFormNotes("");
      setFormMatchScore(75);
    } catch (err) {
      toast.error("Failed to add job.");
    } finally {
      setSubmitting(false);
    }
  };

  // Save notes from Drawer
  const handleSaveDrawerNotes = async () => {
    if (!selectedJob) return;
    setUpdatingNotes(true);
    try {
      await updateJobDetails(selectedJob.id, { notes: drawerNotes });
      setSelectedJob(prev => prev ? { ...prev, notes: drawerNotes } : null);
      toast.success("Notes saved!");
    } catch (err) {
      toast.error("Failed to save notes.");
    } finally {
      setUpdatingNotes(false);
    }
  };

  // Delete Job
  const handleDeleteJobClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job application?")) return;
    try {
      await deleteJob(id);
      toast.success("Application deleted.");
      setSelectedJob(null);
    } catch (err) {
      toast.error("Failed to delete application.");
    }
  };

  // Stats aggregate
  const totalJobs = jobs.length;
  const appliedJobs = jobs.filter(j => j.status !== "saved").length;
  const interviewJobs = jobs.filter(j => j.status === "interview" || j.status === "offer").length;
  const responseRate = appliedJobs > 0 ? Math.round((interviewJobs / appliedJobs) * 100) : 0;
  const offerJobs = jobs.filter(j => j.status === "offer").length;
  const interviewConversion = interviewJobs > 0 ? Math.round((offerJobs / interviewJobs) * 100) : 0;

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const searchStr = `${job.company} ${job.role}`.toLowerCase();
    const searchMatch = searchStr.includes(searchFilter.toLowerCase());
    
    const locMatch = locationFilter === "all" 
      ? true 
      : locationFilter === "remote" 
      ? (job.location || "").toLowerCase().includes("remote")
      : !(job.location || "").toLowerCase().includes("remote");

    return searchMatch && locMatch;
  });

  // Unique locations list
  const locations = ["all", "remote", "on-site"];

  return (
    <div className="space-y-8 relative">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Job Application Tracker
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Log and manage your applications. Drag cards to update their search stages.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* View Toggle */}
          <div className="flex rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
            <button
              onClick={() => setViewMode("kanban")}
              className={`rounded-md p-1.5 transition-colors ${viewMode === "kanban" ? "bg-zinc-100 text-indigo-600 dark:bg-zinc-800 dark:text-indigo-400" : "text-zinc-400"}`}
              title="Kanban Board"
            >
              <Kanban className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-md p-1.5 transition-colors ${viewMode === "list" ? "bg-zinc-100 text-indigo-600 dark:bg-zinc-800 dark:text-indigo-400" : "text-zinc-400"}`}
              title="List View"
            >
              <List className="h-4.5 w-4.5" />
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-505 shadow-md shadow-indigo-600/10"
          >
            <Plus className="mr-1.5 h-4.5 w-4.5" /> Add Job
          </button>
        </div>
      </div>

      {/* PIPELINE STATS ROW */}
      <div className="grid grid-cols-3 gap-5 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-850 dark:bg-zinc-900/30 shadow-sm">
        <div className="text-center">
          <span className="text-4xs uppercase tracking-wider text-zinc-400 font-bold">Total Jobs Logged</span>
          <span className="block text-xl font-bold mt-1">{totalJobs}</span>
        </div>
        <div className="text-center border-x border-zinc-100 dark:border-zinc-800">
          <span className="text-4xs uppercase tracking-wider text-zinc-400 font-bold">Response Rate</span>
          <span className="block text-xl font-bold mt-1 text-indigo-600 dark:text-indigo-400">{responseRate}%</span>
        </div>
        <div className="text-center">
          <span className="text-4xs uppercase tracking-wider text-zinc-400 font-bold">Interview to Offer</span>
          <span className="block text-xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{interviewConversion}%</span>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
        <div className="relative w-72 max-w-full">
          <Search className="absolute inset-y-0 left-2.5 h-full w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search company or title..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-white py-1.5 pl-8 pr-2.5 text-4xs focus:border-indigo-500 focus:outline-none dark:border-zinc-850 dark:bg-zinc-950 dark:text-white"
          />
        </div>

        <div className="flex gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-3xs font-semibold text-zinc-400 uppercase">
            <Filter className="h-3.5 w-3.5" />
            <span>Location:</span>
          </div>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="rounded border border-zinc-200 bg-white px-2 py-1 text-4xs focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
          >
            <option value="all">All Locations</option>
            <option value="remote">Remote Only</option>
            <option value="onsite">On-Site Only</option>
          </select>
        </div>
      </div>

      {/* DRAGGABLE KANBAN BOARD VIEW */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse rounded-lg border border-zinc-200 bg-white p-4 h-80 dark:border-zinc-850 dark:bg-zinc-900/40" />
          ))}
        </div>
      ) : viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-stretch select-none">
          {columns.map((col) => {
            const colJobs = filteredJobs.filter(j => j.status === col.id);
            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`rounded-xl border-t-4 border border-zinc-200 p-4 dark:border-zinc-850 flex flex-col gap-3 min-h-[450px] ${col.color}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-2">
                  <span className="text-2xs font-extrabold text-zinc-850 dark:text-zinc-100">{col.name}</span>
                  <span className="rounded-full bg-zinc-200/50 dark:bg-zinc-800 px-2 py-0.5 text-4xs font-bold">{colJobs.length}</span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[500px] kanban-column">
                  {colJobs.map((job) => {
                    const matchColor = job.matchScore 
                      ? job.matchScore < 50 ? "bg-red-500/10 text-red-600" : job.matchScore <= 75 ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"
                      : "bg-zinc-100 text-zinc-550";

                    return (
                      <div
                        key={job.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, job.id)}
                        onClick={() => {
                          setSelectedJob(job);
                          setDrawerNotes(job.notes || "");
                        }}
                        className="rounded-lg border border-zinc-200 bg-white p-3.5 shadow-sm hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 hover:shadow transition-all cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-3xs text-zinc-400 block truncate">{job.company}</span>
                          {job.matchScore && (
                            <span className={`rounded-md px-1 py-0.5 text-4xs font-extrabold shrink-0 ${matchColor}`}>
                              {job.matchScore}%
                            </span>
                          )}
                        </div>
                        <h4 className="text-2xs font-bold text-zinc-900 dark:text-white truncate mt-1">{job.role}</h4>
                        
                        <div className="mt-3.5 flex items-center justify-between gap-2 text-4xs text-zinc-500">
                          <div className="flex items-center gap-1 min-w-0">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{job.location || "Remote"}</span>
                          </div>
                          {job.matchScore && job.matchScore > 80 && (
                            <span title="High match priority">
                              <Flag className="h-3 w-3 text-amber-500 fill-current shrink-0" />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {colJobs.length === 0 && (
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-zinc-200/40 dark:border-zinc-800/40 rounded-lg p-4 text-center">
                      <span className="text-4xs text-zinc-400 italic">Drag items here</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden dark:border-zinc-850 dark:bg-zinc-900/35 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-2xs">
              <thead>
                <tr className="border-b border-zinc-150 dark:border-zinc-800 text-zinc-400 uppercase text-3xs font-semibold">
                  <th className="py-2.5 px-4 font-bold">Role</th>
                  <th className="py-2.5 px-4 font-bold">Company</th>
                  <th className="py-2.5 px-4 font-bold">Location</th>
                  <th className="py-2.5 px-4 font-bold">Salary</th>
                  <th className="py-2.5 px-4 font-bold">Status</th>
                  <th className="py-2.5 px-4 font-bold">Match Score</th>
                  <th className="py-2.5 px-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                {filteredJobs.map((job) => (
                  <tr 
                    key={job.id} 
                    onClick={() => {
                      setSelectedJob(job);
                      setDrawerNotes(job.notes || "");
                    }}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-white truncate max-w-[150px]">
                      {job.role}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-650 dark:text-zinc-300 truncate max-w-[120px]">
                      {job.company}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500">
                      {job.location || "Remote"}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500">
                      {job.salary || "N/A"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-4xs font-bold capitalize ${
                        job.status === "offer" ? "bg-emerald-500/10 text-emerald-600" :
                        job.status === "interview" ? "bg-amber-500/10 text-amber-600" :
                        job.status === "applied" ? "bg-indigo-500/10 text-indigo-600" :
                        job.status === "rejected" ? "bg-red-500/10 text-red-600" :
                        "bg-zinc-200 text-zinc-700"
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {job.matchScore ? (
                        <span className={`font-extrabold ${job.matchScore < 50 ? "text-red-500" : job.matchScore <= 75 ? "text-amber-500" : "text-emerald-500"}`}>
                          {job.matchScore}%
                        </span>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDeleteJobClick(job.id)}
                        className="text-zinc-400 hover:text-red-500 p-1 rounded hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD JOB MODAL OVERLAY */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Add Job Application</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddJobSubmit} className="space-y-4 text-2xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-3xs font-semibold text-zinc-450 uppercase">Company *</label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="e.g. Stripe"
                    className="w-full rounded border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-3xs font-semibold text-zinc-455 uppercase">Role / Title *</label>
                  <input
                    type="text"
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Frontend Engineer"
                    className="w-full rounded border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-3xs font-semibold text-zinc-455 uppercase">Location</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Remote, SF"
                    className="w-full rounded border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-3xs font-semibold text-zinc-455 uppercase">Salary Range</label>
                  <input
                    type="text"
                    value={formSalary}
                    onChange={(e) => setFormSalary(e.target.value)}
                    placeholder="e.g. $120k - $140k"
                    className="w-full rounded border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-3xs font-semibold text-zinc-455 uppercase">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as JobStatus)}
                    className="w-full rounded border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  >
                    <option value="saved">Saved</option>
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-3xs font-semibold text-zinc-455 uppercase">Match Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formMatchScore}
                    onChange={(e) => setFormMatchScore(parseInt(e.target.value))}
                    className="w-full rounded border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-3xs font-semibold text-zinc-455 uppercase">JD URL</label>
                <input
                  type="url"
                  value={formJdUrl}
                  onChange={(e) => setFormJdUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-3xs font-semibold text-zinc-455 uppercase">Notes / Prep Details</label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Add notes, primary contacts, follow-up dates..."
                  className="w-full rounded border border-zinc-200 bg-zinc-50 p-2.5 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded border border-zinc-200 bg-white px-4 py-2 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Application
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* JOB DETAILS SIDE DRAWER */}
      <AnimatePresence>
        {selectedJob && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-3xs"
            />
            {/* Drawer side panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 220 }}
              className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white p-6 shadow-2xl dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 flex flex-col justify-between"
            >
              <div className="flex-grow overflow-y-auto space-y-6 pr-2">
                {/* Header info */}
                <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div className="min-w-0 pr-4">
                    <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide block truncate">{selectedJob.company}</h2>
                    <h1 className="text-sm font-bold text-zinc-950 dark:text-white mt-1 truncate">{selectedJob.role}</h1>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedJob(null)}
                    className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850 shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Details layout items */}
                <div className="grid grid-cols-2 gap-4 text-2xs">
                  <div className="p-3.5 rounded-lg border border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950/20 flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 text-zinc-450 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-4xs uppercase tracking-wider text-zinc-400 block font-semibold">Location</span>
                      <span className="font-semibold block truncate mt-0.5">{selectedJob.location || "Remote"}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg border border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950/20 flex items-center gap-2.5">
                    <DollarSign className="h-4 w-4 text-zinc-450 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-4xs uppercase tracking-wider text-zinc-400 block font-semibold">Salary Range</span>
                      <span className="font-semibold block truncate mt-0.5">{selectedJob.salary || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Match Score & Status badges */}
                <div className="flex items-center justify-between border-y border-zinc-100 dark:border-zinc-800 py-3.5 text-2xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500">Pipeline Stage:</span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 font-bold uppercase text-3xs ${
                      selectedJob.status === "offer" ? "bg-emerald-500/10 text-emerald-600" :
                      selectedJob.status === "interview" ? "bg-amber-500/10 text-amber-600" :
                      selectedJob.status === "applied" ? "bg-indigo-500/10 text-indigo-600" :
                      selectedJob.status === "rejected" ? "bg-red-500/10 text-red-600" :
                      "bg-zinc-200 text-zinc-700"
                    }`}>
                      {selectedJob.status}
                    </span>
                  </div>

                  {selectedJob.matchScore && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500">AI Match Score:</span>
                      <span className={`font-extrabold ${selectedJob.matchScore < 50 ? "text-red-500" : selectedJob.matchScore <= 75 ? "text-amber-500" : "text-emerald-500"}`}>
                        {selectedJob.matchScore}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Job Link */}
                {selectedJob.jdUrl && (
                  <div className="flex justify-start">
                    <a
                      href={selectedJob.jdUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-3xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Open Job Posting link
                    </a>
                  </div>
                )}

                {/* Interview Prep / Notes Textarea */}
                <div className="space-y-2 text-2xs">
                  <span className="text-3xs font-bold text-zinc-450 uppercase tracking-wide">Preparation & Application Notes</span>
                  <textarea
                    rows={6}
                    value={drawerNotes}
                    onChange={(e) => setDrawerNotes(e.target.value)}
                    placeholder="Type interview notes, questions asked, contact details, or next steps..."
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs placeholder-zinc-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-850 dark:bg-zinc-950 dark:text-white"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveDrawerNotes}
                      disabled={updatingNotes}
                      className="rounded bg-indigo-600 px-3.5 py-1.5 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 text-3xs flex items-center gap-1 shadow-sm"
                    >
                      {updatingNotes && <Loader2 className="h-3 w-3 animate-spin" />}
                      Save Notes
                    </button>
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="space-y-3.5 text-2xs border-t border-zinc-100 dark:border-zinc-800 pt-4">
                  <span className="text-3xs font-bold text-zinc-455 uppercase tracking-wide block">Activity Timeline</span>
                  
                  <div className="space-y-4 relative pl-4 border-l border-zinc-150 dark:border-zinc-800">
                    <div className="relative">
                      <div className="absolute -left-5.5 mt-0.5 h-3.5 w-3.5 rounded-full border-2 border-indigo-600 bg-white dark:bg-zinc-900" />
                      <div className="flex justify-between">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">Added to Job Tracker</span>
                        <span className="text-4xs text-zinc-400">{new Date(selectedJob.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-4xs text-zinc-500 mt-0.5">Application entry logged at status "{selectedJob.status}".</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-5.5 mt-0.5 h-3.5 w-3.5 rounded-full border-2 border-zinc-300 bg-white dark:bg-zinc-900" />
                      <div className="flex justify-between">
                        <span className="font-semibold text-zinc-500">Pipeline Updated</span>
                        <span className="text-4xs text-zinc-400">{new Date(selectedJob.appliedAt || selectedJob.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-4xs text-zinc-500 mt-0.5">User transitioned the pipeline stage card.</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Delete application action at bottom */}
              <div className="border-t border-zinc-150 dark:border-zinc-800 pt-4 flex justify-between items-center text-2xs">
                <button
                  onClick={() => handleDeleteJobClick(selectedJob.id)}
                  className="inline-flex items-center justify-center rounded-lg border border-red-200 hover:border-red-500 bg-white px-3.5 py-1.5 font-semibold text-red-600 hover:bg-red-50 dark:border-red-950 dark:bg-zinc-950 dark:text-red-400 dark:hover:bg-red-950/20 transition-all duration-150"
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete Job
                </button>

                <button
                  onClick={() => setSelectedJob(null)}
                  className="rounded-lg bg-zinc-100 hover:bg-zinc-200 px-4 py-1.5 font-bold dark:bg-zinc-800 dark:hover:bg-zinc-700"
                >
                  Close Drawer
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
