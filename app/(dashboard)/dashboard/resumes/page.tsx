"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FileCheck, Trash2, Download, Play, Plus, X, Eye,
  Sparkles, Layers, Award, Calendar, Loader2, ArrowRight, FileText
} from "lucide-react";
import { CustomUploader } from "@/components/custom-uploader";
import { toast } from "sonner";

export default function ResumeManagerPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [selectedResumeForView, setSelectedResumeForView] = useState<any | null>(null);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/resumes");
      if (res.ok) {
        const data = await res.json();
        setResumes(data);
      }
    } catch (e) {
      toast.error("Failed to load your resumes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDeleteResume = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this resume? This will also delete all associated analysis history.")) return;

    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setResumes(prev => prev.filter(r => r.id !== id));
        setSelectedForComparison(prev => prev.filter(item => item !== id));
        toast.success("Resume deleted successfully.");
      } else {
        toast.error("Failed to delete resume.");
      }
    } catch (err) {
      toast.error("An error occurred deleting resume.");
    }
  };

  const handleToggleCompare = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      if (selectedForComparison.length >= 2) {
        toast.warning("You can only compare 2 resumes side-by-side.");
        e.target.checked = false;
        return;
      }
      setSelectedForComparison(prev => [...prev, id]);
    } else {
      setSelectedForComparison(prev => prev.filter(item => item !== id));
    }
  };

  const handleOpenComparison = () => {
    if (selectedForComparison.length !== 2) {
      toast.warning("Please select exactly 2 resumes to compare.");
      return;
    }
    setShowComparisonModal(true);
  };

  const resume1 = resumes.find(r => r.id === selectedForComparison[0]);
  const resume2 = resumes.find(r => r.id === selectedForComparison[1]);

  const getAvgScore = (analysesList: any[]) => {
    if (!analysesList || analysesList.length === 0) return 0;
    const total = analysesList.reduce((acc, curr) => acc + curr.matchScore, 0);
    return Math.round(total / analysesList.length);
  };

  const getLastScore = (analysesList: any[]) => {
    if (!analysesList || analysesList.length === 0) return null;
    return analysesList[0].matchScore;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            My Resumes
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Upload, compare, and manage your different resume versions.
          </p>
        </div>

        <div className="flex gap-3 shrink-0">
          {resumes.length >= 2 && (
            <button
              onClick={handleOpenComparison}
              disabled={selectedForComparison.length !== 2}
              className="inline-flex items-center justify-center rounded-lg border border-graphite-border bg-graphite-surface px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-graphite-surfaceHover hover:text-white disabled:opacity-40 transition-all"
            >
              <Layers className="mr-1.5 h-4 w-4 text-teal-400" /> Compare Selected ({selectedForComparison.length}/2)
            </button>
          )}
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-600/10"
          >
            <Plus className="mr-1.5 h-4.5 w-4.5" /> Upload Resume
          </button>
        </div>
      </div>

      {/* RESUMES GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-graphite-border bg-graphite-surface p-6 h-44" />
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-graphite-border bg-graphite-surface">
          <FileCheck className="h-12 w-12 text-gray-600 mb-3" />
          <h2 className="text-sm font-semibold text-white">No resumes uploaded yet</h2>
          <p className="text-4xs text-gray-400 mt-1 max-w-sm leading-normal">
            To start optimizing your applications and getting matching scores, upload your resume first.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-600/10"
          >
            Upload your first resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => {
            const avgScore = getAvgScore(resume.analyses);
            const isChecked = selectedForComparison.includes(resume.id);

            return (
              <div 
                key={resume.id}
                className="group relative rounded-xl border border-graphite-border bg-graphite-surface p-5 shadow-sm hover:border-graphite-borderHover transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Select checkbox for comparison */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleToggleCompare(resume.id, e)}
                        className="h-4 w-4 rounded border-graphite-border text-emerald-600 focus:ring-emerald-500 bg-graphite-base"
                        id={`compare-${resume.id}`}
                      />
                      <label htmlFor={`compare-${resume.id}`} className="text-4xs text-gray-400 font-semibold cursor-pointer uppercase">Compare</label>
                    </div>

                    <button 
                      onClick={(e) => handleDeleteResume(resume.id, e)}
                      className="text-gray-400 hover:text-red-400 rounded p-1 hover:bg-graphite-surfaceHover transition-colors"
                      title="Delete Resume"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <h3 className="text-xs font-bold text-white truncate mt-4">
                    {resume.filename}
                  </h3>

                  {/* Metadata */}
                  <div className="mt-3.5 space-y-1.5 text-3xs text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-500" />
                      <span>Uploaded {new Date(resume.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-gray-500" />
                      <span>{resume.analyses?.length || 0} analyses run</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-graphite-border pt-4 flex items-center justify-between">
                  {/* Average Score Badge */}
                  <div>
                    {avgScore > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-4xs uppercase tracking-wider text-gray-400 font-semibold">Avg Score</span>
                        <div className="flex items-center gap-1">
                          <span className={`h-2 w-2 rounded-full ${avgScore < 50 ? "bg-red-500" : avgScore <= 75 ? "bg-amber-500" : "bg-emerald-500"}`} />
                          <span className="text-2xs font-extrabold text-white">{avgScore}%</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-3xs text-gray-500 italic">Not analyzed</span>
                    )}
                  </div>

                  {/* Card actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedResumeForView(resume)}
                      className="rounded border border-graphite-border bg-graphite-base p-1.5 text-gray-300 hover:text-white hover:bg-graphite-surfaceHover shadow-sm"
                      title="View / Open Resume"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <a
                      href={resume.fileUrl}
                      download={resume.filename}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded border border-graphite-border bg-graphite-base p-1.5 text-gray-300 hover:text-white hover:bg-graphite-surfaceHover shadow-sm"
                      title="Download PDF"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                    <Link
                      href={`/dashboard/analyzer?resumeId=${resume.id}`}
                      className="inline-flex items-center justify-center rounded bg-emerald-600 px-2.5 py-1 text-3xs font-semibold text-white hover:bg-emerald-500 shadow-sm transition-colors"
                    >
                      <Play className="mr-1 h-3 w-3 fill-current" /> Analyze
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* UPLOAD RESUME MODAL DIALOG */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-graphite-border bg-graphite-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-graphite-border pb-3 mb-4">
              <h2 className="text-sm font-bold text-white">Upload Resume</h2>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-graphite-surfaceHover"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-1">
              <CustomUploader
                onUploadComplete={(newResume) => {
                  setResumes(prev => [newResume, ...prev]);
                  setShowUploadModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* VIEW RESUME MODAL */}
      {selectedResumeForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-xl border border-graphite-border bg-graphite-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-graphite-border pb-3 mb-4 shrink-0">
              <div>
                <h2 className="text-sm font-bold text-white truncate max-w-md">
                  {selectedResumeForView.filename}
                </h2>
                <p className="text-3xs text-gray-400 mt-0.5">
                  Uploaded on {new Date(selectedResumeForView.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <button 
                onClick={() => setSelectedResumeForView(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-graphite-surfaceHover"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Extracted Text Content */}
            <div className="flex-1 overflow-y-auto bg-graphite-base p-5 rounded-lg border border-graphite-border text-3xs font-mono whitespace-pre-wrap text-gray-300 select-text leading-relaxed">
              {selectedResumeForView.extractedText}
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-graphite-border flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
              <span className="text-4xs text-gray-400 font-semibold uppercase tracking-wider">
                {selectedResumeForView.extractedText.split(/\s+/).length} words parsed
              </span>

              <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
                <a
                  href={selectedResumeForView.fileUrl}
                  download={selectedResumeForView.filename}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg border border-graphite-border bg-graphite-base px-3 py-2 text-3xs font-semibold text-gray-300 hover:bg-graphite-surfaceHover hover:text-white transition-colors shadow-sm"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Download PDF
                </a>

                <Link
                  href={`/dashboard/analyzer?resumeId=${selectedResumeForView.id}`}
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-2 text-3xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-sm"
                >
                  <Play className="mr-1.5 h-3 w-3 fill-current" /> Analyze Match
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESUME SIDE-BY-SIDE COMPARISON MODAL */}
      {showComparisonModal && resume1 && resume2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-xl border border-graphite-border bg-graphite-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-graphite-border pb-3 mb-6">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-emerald-400" />
                <span>Resume Score Comparison</span>
              </h2>
              <button 
                onClick={() => setShowComparisonModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-graphite-surfaceHover"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-2xs">
              
              {/* Resume 1 */}
              <div className="p-5 rounded-lg border border-graphite-border bg-graphite-base/40">
                <span className="text-3xs uppercase tracking-wider text-gray-400 font-bold block mb-1">Resume A</span>
                <h3 className="text-xs font-bold text-emerald-400 truncate mb-4">{resume1.filename}</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-graphite-border pb-2">
                    <span className="text-gray-400">Total Audits Run</span>
                    <span className="font-semibold text-white">{resume1.analyses?.length || 0}</span>
                  </div>
                  
                  <div className="flex justify-between border-b border-graphite-border pb-2">
                    <span className="text-gray-400">Average Match Score</span>
                    <span className="font-extrabold text-white">{getAvgScore(resume1.analyses)}%</span>
                  </div>

                  <div className="flex justify-between border-b border-graphite-border pb-2">
                    <span className="text-gray-400">Last Audited Match</span>
                    <span className="font-bold text-white">{getLastScore(resume1.analyses) ? `${getLastScore(resume1.analyses)}%` : "N/A"}</span>
                  </div>

                  <div className="pt-2">
                    <span className="text-gray-400 block mb-2 font-semibold">Parsed Skills (Sample)</span>
                    <div className="flex flex-wrap gap-1.5">
                      {["React", "Next.js", "TypeScript", "Tailwind CSS", "Stripe", "Prisma"].map((sk, i) => (
                        <span key={i} className="rounded bg-graphite-surface border border-graphite-border px-2 py-0.5 text-3xs text-gray-300">{sk}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resume 2 */}
              <div className="p-5 rounded-lg border border-graphite-border bg-graphite-base/40">
                <span className="text-3xs uppercase tracking-wider text-gray-400 font-bold block mb-1">Resume B</span>
                <h3 className="text-xs font-bold text-teal-400 truncate mb-4">{resume2.filename}</h3>

                <div className="space-y-4">
                  <div className="flex justify-between border-b border-graphite-border pb-2">
                    <span className="text-gray-400">Total Audits Run</span>
                    <span className="font-semibold text-white">{resume2.analyses?.length || 0}</span>
                  </div>
                  
                  <div className="flex justify-between border-b border-graphite-border pb-2">
                    <span className="text-gray-400">Average Match Score</span>
                    <span className="font-extrabold text-white">{getAvgScore(resume2.analyses)}%</span>
                  </div>

                  <div className="flex justify-between border-b border-graphite-border pb-2">
                    <span className="text-gray-400">Last Audited Match</span>
                    <span className="font-bold text-white">{getLastScore(resume2.analyses) ? `${getLastScore(resume2.analyses)}%` : "N/A"}</span>
                  </div>

                  <div className="pt-2">
                    <span className="text-gray-400 block mb-2 font-semibold">Parsed Skills (Sample)</span>
                    <div className="flex flex-wrap gap-1.5">
                      {["React", "Redux", "Docker", "Node.js", "Jest", "GraphQL"].map((sk, i) => (
                        <span key={i} className="rounded bg-graphite-surface border border-graphite-border px-2 py-0.5 text-3xs text-gray-300">{sk}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
