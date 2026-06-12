"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { signIn } from "next-auth/react";
import { 
  ShieldAlert, Users, Database, FileSpreadsheet, Kanban, 
  Trash2, UserCheck, RefreshCw, Check, Loader2, ArrowRight, X
} from "lucide-react";
import { toast } from "sonner";

export default function AdminPage() {
  const { user, profile } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Auto-login credentials for testing ease
  const [adminEmailInput, setAdminEmailInput] = useState("admin@resumeiq.co");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (user?.email === "admin@resumeiq.co") {
      setIsAdmin(true);
      fetchAdminData();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setUsers(data.users);
      } else {
        toast.error("Failed to load admin dataset.");
      }
    } catch (e) {
      toast.error("An error occurred during admin fetch.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmailInput !== "admin@resumeiq.co") {
      toast.error("Invalid admin credentials.");
      return;
    }
    
    setIsLoggingIn(true);
    try {
      const res = await signIn("credentials", {
        email: adminEmailInput,
        redirect: false,
        callbackUrl: "/dashboard/admin",
      });

      if (res?.error) {
        toast.error("Authentication failed.");
      } else {
        toast.success("Successfully logged in as Admin!");
        window.location.reload(); // Reload to capture the admin session
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleUpdatePlan = async (userId: string, newPlan: string) => {
    setUpdatingUserId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plan: newPlan }),
      });

      if (res.ok) {
        toast.success("User plan updated successfully!");
        fetchAdminData(); // Refresh dataset
      } else {
        toast.error("Failed to update user plan.");
      }
    } catch (e) {
      toast.error("An error occurred updating user plan.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you absolutely sure you want to delete user account ${userEmail}? This action is irreversible.`)) return;

    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("User account deleted successfully!");
        fetchAdminData(); // Refresh dataset
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to remove user account.");
      }
    } catch (e) {
      toast.error("An error occurred deleting user account.");
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
        <span className="text-3xs text-zinc-400">Syncing admin portal configurations...</span>
      </div>
    );
  }

  // ACCESS RESTRICTED SCREEN
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 sm:px-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 text-center space-y-6">
          <div className="h-12 w-12 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-6 w-6" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white">Admin Portal Restricted</h2>
            <p className="text-3xs text-zinc-550 dark:text-zinc-450 leading-relaxed">
              This panel is reserved for administrators. You must authenticate using the admin email address **admin@resumeiq.co** to gain administrative capabilities.
            </p>
          </div>

          <form onSubmit={handleAdminAuth} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-4xs font-bold text-zinc-450 uppercase block">Admin Email Address</label>
              <input
                type="email"
                required
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-2xs focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full inline-flex items-center justify-center rounded-lg bg-indigo-650 hover:bg-indigo-600 py-2.5 text-2xs font-semibold text-white transition-all disabled:opacity-50"
            >
              {isLoggingIn ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Authenticate Admin <ArrowRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Administrative Console
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            System performance audits, subscription overrides, and total active user database controls.
          </p>
        </div>
        <button
          onClick={fetchAdminData}
          className="rounded-lg p-2 border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-850 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className="h-4.5 w-4.5 text-zinc-500" />
        </button>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-850 dark:bg-zinc-900/30 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-4xs font-bold uppercase tracking-wider">Total Registrants</span>
            <Users className="h-5 w-5 text-indigo-500" />
          </div>
          <strong className="text-2xl font-extrabold text-zinc-900 dark:text-white block">
            {stats?.totalUsers || 0}
          </strong>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-850 dark:bg-zinc-900/30 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-4xs font-bold uppercase tracking-wider">Subscription Split</span>
            <Database className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xs font-bold text-emerald-500">{stats?.proUsers || 0} Pro</span>
            <span className="text-xs font-bold text-indigo-500">{stats?.ultimateUsers || 0} Ult</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-850 dark:bg-zinc-900/30 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-4xs font-bold uppercase tracking-wider">Resumes Indexed</span>
            <FileSpreadsheet className="h-5 w-5 text-indigo-500" />
          </div>
          <strong className="text-2xl font-extrabold text-zinc-900 dark:text-white block">
            {stats?.totalResumes || 0}
          </strong>
        </div>

        {/* Metric 4 */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-850 dark:bg-zinc-900/30 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-4xs font-bold uppercase tracking-wider">Jobs Logged</span>
            <Kanban className="h-5 w-5 text-indigo-500" />
          </div>
          <strong className="text-2xl font-extrabold text-zinc-900 dark:text-white block">
            {stats?.totalJobsTracked || 0}
          </strong>
        </div>
      </div>

      {/* USERS LIST TABLE */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/35 shadow-sm">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-5">User Directory Management</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-2xs">
            <thead>
              <tr className="border-b border-zinc-150 dark:border-zinc-800 text-zinc-400 uppercase text-3xs font-semibold">
                <th className="py-2.5 px-4 font-bold">User Information</th>
                <th className="py-2.5 px-4 font-bold">Plan Type</th>
                <th className="py-2.5 px-4 font-bold">Data Metrics</th>
                <th className="py-2.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                  <td className="py-4 px-4 space-y-1">
                    <div className="font-bold text-zinc-900 dark:text-white">{u.name || "Unnamed"}</div>
                    <div className="text-4xs text-zinc-500 font-mono select-all">{u.email}</div>
                  </td>
                  
                  <td className="py-4 px-4">
                    {u.email === "admin@resumeiq.co" ? (
                      <span className="rounded bg-indigo-500/10 text-indigo-600 px-2 py-0.5 text-4xs font-bold uppercase tracking-wider">
                        Master Admin
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <select
                          value={u.plan}
                          disabled={updatingUserId === u.id}
                          onChange={(e) => handleUpdatePlan(u.id, e.target.value)}
                          className="rounded border border-zinc-200 bg-zinc-50 px-2 py-1 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                        >
                          <option value="free">Free Plan</option>
                          <option value="pro">Pro Plan</option>
                          <option value="ultimate">Ultimate Plan</option>
                          <option value="admin">Administrator</option>
                        </select>
                        {updatingUserId === u.id && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
                        )}
                      </div>
                    )}
                  </td>

                  <td className="py-4 px-4 text-zinc-500">
                    <div className="flex gap-3 text-4xs font-semibold">
                      <span>{u._count?.resumes || 0} Resumes</span>
                      <span>{u._count?.jobs || 0} Jobs</span>
                      <span>{u._count?.coverLetters || 0} Letters</span>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-right">
                    {u.email !== "admin@resumeiq.co" && (
                      <button
                        onClick={() => handleDeleteUser(u.id, u.email)}
                        className="rounded p-1 text-zinc-450 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
