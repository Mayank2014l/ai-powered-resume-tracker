"use client";

import Link from "next/link";
import { Sparkles, Home, ChevronRight, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 text-center dark:bg-zinc-950 transition-colors duration-300">
      
      {/* Animated visual layout */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 max-w-md"
      >
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/5 dark:text-indigo-400">
            <HelpCircle className="h-10 w-10 animate-bounce" />
          </div>
        </div>

        <h1 className="text-6xl font-extrabold text-indigo-600 dark:text-indigo-500">404</h1>
        
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          Page Not Found
        </h2>
        
        <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed">
          The application page you are looking for does not exist, has been archived, or moved to a different directory.
        </p>

        <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Back to Home
          </Link>
          <Link 
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-505 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-indigo-600/10"
          >
            Go to Dashboard <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </motion.div>

    </div>
  );
}
