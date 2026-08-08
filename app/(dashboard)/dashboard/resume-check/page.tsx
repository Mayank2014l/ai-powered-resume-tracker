"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function ResumeCheckRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const resumeId = searchParams.get("resumeId");
    if (resumeId) {
      router.replace(`/dashboard/analyzer?resumeId=${resumeId}`);
    } else {
      router.replace("/dashboard/analyzer");
    }
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      <span className="text-xs text-gray-400">Loading unified Analyze Resume dashboard...</span>
    </div>
  );
}

export default function ResumeCheckPage() {
  return (
    <React.Suspense fallback={
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    }>
      <ResumeCheckRedirect />
    </React.Suspense>
  );
}


