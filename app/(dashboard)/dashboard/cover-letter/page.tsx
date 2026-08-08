"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/use-user";
import { 
  Sparkles, FileText, Settings, Copy, FileDown, 
  Trash2, PenTool, CheckCircle, RefreshCw, Loader2, Library
} from "lucide-react";
import { toast } from "sonner";
import { Resume, CoverLetter } from "@/types";

export default function CoverLetterPage() {
  const { plan } = useUser();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumesLoading, setResumesLoading] = useState(true);

  // Form states
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState<"Professional" | "Enthusiastic" | "Concise">("Professional");
  const [personalNote, setPersonalNote] = useState("");
  
  // Generated result states
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [generating, setGenerating] = useState(false);
  const [editingLetter, setEditingLetter] = useState("");
  
  // Library list
  const [library, setLibrary] = useState<CoverLetter[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(true);

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

  const fetchLibrary = async () => {
    try {
      const res = await fetch("/api/cover-letters");
      if (res.ok) {
        const data = await res.json();
        setLibrary(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLibraryLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
    fetchLibrary();
  }, []);

  const handleGenerate = async () => {
    if (plan !== "pro") {
      toast.warning("Cover Letter generation is a Pro plan feature. Please upgrade to unlock.", {
        action: {
          label: "Upgrade",
          onClick: () => window.location.href = "/dashboard/billing",
        }
      });
      return;
    }

    if (!selectedResumeId) {
      toast.error("Please upload or select a resume first.");
      return;
    }

    if (!jobDescription || jobDescription.length < 20) {
      toast.error("Please enter a job description.");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          jobDescription,
          tone,
          personalNote: personalNote || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedLetter(data.content);
        setEditingLetter(data.content);
        setLibrary(prev => [data, ...prev]);
        toast.success("AI Cover Letter generated successfully!");
      } else {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate letter");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to call AI letter generator.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!editingLetter) return;
    navigator.clipboard.writeText(editingLetter);
    toast.success("Copied cover letter to clipboard!");
  };

  const handleDownloadDoc = () => {
    if (!editingLetter) return;
    
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><title>Cover Letter</title></head><body>";
    const footer = "</body></html>";
    const formattedContent = editingLetter.split("\n\n").map(p => `<p>${p}</p>`).join("");
    const sourceHTML = header + formattedContent + footer;
    
    const fileDownload = "data:application/vnd.ms-word;charset=utf-8," + encodeURIComponent(sourceHTML);
    const fileLink = document.createElement("a");
    document.body.appendChild(fileLink);
    fileLink.href = fileDownload;
    fileLink.download = "Cover_Letter_ResumeIQ.doc";
    fileLink.click();
    document.body.removeChild(fileLink);
    toast.success("Downloaded cover letter document!");
  };

  const handleDeleteSaved = async (id: string) => {
    if (!confirm("Are you sure you want to delete this saved cover letter?")) return;
    
    try {
      const res = await fetch(`/api/cover-letter/${id}`, {
        method: "DELETE",
      });
      setLibrary(prev => prev.filter(c => c.id !== id));
      toast.success("Cover letter removed.");
    } catch (e) {
      toast.error("Failed to delete cover letter.");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Cover Letter Generator
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Create tailored, professional drafts powered by AI matching your background details.
          </p>
        </div>
      </div>

      {/* INPUT FORM & EDITOR ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Form Options (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-graphite-border bg-graphite-surface p-6 flex flex-col justify-between">
          <div className="space-y-4 text-2xs">
            <div className="border-b border-graphite-border pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <PenTool className="h-4 w-4 text-emerald-400" />
                <span>Letter Setup</span>
              </h2>
            </div>

            {/* Select Resume */}
            <div className="space-y-1">
              <label className="text-3xs font-semibold text-gray-400 uppercase">1. Select Base Resume</label>
              {resumesLoading ? (
                <div className="h-9 w-full bg-graphite-base animate-pulse rounded" />
              ) : resumes.length === 0 ? (
                <div className="p-2 border border-graphite-border border-dashed rounded text-center text-4xs text-gray-400">
                  <span>No resumes found. </span>
                  <Link href="/dashboard/resumes" className="text-emerald-400 font-semibold">Upload here</Link>
                </div>
              ) : (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full rounded border border-graphite-border bg-graphite-base px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none text-white"
                >
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.filename}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Tone selection */}
            <div className="space-y-1">
              <label className="text-3xs font-semibold text-gray-400 uppercase block">2. Tone Style</label>
              <div className="grid grid-cols-3 gap-2">
                {(["Professional", "Enthusiastic", "Concise"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`rounded border py-1.5 text-center font-semibold transition-all ${
                      tone === t 
                        ? "border-emerald-500 bg-emerald-600 text-white shadow-sm"
                        : "border-graphite-border bg-graphite-base hover:bg-graphite-surfaceHover text-gray-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Job Description */}
            <div className="space-y-1">
              <label className="text-3xs font-semibold text-gray-400 uppercase">3. Target Job Description</label>
              <textarea
                rows={5}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the requirements or description details..."
                className="w-full rounded border border-graphite-border bg-graphite-base p-2.5 focus:border-emerald-500 focus:outline-none text-white"
              />
            </div>

            {/* Personal Note */}
            <div className="space-y-1">
              <label className="text-3xs font-semibold text-gray-400 uppercase">4. Personal Note (Optional)</label>
              <input
                type="text"
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                placeholder="e.g. mention my previous connection at Stripe..."
                className="w-full rounded border border-graphite-border bg-graphite-base px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none text-white"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={generating || !selectedResumeId || !jobDescription}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-all duration-200 shadow-md shadow-emerald-600/10"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" /> Drafting Letter...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4.5 w-4.5 fill-current" /> Generate Cover Letter
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Interactive Rich text editor (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-graphite-border bg-graphite-surface p-6 flex flex-col justify-between">
          <div className="space-y-4 flex-grow flex flex-col justify-between">
            <div className="border-b border-graphite-border pb-3 flex justify-between items-center">
              <h2 className="text-sm font-bold text-white">Draft Canvas</h2>
              {editingLetter && (
                <div className="flex gap-2 print:hidden">
                  <button
                    onClick={handleCopyToClipboard}
                    className="rounded border border-graphite-border bg-graphite-base p-1.5 hover:bg-graphite-surfaceHover text-gray-300"
                    title="Copy Text"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleDownloadDoc}
                    className="rounded border border-graphite-border bg-graphite-base p-1.5 hover:bg-graphite-surfaceHover text-gray-300"
                    title="Download Word File"
                  >
                    <FileDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {editingLetter ? (
              <textarea
                value={editingLetter}
                onChange={(e) => setEditingLetter(e.target.value)}
                className="w-full flex-grow rounded-lg border border-graphite-border bg-graphite-base p-4 text-xs font-mono focus:border-emerald-500 focus:outline-none text-gray-200 min-h-[300px]"
              />
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-graphite-border/60 rounded-lg">
                <FileText className="h-10 w-10 text-gray-600 mb-3" />
                <span className="text-xs font-semibold text-gray-300">No Draft Compiled</span>
                <span className="text-4xs text-gray-400 mt-1 max-w-xs leading-normal">
                  Configure your resume details and click "Generate Cover Letter" to compile a tailored draft.
                </span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* SAVED COVER LETTERS GRID */}
      <div className="rounded-xl border border-graphite-border bg-graphite-surface p-6 shadow-sm">
        <div className="border-b border-graphite-border pb-4 mb-5 flex items-center gap-2">
          <Library className="h-5 w-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">Draft Library</h2>
        </div>

        {libraryLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : library.length === 0 ? (
          <div className="text-center py-8 text-3xs text-gray-400 italic">
            No previously saved cover letters in your library.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {library.map((letter) => (
              <div 
                key={letter.id} 
                className="p-4 rounded-xl border border-graphite-border bg-graphite-base/40 shadow-sm flex flex-col justify-between h-[200px]"
              >
                <div className="min-h-0">
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-4xs text-emerald-400 font-semibold uppercase">{letter.tone} Tone</span>
                    <button
                      onClick={() => handleDeleteSaved(letter.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete Saved Letter"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <p className="text-2xs font-semibold text-white mt-2 truncate">
                    Base: {letter.resume?.filename || "Resume File"}
                  </p>
                  
                  <p className="text-3xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                    {letter.content}
                  </p>
                </div>

                <div className="mt-4 border-t border-graphite-border pt-3 flex justify-end">
                  <button
                    onClick={() => {
                      setEditingLetter(letter.content);
                      setGeneratedLetter(letter.content);
                      toast.success("Loaded saved cover letter draft to canvas.");
                    }}
                    className="rounded border border-graphite-border bg-graphite-surface px-2.5 py-1 text-3xs font-semibold text-gray-300 hover:bg-graphite-surfaceHover hover:text-white transition-colors"
                  >
                    Load to Canvas
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
