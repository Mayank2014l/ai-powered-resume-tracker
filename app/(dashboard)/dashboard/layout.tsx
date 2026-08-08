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
    { name: "Analyze Resume", href: "/dashboard/analyzer", icon: <FileSearch className="h-5 w-5" /> },
    { name: "My Resumes", href: "/dashboard/resumes", icon: <FileCode className="h-5 w-5" /> },
    { name: "Job Tracker", href: "/dashboard/tracker", icon: <Kanban className="h-5 w-5" /> },
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
    <div className="min-h-screen bg-graphite-base text-gray-200 transition-colors duration-200">
      
      {/* LEFT SIDEBAR (Desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-graphite-border bg-graphite-surface md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-graphite-border">
          <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" />
            ResumeIQ
          </span>
          {profile?.plan === "pro" && (
            <span className="rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 text-4xs font-bold uppercase tracking-wider ml-1">Pro</span>
          )}
        </div>

        <nav className="flex-1 space-y-1.5 px-3 py-6">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/dashboard/analyzer" && pathname === "/dashboard/resume-check");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-semibold"
                    : "text-gray-400 hover:bg-graphite-surfaceHover hover:text-gray-100"
                }`}
              >
                <span className={isActive ? "text-white" : "text-gray-400 group-hover:text-emerald-400"}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card at bottom of sidebar */}
        <div className="border-t border-graphite-border p-4 bg-graphite-surface">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-sm font-bold text-emerald-400 uppercase">
              {user?.name ? user.name[0] : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-gray-100">
                {user?.name || "User"}
              </p>
              <p className="text-4xs truncate text-gray-400">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER NAVBAR & DRAWER */}
      <div className="flex md:pl-64 flex-col min-h-screen">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-graphite-border bg-graphite-surface/90 backdrop-blur-md px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-4">
            {/* Mobile Menu trigger */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-400 hover:bg-graphite-surfaceHover hover:text-gray-200 md:hidden"
              aria-label="Open Sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Search bar */}
            <div className="relative hidden sm:block w-64">
              <Search className="absolute inset-y-0 left-3 h-full w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search resumes, jobs..."
                className="w-full rounded-lg border border-graphite-border bg-graphite-base py-2 pl-9 pr-3 text-xs placeholder-gray-500 text-gray-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            
            {/* Dark Mode toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-400 hover:bg-graphite-surfaceHover hover:text-gray-200 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative rounded-lg p-2 text-gray-400 hover:bg-graphite-surfaceHover hover:text-gray-200"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-graphite-surface" />
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
                      className="absolute right-0 mt-2 z-20 w-80 rounded-xl border border-graphite-border bg-graphite-surface p-4 shadow-2xl"
                    >
                      <div className="flex items-center justify-between border-b border-graphite-border pb-2 mb-2">
                        <span className="text-xs font-semibold text-gray-100">Notifications</span>
                        <span className="text-4xs text-emerald-400 font-semibold cursor-pointer hover:underline">Mark all read</span>
                      </div>
                      <div className="space-y-3">
                        {notifications.map((n) => (
                          <div key={n.id} className="flex flex-col gap-0.5 text-2xs border-b border-graphite-border/50 pb-2 last:border-b-0">
                            <div className="flex justify-between">
                              <span className={`leading-relaxed ${n.unread ? "font-semibold text-gray-100" : "text-gray-400"}`}>{n.text}</span>
                              {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1 ml-1" />}
                            </div>
                            <span className="text-4xs text-gray-500">{n.time}</span>
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
                className="flex items-center gap-1.5 rounded-lg p-1 hover:bg-graphite-surfaceHover"
              >
                <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                  {user?.name ? user.name[0] : "U"}
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 z-20 w-48 rounded-xl border border-graphite-border bg-graphite-surface p-2 shadow-2xl"
                    >
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-300 hover:bg-graphite-surfaceHover hover:text-white"
                      >
                        <User className="h-4 w-4 text-emerald-400" />
                        <span>Profile Settings</span>
                      </Link>
                      <Link
                        href="/dashboard/billing"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-300 hover:bg-graphite-surfaceHover hover:text-white"
                      >
                        <CreditCard className="h-4 w-4 text-teal-400" />
                        <span>Billing Portal</span>
                      </Link>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
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
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
              />
              {/* Drawer Content */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-50 w-64 bg-graphite-surface border-r border-graphite-border p-6 md:hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-graphite-border pb-4 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        ResumeIQ
                      </span>
                    </div>
                    <button
                      onClick={() => setMobileSidebarOpen(false)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-graphite-surfaceHover hover:text-white"
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
                              ? "bg-emerald-600 text-white font-semibold"
                              : "text-gray-400 hover:bg-graphite-surfaceHover hover:text-white"
                          }`}
                        >
                          {item.icon}
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <div className="border-t border-graphite-border pt-4">
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10"
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-graphite-base">
          {children}
        </main>
      </div>

    </div>
  );
}
