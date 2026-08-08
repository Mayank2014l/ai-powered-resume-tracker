"use client";

import React, { useState, useEffect, Suspense } from "react";
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

function JobTrackerContent() {
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
    { id: "saved", name: "Saved", color: "border-t-gray-500 bg-graphite-surface/40" },
    { id: "applied", name: "Applied", color: "border-t-emerald-500 bg-emerald-500/5" },
    { id: "interview", name: "Interview", color: "border-t-amber-500 bg-amber-500/5" },
    { id: "offer", name: "Offer", color: "border-t-teal-500 bg-teal-500/5" },
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

  return (
    <div className="space-y-8 relative">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Job Application Tracker
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Log and manage your applications. Drag cards between columns to update pipeline stages.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* View Toggle */}
          <div className="flex rounded-lg border border-graphite-border bg-graphite-surface p-1 shadow-sm">
            <button
              onClick={() => setViewMode("kanban")}
              className={`rounded-md p-1.5 transition-colors ${viewMode === "kanban" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"}`}
              title="Kanban Board"
            >
              <Kanban className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-md p-1.5 transition-colors ${viewMode === "list" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"}`}
              title="List View"
            >
              <List className="h-4.5 w-4.5" />
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/10 transition-colors"
          >
            <Plus className="mr-1.5 h-4.5 w-4.5" /> Add Job
          </button>
        </div>
      </div>

      {/* PIPELINE STATS ROW */}
      <div className="grid grid-cols-3 gap-5 rounded-xl border border-graphite-border bg-graphite-surface p-5 shadow-sm">
        <div className="text-center">
          <span className="text-4xs uppercase tracking-wider text-gray-400 font-bold">Total Jobs Logged</span>
          <span className="block text-xl font-bold mt-1 text-white">{totalJobs}</span>
        </div>
        <div className="text-center border-x border-graphite-border">
          <span className="text-4xs uppercase tracking-wider text-gray-400 font-bold">Response Rate</span>
          <span className="block text-xl font-bold mt-1 text-emerald-400">{responseRate}%</span>
        </div>
        <div className="text-center">
          <span className="text-4xs uppercase tracking-wider text-gray-400 font-bold">Interview to Offer</span>
          <span className="block text-xl font-bold mt-1 text-teal-400">{interviewConversion}%</span>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
        <div className="relative w-72 max-w-full">
          <Search className="absolute inset-y-0 left-2.5 h-full w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search company or title..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full rounded-md border border-graphite-border bg-graphite-base py-1.5 pl-8 pr-2.5 text-4xs text-gray-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-3xs font-semibold text-gray-400 uppercase">
            <Filter className="h-3.5 w-3.5" />
            <span>Location:</span>
          </div>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="rounded border border-graphite-border bg-graphite-surface px-2.5 py-1 text-4xs text-gray-200 focus:border-emerald-500 focus:outline-none"
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
            <div key={i} className="animate-pulse rounded-lg border border-graphite-border bg-graphite-surface p-4 h-80" />
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
                className={`rounded-xl border-t-4 border border-graphite-border p-4 flex flex-col gap-3 min-h-[450px] ${col.color}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-graphite-border pb-2">
                  <span className="text-2xs font-extrabold text-white">{col.name}</span>
                  <span className="rounded-full bg-graphite-border px-2 py-0.5 text-4xs font-bold text-gray-300">{colJobs.length}</span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[500px] kanban-column">
                  {colJobs.map((job) => {
                    const matchColor = job.matchScore 
                      ? job.matchScore < 50 ? "bg-red-500/10 text-red-400 border border-red-500/20" : job.matchScore <= 75 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-graphite-base text-gray-400 border border-graphite-border";

                    return (
                      <div
                        key={job.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, job.id)}
                        onClick={() => {
                          setSelectedJob(job);
                          setDrawerNotes(job.notes || "");
                        }}
                        className="rounded-lg border border-graphite-border bg-graphite-surface p-3.5 shadow-sm hover:border-graphite-borderHover hover:shadow transition-all cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-3xs text-gray-400 block truncate">{job.company}</span>
                          {job.matchScore && (
                            <span className={`rounded-md px-1.5 py-0.5 text-4xs font-extrabold shrink-0 ${matchColor}`}>
                              {job.matchScore}%
                            </span>
                          )}
                        </div>
                        <h4 className="text-2xs font-bold text-white truncate mt-1">{job.role}</h4>
                        
                        <div className="mt-3.5 flex items-center justify-between gap-2 text-4xs text-gray-400">
                          <div className="flex items-center gap-1 min-w-0">
                            <MapPin className="h-3 w-3 shrink-0 text-gray-500" />
                            <span className="truncate">{job.location || "Remote"}</span>
                          </div>
                          {job.matchScore && job.matchScore > 80 && (
                            <span title="High match priority">
                              <Flag className="h-3 w-3 text-emerald-400 fill-current shrink-0" />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {colJobs.length === 0 && (
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-graphite-border/60 rounded-lg p-4 text-center">
                      <span className="text-4xs text-gray-500 italic">Drag items here</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="rounded-xl border border-graphite-border bg-graphite-surface overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-2xs">
              <thead>
                <tr className="border-b border-graphite-border text-gray-400 uppercase text-3xs font-semibold">
                  <th className="py-2.5 px-4 font-bold">Role</th>
                  <th className="py-2.5 px-4 font-bold">Company</th>
                  <th className="py-2.5 px-4 font-bold">Location</th>
                  <th className="py-2.5 px-4 font-bold">Salary</th>
                  <th className="py-2.5 px-4 font-bold">Status</th>
                  <th className="py-2.5 px-4 font-bold">Match Score</th>
                  <th className="py-2.5 px-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-border">
                {filteredJobs.map((job) => (
                  <tr 
                    key={job.id} 
                    onClick={() => {
                      setSelectedJob(job);
                      setDrawerNotes(job.notes || "");
                    }}
                    className="hover:bg-graphite-surfaceHover/50 cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-bold text-white truncate max-w-[150px]">
                      {job.role}
                    </td>
                    <td className="py-3.5 px-4 text-gray-300 truncate max-w-[120px]">
                      {job.company}
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">
                      {job.location || "Remote"}
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">
                      {job.salary || "N/A"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-4xs font-bold capitalize ${
                        job.status === "offer" ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" :
                        job.status === "interview" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        job.status === "applied" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        job.status === "rejected" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                        "bg-gray-700/50 text-gray-300"
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {job.matchScore ? (
                        <span className={`font-extrabold ${job.matchScore < 50 ? "text-red-400" : job.matchScore <= 75 ? "text-amber-400" : "text-emerald-400"}`}>
                          {job.matchScore}%
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDeleteJobClick(job.id)}
                        className="text-gray-400 hover:text-red-400 p-1 rounded hover:bg-graphite-surfaceHover transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-graphite-border bg-graphite-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-graphite-border pb-3 mb-4">
              <h2 className="text-sm font-bold text-white">Add Job Application</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-graphite-surfaceHover"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddJobSubmit} className="space-y-4 text-2xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-3xs font-semibold text-gray-400 uppercase">Company *</label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="e.g. Stripe"
                    className="w-full rounded border border-graphite-border bg-graphite-base px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-3xs font-semibold text-gray-400 uppercase">Role / Title *</label>
                  <input
                    type="text"
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Frontend Engineer"
                    className="w-full rounded border border-graphite-border bg-graphite-base px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-3xs font-semibold text-gray-400 uppercase">Location</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Remote, SF"
                    className="w-full rounded border border-graphite-border bg-graphite-base px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-3xs font-semibold text-gray-400 uppercase">Salary Range</label>
                  <input
                    type="text"
                    value={formSalary}
                    onChange={(e) => setFormSalary(e.target.value)}
                    placeholder="e.g. $120k - $140k"
                    className="w-full rounded border border-graphite-border bg-graphite-base px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-3xs font-semibold text-gray-400 uppercase">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as JobStatus)}
                    className="w-full rounded border border-graphite-border bg-graphite-base px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none text-white"
                  >
                    <option value="saved">Saved</option>
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-3xs font-semibold text-gray-400 uppercase">Match Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formMatchScore}
                    onChange={(e) => setFormMatchScore(parseInt(e.target.value))}
                    className="w-full rounded border border-graphite-border bg-graphite-base px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-3xs font-semibold text-gray-400 uppercase">JD URL</label>
                <input
                  type="url"
                  value={formJdUrl}
                  onChange={(e) => setFormJdUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded border border-graphite-border bg-graphite-base px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-3xs font-semibold text-gray-400 uppercase">Notes / Prep Details</label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Add notes, primary contacts, follow-up dates..."
                  className="w-full rounded border border-graphite-border bg-graphite-base p-2.5 focus:border-emerald-500 focus:outline-none text-white"
                />
              </div>

              <div className="border-t border-graphite-border pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded border border-graphite-border bg-graphite-base px-4 py-2 hover:bg-graphite-surfaceHover text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-emerald-600/10"
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
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-3xs"
            />
            {/* Drawer side panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 220 }}
              className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-graphite-surface p-6 shadow-2xl border-l border-graphite-border flex flex-col justify-between"
            >
              <div className="flex-grow overflow-y-auto space-y-6 pr-2">
                {/* Header info */}
                <div className="flex items-start justify-between border-b border-graphite-border pb-4">
                  <div className="min-w-0 pr-4">
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide block truncate">{selectedJob.company}</h2>
                    <h1 className="text-sm font-bold text-white mt-1 truncate">{selectedJob.role}</h1>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedJob(null)}
                    className="rounded-lg p-1 text-gray-400 hover:bg-graphite-surfaceHover shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Details layout items */}
                <div className="grid grid-cols-2 gap-4 text-2xs">
                  <div className="p-3.5 rounded-lg border border-graphite-border bg-graphite-base/40 flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-4xs uppercase tracking-wider text-gray-400 block font-semibold">Location</span>
                      <span className="font-semibold block truncate mt-0.5 text-white">{selectedJob.location || "Remote"}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg border border-graphite-border bg-graphite-base/40 flex items-center gap-2.5">
                    <DollarSign className="h-4 w-4 text-teal-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-4xs uppercase tracking-wider text-gray-400 block font-semibold">Salary Range</span>
                      <span className="font-semibold block truncate mt-0.5 text-white">{selectedJob.salary || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Match Score & Status badges */}
                <div className="flex items-center justify-between border-y border-graphite-border py-3.5 text-2xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">Pipeline Stage:</span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 font-bold uppercase text-3xs ${
                      selectedJob.status === "offer" ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" :
                      selectedJob.status === "interview" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                      selectedJob.status === "applied" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      selectedJob.status === "rejected" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                      "bg-gray-700/50 text-gray-300"
                    }`}>
                      {selectedJob.status}
                    </span>
                  </div>

                  {selectedJob.matchScore && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400">Match Score:</span>
                      <span className={`font-extrabold ${selectedJob.matchScore < 50 ? "text-red-400" : selectedJob.matchScore <= 75 ? "text-amber-400" : "text-emerald-400"}`}>
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
                      className="text-3xs font-semibold text-emerald-400 flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Open Job Posting link
                    </a>
                  </div>
                )}

                {/* Interview Prep / Notes Textarea */}
                <div className="space-y-2 text-2xs">
                  <span className="text-3xs font-bold text-gray-400 uppercase tracking-wide">Preparation & Application Notes</span>
                  <textarea
                    rows={6}
                    value={drawerNotes}
                    onChange={(e) => setDrawerNotes(e.target.value)}
                    placeholder="Type interview notes, questions asked, contact details, or next steps..."
                    className="w-full rounded-lg border border-graphite-border bg-graphite-base p-3 text-xs placeholder-gray-500 focus:border-emerald-500 focus:outline-none text-white"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveDrawerNotes}
                      disabled={updatingNotes}
                      className="rounded bg-emerald-600 px-3.5 py-1.5 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 text-3xs flex items-center gap-1 shadow-md shadow-emerald-600/10"
                    >
                      {updatingNotes && <Loader2 className="h-3 w-3 animate-spin" />}
                      Save Notes
                    </button>
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="space-y-3.5 text-2xs border-t border-graphite-border pt-4">
                  <span className="text-3xs font-bold text-gray-400 uppercase tracking-wide block">Activity Timeline</span>
                  
                  <div className="space-y-4 relative pl-4 border-l border-graphite-border">
                    <div className="relative">
                      <div className="absolute -left-5.5 mt-0.5 h-3.5 w-3.5 rounded-full border-2 border-emerald-500 bg-graphite-surface" />
                      <div className="flex justify-between">
                        <span className="font-semibold text-white">Added to Job Tracker</span>
                        <span className="text-4xs text-gray-400">{new Date(selectedJob.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-4xs text-gray-400 mt-0.5">Application entry logged at status "{selectedJob.status}".</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-5.5 mt-0.5 h-3.5 w-3.5 rounded-full border-2 border-teal-500 bg-graphite-surface" />
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-300">Pipeline Updated</span>
                        <span className="text-4xs text-gray-400">{new Date(selectedJob.appliedAt || selectedJob.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-4xs text-gray-400 mt-0.5">Pipeline stage modified.</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Delete application action at bottom */}
              <div className="border-t border-graphite-border pt-4 flex justify-between items-center text-2xs">
                <button
                  onClick={() => handleDeleteJobClick(selectedJob.id)}
                  className="inline-flex items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-1.5 font-semibold text-red-400 hover:bg-red-500/20 transition-all duration-150"
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete Job
                </button>

                <button
                  onClick={() => setSelectedJob(null)}
                  className="rounded-lg bg-graphite-base hover:bg-graphite-surfaceHover px-4 py-1.5 font-bold text-gray-300"
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

export default function JobTrackerPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    }>
      <JobTrackerContent />
    </Suspense>
  );
}

