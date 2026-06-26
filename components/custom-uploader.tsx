"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Loader2, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { extractTextFromFile } from "@/lib/pdf-extractor";

interface CustomUploaderProps {
  onUploadComplete: (resume: any) => void;
  className?: string;
}

export function CustomUploader({ onUploadComplete, className = "" }: CustomUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [status, setStatus] = useState<"idle" | "parsing" | "saving" | "success">("idle");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith(".pdf") && !file.name.endsWith(".txt") && file.type !== "application/pdf" && file.type !== "text/plain") {
      toast.error("Invalid file type. Please upload a PDF or TXT file.");
      return;
    }

    // Limit to 4MB for DB storage safety
    if (file.size > 4 * 1024 * 1024) {
      toast.error("File is too large. Please upload a file smaller than 4MB.");
      return;
    }

    setStatus("parsing");
    setProgress(20);
    const toastId = toast.loading(`Parsing "${file.name}"...`);

    try {
      // 1. Extract text and get base64 data URL
      const { text, dataUrl } = await extractTextFromFile(file);
      setProgress(60);
      setStatus("saving");
      toast.loading("Saving resume content to database...", { id: toastId });

      // 2. Upload to database
      const res = await fetch("/api/resumes/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          fileUrl: dataUrl, // Stores the actual file content as base64 data URL
          extractedText: text,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to upload resume to database");
      }

      const newResume = await res.json();
      setProgress(100);
      setStatus("success");
      toast.success("Resume uploaded and parsed successfully!", { id: toastId });
      
      // Delay callback slightly to show success state
      setTimeout(() => {
        onUploadComplete(newResume);
        setStatus("idle");
        setProgress(0);
      }, 800);

    } catch (err: any) {
      console.error(err);
      setStatus("idle");
      setProgress(0);
      toast.error(err.message || "Failed to process resume file.", { id: toastId });
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={status === "idle" ? onButtonClick : undefined}
      className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-250 ${
        isDragActive
          ? "border-indigo-500 bg-indigo-50/50 dark:border-indigo-400 dark:bg-indigo-500/5 scale-[0.99]"
          : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:bg-zinc-950/80"
      } ${status !== "idle" ? "pointer-events-none" : ""} ${className}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.txt,application/pdf,text/plain"
        onChange={handleChange}
      />

      {status === "idle" && (
        <div className="space-y-3">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 dark:text-indigo-400">
            <UploadCloud className="h-5 w-5 animate-bounce-slow" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Drag & drop your resume PDF or Click to browse
            </p>
            <p className="text-4xs text-zinc-400 dark:text-zinc-500 mt-1 uppercase tracking-wider font-semibold">
              Supports Text-based PDF / TXT (Max 4MB)
            </p>
          </div>
        </div>
      )}

      {status === "parsing" && (
        <div className="space-y-3 py-1">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500" />
          <div>
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Reading PDF Content...</p>
            <p className="text-3xs text-zinc-400 mt-0.5">Extracting keywords, experiences, and details</p>
          </div>
          <div className="w-48 bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 mx-auto overflow-hidden">
            <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {status === "saving" && (
        <div className="space-y-3 py-1">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500" />
          <div>
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Saving to Database...</p>
            <p className="text-3xs text-zinc-400 mt-0.5">Storing structured resume for ATS analysis</p>
          </div>
          <div className="w-48 bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 mx-auto overflow-hidden">
            <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-2 py-1 animate-pulse">
          <CheckCircle className="mx-auto h-8 w-8 text-emerald-500" />
          <div>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Processing Complete!</p>
            <p className="text-3xs text-zinc-400 mt-0.5">Redirecting to analysis dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
}
