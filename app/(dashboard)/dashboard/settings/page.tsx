"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { 
  Sparkles, User, Bell, Eye, ShieldAlert, 
  Briefcase, DollarSign, Save, Loader2, 
  Trash2, ShieldCheck, Mail, Sun, Moon, X, Database, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/components/shared/theme-provider";

export default function SettingsPage() {
  const { profile, loading, refreshProfile } = useUser();
  const { theme, toggleTheme } = useTheme();

  // Tab state
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "appearance" | "demo" | "account">("profile");

  // Form states
  const [name, setName] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [targetSalary, setTargetSalary] = useState("");
  
  // Notifications
  const [notifyAnalysis, setNotifyAnalysis] = useState(true);
  const [notifyFollowup, setNotifyFollowup] = useState(true);
  const [notifyWeekly, setNotifyWeekly] = useState(true);

  // Appearance
  const [accentColor, setAccentColor] = useState("emerald");

  // Saving states
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setLinkedinUrl(profile.linkedinUrl || "");
      setTargetRole(profile.targetRole || "");
      setTargetSalary(profile.targetSalary || "");
      
      if (profile.emailNotifications) {
        setNotifyAnalysis(profile.emailNotifications.analysisComplete);
        setNotifyFollowup(profile.emailNotifications.followUpReminders);
        setNotifyWeekly(profile.emailNotifications.weeklyReport);
      }
      
      setAccentColor(profile.accentColor || "emerald");
    }
  }, [profile]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          linkedinUrl,
          targetRole,
          targetSalary,
          emailNotifications: {
            analysisComplete: notifyAnalysis,
            followUpReminders: notifyFollowup,
            weeklyReport: notifyWeekly,
          },
          accentColor,
        }),
      });

      if (res.ok) {
        toast.success("Settings saved successfully.");
        refreshProfile();
      } else {
        toast.error("Failed to save settings.");
      }
    } catch (e) {
      toast.error("Error saving profile options.");
    } finally {
      setSaving(false);
    }
  };

  const handleLoadDemoData = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/demo-data", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Demo data loaded: 3 sample resumes, 5 job cards, and analyses populated!");
      refreshProfile();
    } catch (err: any) {
      toast.error(err.message || "Failed to load demo data.");
    } finally {
      setSeeding(false);
    }
  };

  const handleClearDemoData = async () => {
    setClearing(true);
    try {
      const res = await fetch("/api/demo-data", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Demo data cleared successfully.");
      refreshProfile();
    } catch (err: any) {
      toast.error(err.message || "Failed to clear demo data.");
    } finally {
      setClearing(false);
    }
  };

  const handleDeleteAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmationText !== "DELETE MY ACCOUNT") {
      toast.error("Please type 'DELETE MY ACCOUNT' to confirm.");
      return;
    }

    toast.info("Deleting account...");
    setTimeout(() => {
      toast.success("Account deleted. Redirecting...");
      window.location.href = "/";
    }, 1500);
  };

  const tabs = [
    { id: "profile", label: "Profile Settings", icon: <User className="h-4 w-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
    { id: "appearance", label: "Appearance", icon: <Eye className="h-4 w-4" /> },
    { id: "demo", label: "Demo Data", icon: <Database className="h-4 w-4" /> },
    { id: "account", label: "Account & Security", icon: <ShieldAlert className="h-4 w-4" /> },
  ] as const;

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="text-3xs text-gray-400">Loading settings...</span>
      </div>
    );
  }

  const accents = ["emerald", "teal", "indigo", "amber", "rose"] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Customize your profile, populate showcase demo data, configure notifications, and manage preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Tab triggers (3 cols) */}
        <div className="md:col-span-3 flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-xs font-semibold shrink-0 transition-colors ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-400 hover:bg-graphite-surfaceHover hover:text-white"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Right Side: Tab contents (9 cols) */}
        <div className="md:col-span-9 rounded-xl border border-graphite-border bg-graphite-surface p-6 shadow-sm">
          
          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {/* PROFILE SETTINGS TAB */}
            {activeTab === "profile" && (
              <div className="space-y-5 text-2xs">
                <div className="border-b border-graphite-border pb-3">
                  <h3 className="text-xs font-bold text-white">Profile Details</h3>
                  <p className="text-4xs text-gray-400 mt-0.5 font-medium">Update your job search metadata and targets.</p>
                </div>

                {/* Avatar Display */}
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg uppercase shadow">
                    {name ? name[0] : "U"}
                  </div>
                  <div>
                    <span className="text-3xs font-semibold text-gray-400 uppercase block">Profile Picture</span>
                    <button type="button" className="text-emerald-400 hover:underline text-3xs font-semibold mt-1">Upload New Picture</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-3xs font-semibold text-gray-400 uppercase">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full rounded border border-graphite-border bg-graphite-base px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-semibold text-gray-400 uppercase">Email Address (Read Only)</label>
                    <input
                      type="email"
                      disabled
                      value={profile?.email || ""}
                      className="w-full rounded border border-graphite-border bg-graphite-base/50 px-2.5 py-1.5 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-3xs font-semibold text-gray-400 uppercase flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect x="2" y="9" width="4" height="12" />
                      <circle cx="4" cy="4" r="2" />
                    </svg> LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full rounded border border-graphite-border bg-graphite-base px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-3xs font-semibold text-gray-400 uppercase flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" /> Target Job Role
                    </label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Senior Frontend Engineer"
                      className="w-full rounded border border-graphite-border bg-graphite-base px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-semibold text-gray-400 uppercase flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" /> Target Annual Salary
                    </label>
                    <input
                      type="text"
                      value={targetSalary}
                      onChange={(e) => setTargetSalary(e.target.value)}
                      placeholder="e.g. $140,000"
                      className="w-full rounded border border-graphite-border bg-graphite-base px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS SETTINGS TAB */}
            {activeTab === "notifications" && (
              <div className="space-y-5 text-2xs">
                <div className="border-b border-graphite-border pb-3">
                  <h3 className="text-xs font-bold text-white">Email Preferences</h3>
                  <p className="text-4xs text-gray-400 mt-0.5 font-medium">Select when we should notify you about account updates.</p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-start gap-3 rounded-lg border border-graphite-border bg-graphite-base/40 p-3.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyAnalysis}
                      onChange={(e) => setNotifyAnalysis(e.target.checked)}
                      className="h-4 w-4 rounded border-graphite-border text-emerald-600 focus:ring-emerald-500 mt-0.5"
                    />
                    <div className="flex-grow">
                      <span className="font-semibold text-white">Analysis Complete</span>
                      <p className="text-4xs text-gray-400 mt-0.5 leading-normal">
                        Receive an email confirmation containing the match score summary when an AI resume audit completes.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 rounded-lg border border-graphite-border bg-graphite-base/40 p-3.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyFollowup}
                      onChange={(e) => setNotifyFollowup(e.target.checked)}
                      className="h-4 w-4 rounded border-graphite-border text-emerald-600 focus:ring-emerald-500 mt-0.5"
                    />
                    <div className="flex-grow">
                      <span className="font-semibold text-white">Follow-up reminders</span>
                      <p className="text-4xs text-gray-400 mt-0.5 leading-normal">
                        Receive calendar reminders when tracked job applications reach their specified follow-up dates.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 rounded-lg border border-graphite-border bg-graphite-base/40 p-3.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyWeekly}
                      onChange={(e) => setNotifyWeekly(e.target.checked)}
                      className="h-4 w-4 rounded border-graphite-border text-emerald-600 focus:ring-emerald-500 mt-0.5"
                    />
                    <div className="flex-grow">
                      <span className="font-semibold text-white">Weekly Pipeline Report</span>
                      <p className="text-4xs text-gray-400 mt-0.5 leading-normal">
                        Receive an aggregated AI summary showing application counts and interview conversion targets.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* APPEARANCE SETTINGS TAB */}
            {activeTab === "appearance" && (
              <div className="space-y-5 text-2xs">
                <div className="border-b border-graphite-border pb-3">
                  <h3 className="text-xs font-bold text-white">Visual Customization</h3>
                  <p className="text-4xs text-gray-400 mt-0.5 font-medium">Select your interface colors and display themes.</p>
                </div>

                <div className="space-y-2">
                  <span className="text-3xs font-semibold text-gray-400 uppercase tracking-wider block">Theme Mode</span>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (theme !== "light") toggleTheme();
                      }}
                      className={`flex-1 rounded-lg border p-4 text-center font-bold transition-all flex items-center justify-center gap-2 ${
                        theme === "light" 
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                          : "border-graphite-border bg-graphite-base text-gray-300"
                      }`}
                    >
                      <Sun className="h-4 w-4" /> Light Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (theme !== "dark") toggleTheme();
                      }}
                      className={`flex-1 rounded-lg border p-4 text-center font-bold transition-all flex items-center justify-center gap-2 ${
                        theme === "dark" 
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                          : "border-graphite-border bg-graphite-base text-gray-300"
                      }`}
                    >
                      <Moon className="h-4 w-4" /> Dark Mode
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-3xs font-semibold text-gray-400 uppercase tracking-wider block">Accent Brand Color</span>
                  <div className="flex gap-3">
                    {accents.map((color) => {
                      const colorMap: any = {
                        emerald: "bg-emerald-500",
                        teal: "bg-teal-500",
                        indigo: "bg-indigo-600",
                        amber: "bg-amber-600",
                        rose: "bg-rose-600"
                      };

                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setAccentColor(color);
                            toast.success(`Theme accent updated to: ${color}`);
                          }}
                          className={`h-8 w-8 rounded-full ${colorMap[color]} transition-transform ${
                            accentColor === color ? "ring-4 ring-emerald-500/40 scale-110" : ""
                          }`}
                          title={color}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* DEMO DATA TAB */}
            {activeTab === "demo" && (
              <div className="space-y-6 text-2xs">
                <div className="border-b border-graphite-border pb-3">
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <Database className="h-4 w-4 text-emerald-400" />
                    <span>Demo Data & Portfolio Showcase</span>
                  </h3>
                  <p className="text-4xs text-gray-400 mt-0.5 font-medium">Populate realistic test data to showcase all dashboard metrics and pipeline stages.</p>
                </div>

                <div className="rounded-xl border border-graphite-border bg-graphite-base/40 p-5 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-white">What gets generated?</h4>
                    <ul className="mt-2 space-y-1.5 text-3xs text-gray-300">
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <strong>3 Resumes:</strong> Full Stack, Frontend UI/UX, and Cloud Infrastructure profiles.
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                        <strong>5 Job Cards:</strong> Across Saved, Applied, Interview, Offer, and Rejected stages.
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <strong>Sample Analyses:</strong> Complete with ATS scores, keyword gaps, and before/after improvements.
                      </li>
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-graphite-border flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleLoadDemoData}
                      disabled={seeding || clearing}
                      className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-md shadow-emerald-600/10"
                    >
                      {seeding ? (
                        <>
                          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Populating Data...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-1.5 h-4 w-4" /> Load Demo Data
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleClearDemoData}
                      disabled={seeding || clearing}
                      className="inline-flex items-center justify-center rounded-lg border border-graphite-border bg-graphite-base px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-graphite-surfaceHover hover:text-white disabled:opacity-50 transition-colors"
                    >
                      {clearing ? (
                        <>
                          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Resetting...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-1.5 h-4 w-4" /> Clear Demo Data
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ACCOUNT SECURITY & DELETION TAB */}
            {activeTab === "account" && (
              <div className="space-y-6 text-2xs">
                <div className="border-b border-graphite-border pb-3">
                  <h3 className="text-xs font-bold text-white">Security & Actions</h3>
                  <p className="text-4xs text-gray-400 mt-0.5 font-medium">Verify login security integrations or delete account.</p>
                </div>

                <div className="space-y-3.5">
                  <span className="text-3xs font-semibold text-gray-400 uppercase tracking-wider block">Connected Integrations</span>
                  
                  <div className="flex items-center justify-between border border-graphite-border rounded-lg p-3.5 bg-graphite-base/40">
                    <div className="flex items-center gap-2.5">
                      <Mail className="h-5 w-5 text-emerald-400" />
                      <div>
                        <span className="font-semibold block text-white">Email Authentication</span>
                        <span className="text-4xs text-gray-400">Primary login capability enabled.</span>
                      </div>
                    </div>
                    <span className="rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 text-3xs font-bold flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 fill-current" /> Active
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wide">Danger Zone</span>
                  <p className="text-4xs text-gray-400 mt-1 leading-normal">
                    Permanently delete your account along with all resume uploads, job trackers, cover letters, and subscription histories.
                  </p>
                  
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="mt-4 inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500 transition-colors shadow-sm"
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" /> Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* SAVE BUTTON FOR GENERAL SETTINGS TABS */}
            {activeTab !== "account" && activeTab !== "demo" && (
              <div className="border-t border-graphite-border pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-md shadow-emerald-600/10"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Saving Changes
                    </>
                  ) : (
                    <>
                      <Save className="mr-1.5 h-4 w-4" /> Save Settings
                    </>
                  )}
                </button>
              </div>
            )}

          </form>

        </div>
      </div>

      {/* DOUBLE-CONFIRMATION ACCOUNT DELETION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-graphite-border bg-graphite-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-graphite-border pb-3 mb-4">
              <h2 className="text-sm font-bold text-red-400">Confirm Account Deletion</h2>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-graphite-surfaceHover"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleDeleteAccountSubmit} className="space-y-4 text-2xs">
              <p className="text-gray-400 leading-normal">
                To confirm deletion of your account and permanent removal of all data, please type <strong className="text-red-400 font-bold">DELETE MY ACCOUNT</strong> in the field below.
              </p>

              <input
                type="text"
                required
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="w-full rounded border border-graphite-border bg-graphite-base px-2.5 py-1.5 focus:border-red-500 focus:outline-none text-white"
              />

              <div className="border-t border-graphite-border pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded border border-graphite-border bg-graphite-base px-4 py-2 hover:bg-graphite-surfaceHover text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500 shadow-sm"
                >
                  Permanently Delete My Account
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
