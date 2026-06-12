"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { 
  Sparkles, User, Bell, Eye, ShieldAlert, 
  Briefcase, DollarSign, Save, Loader2, 
  Trash2, ShieldCheck, Mail, Sun, Moon, X
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/components/shared/theme-provider";

export default function SettingsPage() {
  const { profile, loading, refreshProfile } = useUser();
  const { theme, toggleTheme } = useTheme();

  // Tab state
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "appearance" | "account">("profile");

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
  const [accentColor, setAccentColor] = useState("indigo");

  // Saving states
  const [saving, setSaving] = useState(false);
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
      
      setAccentColor(profile.accentColor || "indigo");
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

  const handleDeleteAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmationText !== "DELETE MY ACCOUNT") {
      toast.error("Please type 'DELETE MY ACCOUNT' to confirm.");
      return;
    }

    toast.info("Deleting account...");
    // Simulate deleting the account. In production, this calls DELETE /api/user/settings
    setTimeout(() => {
      toast.success("Account deleted. Redirecting...");
      window.location.href = "/";
    }, 1500);
  };

  const tabs = [
    { id: "profile", label: "Profile Settings", icon: <User className="h-4 w-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
    { id: "appearance", label: "Appearance", icon: <Eye className="h-4 w-4" /> },
    { id: "account", label: "Account & Security", icon: <ShieldAlert className="h-4 w-4" /> },
  ] as const;

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
        <span className="text-3xs text-zinc-400">Loading settings canvas...</span>
      </div>
    );
  }

  const accents = ["indigo", "violet", "emerald", "amber", "rose"] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Customize your profile, configure email notifications, and manage connected services.
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
                  ? "bg-zinc-200 text-zinc-950 dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Right Side: Tab contents (9 cols) */}
        <div className="md:col-span-9 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/35 shadow-sm">
          
          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {/* PROFILE SETTINGS TAB */}
            {activeTab === "profile" && (
              <div className="space-y-5 text-2xs">
                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold text-zinc-950 dark:text-white">Profile Details</h3>
                  <p className="text-4xs text-zinc-400 mt-0.5 font-medium">Update your job search metadata and targets.</p>
                </div>

                {/* Avatar Display mockup */}
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg uppercase shadow">
                    {name ? name[0] : "U"}
                  </div>
                  <div>
                    <span className="text-3xs font-semibold text-zinc-455 uppercase block">Profile Picture</span>
                    <button type="button" className="text-indigo-600 hover:underline text-3xs font-semibold mt-1">Upload New Picture</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-3xs font-semibold text-zinc-450 uppercase">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full rounded border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-semibold text-zinc-450 uppercase">Email Address (Read Only)</label>
                    <input
                      type="email"
                      disabled
                      value={profile?.email || ""}
                      className="w-full rounded border border-zinc-200 bg-zinc-100 px-2.5 py-1.5 text-zinc-500 cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-3xs font-semibold text-zinc-455 uppercase flex items-center gap-1">
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
                    className="w-full rounded border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none dark:border-zinc-850 dark:bg-zinc-950 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-3xs font-semibold text-zinc-455 uppercase flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" /> Target Job Role
                    </label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Senior Frontend Engineer"
                      className="w-full rounded border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-semibold text-zinc-455 uppercase flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" /> Target Annual Salary
                    </label>
                    <input
                      type="text"
                      value={targetSalary}
                      onChange={(e) => setTargetSalary(e.target.value)}
                      placeholder="e.g. $140,000"
                      className="w-full rounded border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS SETTINGS TAB */}
            {activeTab === "notifications" && (
              <div className="space-y-5 text-2xs">
                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold text-zinc-950 dark:text-white">Email Preferences</h3>
                  <p className="text-4xs text-zinc-400 mt-0.5 font-medium">Select when we should notify you about account updates.</p>
                </div>

                <div className="space-y-4">
                  {/* Toggle item 1 */}
                  <label className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-zinc-50/50 p-3.5 dark:border-zinc-850 dark:bg-zinc-950/20 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyAnalysis}
                      onChange={(e) => setNotifyAnalysis(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300 text-indigo-650 focus:ring-indigo-500 mt-0.5"
                    />
                    <div className="flex-grow">
                      <span className="font-semibold text-zinc-900 dark:text-white">Analysis Complete</span>
                      <p className="text-4xs text-zinc-400 mt-0.5 leading-normal">
                        Receive an email confirmation containing the match score summary when an AI resume audit completes.
                      </p>
                    </div>
                  </label>

                  {/* Toggle item 2 */}
                  <label className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-zinc-50/50 p-3.5 dark:border-zinc-850 dark:bg-zinc-950/20 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyFollowup}
                      onChange={(e) => setNotifyFollowup(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300 text-indigo-650 focus:ring-indigo-500 mt-0.5"
                    />
                    <div className="flex-grow">
                      <span className="font-semibold text-zinc-900 dark:text-white">Follow-up reminders</span>
                      <p className="text-4xs text-zinc-400 mt-0.5 leading-normal">
                        Receive calendar reminders when tracked job applications reach their specified follow-up dates.
                      </p>
                    </div>
                  </label>

                  {/* Toggle item 3 */}
                  <label className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-zinc-50/50 p-3.5 dark:border-zinc-850 dark:bg-zinc-950/20 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyWeekly}
                      onChange={(e) => setNotifyWeekly(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300 text-indigo-650 focus:ring-indigo-500 mt-0.5"
                    />
                    <div className="flex-grow">
                      <span className="font-semibold text-zinc-900 dark:text-white">Weekly Pipeline Report</span>
                      <p className="text-4xs text-zinc-400 mt-0.5 leading-normal">
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
                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold text-zinc-950 dark:text-white">Visual Customization</h3>
                  <p className="text-4xs text-zinc-400 mt-0.5 font-medium">Select your interface colors and display themes.</p>
                </div>

                {/* Dark Mode toggle representation */}
                <div className="space-y-2">
                  <span className="text-3xs font-semibold text-zinc-500 uppercase tracking-wider block">Theme Mode</span>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (theme !== "light") toggleTheme();
                      }}
                      className={`flex-1 rounded-lg border p-4 text-center font-bold transition-all flex items-center justify-center gap-2 ${
                        theme === "light" 
                          ? "border-indigo-600 bg-indigo-600/5 text-indigo-650"
                          : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
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
                          ? "border-indigo-600 bg-indigo-650/5 text-indigo-400"
                          : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
                      }`}
                    >
                      <Moon className="h-4 w-4" /> Dark Mode
                    </button>
                  </div>
                </div>

                {/* Accent Color picker */}
                <div className="space-y-2">
                  <span className="text-3xs font-semibold text-zinc-500 uppercase tracking-wider block">Accent Brand Color</span>
                  <div className="flex gap-3">
                    {accents.map((color) => {
                      // Helper colors mapping
                      const colorMap: any = {
                        indigo: "bg-indigo-600",
                        violet: "bg-violet-600",
                        emerald: "bg-emerald-600",
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
                            accentColor === color ? "ring-4 ring-indigo-500/30 scale-110" : ""
                          }`}
                          title={color}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ACCOUNT SECURITY & DELETION TAB */}
            {activeTab === "account" && (
              <div className="space-y-6 text-2xs">
                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold text-zinc-950 dark:text-white">Security & Actions</h3>
                  <p className="text-4xs text-zinc-400 mt-0.5 font-medium">Verify login security integrations or delete account.</p>
                </div>

                {/* OAuth status */}
                <div className="space-y-3.5">
                  <span className="text-3xs font-semibold text-zinc-500 uppercase tracking-wider block">Connected Integrations</span>
                  
                  <div className="flex items-center justify-between border border-zinc-150 rounded-lg p-3.5 dark:border-zinc-850 dark:bg-zinc-950/20">
                    <div className="flex items-center gap-2.5">
                      <Mail className="h-5 w-5 text-indigo-500" />
                      <div>
                        <span className="font-semibold block text-zinc-900 dark:text-white">Email Authentication</span>
                        <span className="text-4xs text-zinc-400">Primary login capability enabled.</span>
                      </div>
                    </div>
                    <span className="rounded bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 px-2 py-0.5 text-3xs font-bold flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 fill-current" /> Active
                    </span>
                  </div>
                </div>

                {/* Danger zone delete button */}
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 dark:border-red-950 dark:bg-red-950/10">
                  <span className="text-xs font-bold text-red-650 dark:text-red-400 uppercase tracking-wide">Danger Zone</span>
                  <p className="text-4xs text-zinc-500 mt-1 leading-normal">
                    Permanently delete your account along with all resume uploads, job trackers, cover letters, and subscription histories. This action cannot be undone.
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
            {activeTab !== "account" && (
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-md shadow-indigo-600/10"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-850 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
              <h2 className="text-sm font-bold text-red-600 dark:text-red-400">Confirm Account Deletion</h2>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleDeleteAccountSubmit} className="space-y-4 text-2xs">
              <p className="text-zinc-550 dark:text-zinc-400 leading-normal">
                To confirm deletion of your account and permanent removal of all data, please type <strong className="text-red-500 font-bold">DELETE MY ACCOUNT</strong> in the field below.
              </p>

              <input
                type="text"
                required
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="w-full rounded border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 focus:border-red-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              />

              <div className="border-t border-zinc-100 dark:border-zinc-850 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded border border-zinc-250 bg-white px-4 py-2 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-red-650 bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500 shadow-sm"
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
