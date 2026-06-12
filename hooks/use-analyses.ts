import { useState, useEffect } from "react";
import { Analysis } from "@/types";

export function useAnalyses() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyses");
      if (res.ok) {
        const data = await res.json();
        setAnalyses(data);
      } else {
        setError("Failed to fetch analyses");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred fetching analyses");
    } finally {
      setLoading(false);
    }
  };

  const analyze = async (resumeId: string, jobDescription: string) => {
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, jobDescription }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to analyze resume");
      }
      const data = await res.json();
      setAnalyses(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  return {
    analyses,
    loading,
    error,
    refreshAnalyses: fetchAnalyses,
    analyze,
  };
}
