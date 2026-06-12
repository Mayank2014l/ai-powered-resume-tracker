import { useState, useEffect } from "react";
import { Job, JobStatus } from "@/types";

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/jobs");
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      } else {
        setError("Failed to fetch jobs");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred fetching jobs");
    } finally {
      setLoading(false);
    }
  };

  const addJob = async (jobData: Partial<Job>) => {
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to add job application");
      }
      const data = await res.json();
      setJobs(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateJobStatus = async (jobId: string, status: JobStatus) => {
    const previousJobs = [...jobs];
    setJobs(prev =>
      prev.map(job => (job.id === jobId ? { ...job, status } : job))
    );

    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        throw new Error("Failed to update job status");
      }
      const data = await res.json();
      setJobs(prev => prev.map(job => (job.id === jobId ? data : job)));
      return data;
    } catch (err: any) {
      setJobs(previousJobs);
      setError(err.message);
      throw err;
    }
  };

  const updateJobDetails = async (jobId: string, updates: Partial<Job>) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        throw new Error("Failed to update job details");
      }
      const data = await res.json();
      setJobs(prev => prev.map(job => (job.id === jobId ? data : job)));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteJob = async (jobId: string) => {
    const previousJobs = [...jobs];
    setJobs(prev => prev.filter(job => job.id !== jobId));

    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete job");
      }
    } catch (err: any) {
      setJobs(previousJobs);
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return {
    jobs,
    loading,
    error,
    refreshJobs: fetchJobs,
    addJob,
    updateJobStatus,
    updateJobDetails,
    deleteJob,
  };
}
