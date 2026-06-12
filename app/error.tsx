"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled client-side exception:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 text-center dark:bg-zinc-950 transition-colors duration-300">
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-650 dark:bg-red-950/20 dark:text-red-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          Something went wrong!
        </h2>
        
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          An unexpected error occurred in this route. The logs have been reported. Please try reloading or return to the main dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-505 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-indigo-600/10"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Try Again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="mr-1.5 h-3.5 w-3.5" /> Dashboard
          </Link>
        </div>
      </motion.div>

    </div>
  );
}
