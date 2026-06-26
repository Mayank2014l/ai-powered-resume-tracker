"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "@/components/shared/theme-provider";
import { useUser } from "@/hooks/use-user";
import { 
  LayoutDashboard, FileSearch, FileCode, Kanban, 
  PenTool, Briefcase, Settings, Bell, Search, Menu, X, 
  LogOut, User, CreditCard, Moon, Sun, ChevronDown, ShieldCheck,
  Layers, MessageSquare, ClipboardCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, profile, loading } = useUser();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isAdmin = user?.email === "admin@resumeiq.co" || profile?.plan === "admin";

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: "Resume ATS Check", href: "/dashboard/resume-check", icon: <ClipboardCheck className="h-5 w-5" /> },
    { name: "Job Match Analyzer", href: "/dashboard/analyzer", icon: <FileSearch className="h-5 w-5" /> },
    { name: "My Resumes", href: "/dashboard/resumes", icon: <FileCode className="h-5 w-5" /> },
    { name: "Job Tracker", href: "/dashboard/tracker", icon: <Kanban className="h-5 w-5" /> },
    { name: "LinkedIn Jobs", href: "/dashboard/jobs", icon: <Briefcase className="h-5 w-5" /> },
    { name: "Cover Letter", href: "/dashboard/cover-letter", icon: <PenTool className="h-5 w-5" /> },
    { name: "Settings", href: "/dashboard/settings", icon: <Settings className="h-5 w-5" /> },
    ...(isAdmin ? [{ name: "Admin Panel", href: "/dashboard/admin", icon: <ShieldCheck className="h-5 w-5" /> }] : []),
  ];

  const notifications = [
    { id: 1, text: "Resume match audit completed for Vercel", time: "5m ago", unread: true },
    { id: 2, text: "Follow-up reminder: Google Application", time: "2h ago", unread: true },
    { id: 3, text: "Weekly resume analytics report is ready", time: "1d ago", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
      
      {/* LEFT SIDEBAR (Desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-zinc-200 bg-white dark:border-zinc-850 dark:bg-zinc-900/50 md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-zinc-250/20">
          <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">ResumeIQ</span>
          {profile?.plan === "pro" && (
            <span className="rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 text-4xs font-bold uppercase tracking-wider ml-1">Pro</span>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card at bottom of sidebar */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase">
              {user?.name ? user.name[0] : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-zinc-900 dark:text-white">
                {user?.name || "User"}
              </p>
              <p className="text-4xs truncate text-zinc-500 dark:text-zinc-400">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER NAVBAR & DRAWER */}
      <div className="flex md:pl-64 flex-col min-h-screen">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 backdrop-blur-md px-4 dark:border-zinc-850 dark:bg-zinc-900/80 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-4">
            {/* Mobile Menu trigger */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 md:hidden"
              aria-label="Open Sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Search bar mockup */}
            <div className="relative hidden sm:block w-64">
              <Search className="absolute inset-y-0 left-3 h-full w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search resumes, jobs..."
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-xs placeholder-zinc-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-850 dark:bg-zinc-950 dark:text-white dark:focus:bg-zinc-950"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            
            {/* Dark Mode toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-zinc-900" />
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 z-20 w-80 rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-2">
                        <span className="text-xs font-semibold">Notifications</span>
                        <span className="text-4xs text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer">Mark all read</span>
                      </div>
                      <div className="space-y-3">
                        {notifications.map((n) => (
                          <div key={n.id} className="flex flex-col gap-0.5 text-2xs border-b border-zinc-50 dark:border-zinc-900/50 pb-2 last:border-b-0">
                            <div className="flex justify-between">
                              <span className={`leading-relaxed ${n.unread ? "font-semibold text-zinc-950 dark:text-white" : "text-zinc-500"}`}>{n.text}</span>
                              {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 shrink-0 mt-1 ml-1" />}
                            </div>
                            <span className="text-4xs text-zinc-400">{n.time}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                  {user?.name ? user.name[0] : "U"}
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 z-20 w-48 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        <User className="h-4 w-4" />
                        <span>Profile Settings</span>
                      </Link>
                      <Link
                        href="/dashboard/billing"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Billing Portal</span>
                      </Link>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* Mobile Sidebar Navigation Drawer */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileSidebarOpen(false)}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
              />
              {/* Drawer Content */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-50 w-64 bg-white p-6 dark:bg-zinc-900 md:hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 dark:text-white">ResumeIQ</span>
                    </div>
                    <button
                      onClick={() => setMobileSidebarOpen(false)}
                      className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-855"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <nav className="space-y-1">
                    {navigationItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileSidebarOpen(false)}
                          className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-indigo-600 text-white"
                              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                          }`}
                        >
                          {item.icon}
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <div className="border-t border-zinc-150 dark:border-zinc-800 pt-4">
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-955/20"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Dashboard Main Children Contents */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
