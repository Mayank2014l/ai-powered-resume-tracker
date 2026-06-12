"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "@/components/shared/theme-provider";
import { useSession } from "next-auth/react";
import { 
  Sparkles, CheckCircle2, ChevronDown, Shield, BarChart3, 
  Layers, FileText, Send, UserCheck, Star, Moon, Sun, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const features = [
    {
      icon: <Sparkles className="h-6 w-6 text-indigo-500" />,
      title: "AI Resume Analysis",
      description: "Compare your resume against any job description and receive a detailed match score computed by Claude Sonnet AI."
    },
    {
      icon: <Layers className="h-6 w-6 text-indigo-500" />,
      title: "Kanban Job Tracker",
      description: "Organize your active search stages. Drag and drop listings through Saved, Applied, Interview, Offer, and Rejected."
    },
    {
      icon: <FileText className="h-6 w-6 text-indigo-500" />,
      title: "AI Cover Letters",
      description: "Instantly draft highly personalized cover letters matching your resume details to the job description in seconds."
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-indigo-500" />,
      title: "Advanced Analytics",
      description: "Gain core insights into your pipeline conversion rates, average match scores, and application activity trends."
    },
    {
      icon: <Shield className="h-6 w-6 text-indigo-500" />,
      title: "ATS Optimization",
      description: "Pinpoint missing keywords and formatting flaws that commonly cause systems to filter out applications."
    },
    {
      icon: <UserCheck className="h-6 w-6 text-indigo-500" />,
      title: "Smart Follow-ups",
      description: "Never lose track of a hot lead. Get reminded when it's time to follow up with recruiters and hiring managers."
    }
  ];

  const steps = [
    {
      num: "01",
      title: "Upload Resume",
      desc: "Upload your existing CV in PDF or Word format. We parse your history into clean searchable items."
    },
    {
      num: "02",
      title: "Paste Job Link/Text",
      desc: "Input the job description or target URL of the position you want to apply for."
    },
    {
      num: "03",
      title: "Optimize & Apply",
      desc: "Receive instant keyword audits, tailored improvements, and matching cover letters."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "Software Engineer at Google",
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      quote: "ResumeIQ completely transformed my application pipeline. I was able to customize my resume for 5 different roles in a single afternoon and secured 3 interviews within a week."
    },
    {
      name: "Marcus Chen",
      role: "Product Manager at Stripe",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      quote: "The Kanban board is incredibly smooth, and the AI-generated cover letters sounded extremely natural. The match score was spot on for evaluating my resume alignment."
    },
    {
      name: "Elena Rostova",
      role: "UX Designer at Vercel",
      img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      quote: "I loved the clean minimal layout. The dark mode toggle is smooth, and the analytics dashboards gave me a great view of where I was losing momentum in my applications."
    }
  ];

  const faqs = [
    {
      q: "How does the AI match score work?",
      a: "Our system uses Claude 3.5 Sonnet to perform semantic comparisons between your resume text and the job description. It analyzes skills, experience depth, and formatting relevance to produce a comprehensive score from 0 to 100."
    },
    {
      q: "Is my resume data secure?",
      a: "Yes, your data is completely secure. We use secure encrypted connections, and we never share your uploaded resumes, personal details, or notes with third parties or public AI training pools."
    },
    {
      q: "What is an ATS, and why is matching it important?",
      a: "An Applicant Tracking System (ATS) is software recruiters use to filter applications. If your resume lacks matching industry keywords or uses complex double columns, it may get filtered out before a human recruiter ever views it."
    },
    {
      q: "Can I customize the generated cover letters?",
      a: "Absolutely! After generating a cover letter, you can edit it directly inside our rich text editor, regenerate specific sections, select a different tone (Professional, Enthusiastic, or Concise), and export as a document."
    },
    {
      q: "How does the billing cycle work?",
      a: "We charge monthly subscriptions securely via Stripe. You can upgrade to Pro at any time, and your card will be billed automatically unless you downgrade or cancel."
    },
    {
      q: "Can I cancel my Pro plan at any time?",
      a: "Yes, you can cancel or downgrade your subscription at any time. Simply navigate to the Billing settings in your dashboard. You will keep your Pro access until the end of your current billing period."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50">
      
      {/* Sticky Header Navbar */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/50 bg-white/80 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">ResumeIQ</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {session ? (
              <Link 
                href="/dashboard" 
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="hidden sm:inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col justify-center text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-6 w-fit">
                <Sparkles className="h-3 w-3" />
                <span>Next-Gen Career Optimization SaaS</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-zinc-900 dark:text-white leading-[1.1]">
                Land more interviews with <span className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 bg-clip-text text-transparent">AI-powered Optimization</span>
              </h1>
              <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                Compare resumes against job descriptions, audit key skills, track multiple stages with our Kanban pipeline, and draft tailored cover letters instantly using Anthropic Claude.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/register" 
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white hover:bg-indigo-500 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-600/15"
                >
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <a 
                  href="#how-it-works" 
                  className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-6 py-3.5 text-base font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  See How it Works
                </a>
              </div>

              {/* Social Proof */}
              <div className="mt-12 flex flex-col sm:flex-row sm:items-center gap-4 border-t border-zinc-200/60 dark:border-zinc-800/60 pt-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <img 
                      key={i} 
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-zinc-950" 
                      src={`https://images.unsplash.com/photo-${1500000000000 + i * 100000}?w=64&h=64&fit=crop&crop=faces`} 
                      alt={`User Avatar ${i}`} 
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="ml-2 text-sm font-semibold">4.9/5 rating</span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Trusted by over <strong className="font-semibold text-zinc-950 dark:text-white">2,400+ job seekers</strong> worldwide.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Dashboard Mockup */}
            <div className="lg:col-span-5 relative mt-12 lg:mt-0">
              <div className="relative rounded-xl border border-zinc-200 bg-zinc-50 p-2 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
                {/* Mockup Header browser dots */}
                <div className="flex items-center gap-1.5 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-2 px-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <span className="ml-4 text-2xs text-zinc-400 dark:text-zinc-500">app.resumeiq.co/dashboard</span>
                </div>
                {/* Mockup Body Content */}
                <div className="p-3 grid grid-cols-12 gap-3 text-2xs">
                  {/* Sidebar mockup */}
                  <div className="col-span-3 border-r border-zinc-200/50 dark:border-zinc-800/50 pr-2 flex flex-col gap-2">
                    <div className="h-4 w-full rounded bg-indigo-500/10" />
                    <div className="h-3 w-4/5 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-3 w-5/6 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-3 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                  {/* Dashboard body mockup */}
                  <div className="col-span-9 flex flex-col gap-3">
                    <div className="flex gap-2">
                      <div className="flex-1 p-2 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <span className="text-zinc-400 block mb-1">Match Score</span>
                        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">88%</span>
                      </div>
                      <div className="flex-1 p-2 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <span className="text-zinc-400 block mb-1">Applications</span>
                        <span className="text-lg font-bold">42</span>
                      </div>
                    </div>
                    {/* Activity Feed mockup */}
                    <div className="p-2.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col gap-1.5">
                      <span className="font-semibold text-3xs text-zinc-400 uppercase tracking-wider block">Recent Audits</span>
                      <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900 pb-1">
                        <span>Frontend Developer</span>
                        <span className="rounded bg-emerald-500/10 text-emerald-600 px-1 font-semibold">92%</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900 pb-1">
                        <span>Product Designer</span>
                        <span className="rounded bg-amber-500/10 text-amber-600 px-1 font-semibold">74%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 border-t border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-zinc-900 dark:text-white">
              Maximize your hireability in one single workspace
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">
              Everything you need to bypass ATS checks, document notes, and schedule notifications.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="group relative rounded-xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800/80 dark:bg-zinc-900/40 hover-card hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 cursor-default"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 dark:bg-indigo-500/5 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-20 bg-zinc-50/50 dark:bg-zinc-900/10 border-t border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-zinc-900 dark:text-white">
              How it works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">
              Transform your applications in three simple steps.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-3 relative">
            {/* Visual connector lines for desktop */}
            <div className="absolute top-1/2 left-0 right-0 hidden lg:block h-0.5 bg-zinc-200 dark:bg-zinc-800 -translate-y-6 z-0" />
            
            {steps.map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center px-4 bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-100 dark:border-zinc-900 shadow-sm">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white mb-6">
                  {step.num}
                </span>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 border-t border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-zinc-900 dark:text-white">
              Success stories
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">
              Read how developers, designers, and managers landed interviews at top tier companies.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {testimonials.map((t, idx) => (
              <div 
                key={idx} 
                className="flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800/80 dark:bg-zinc-900/30 shadow-sm"
              >
                <p className="text-sm italic text-zinc-600 dark:text-zinc-400">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <img className="h-10 w-10 rounded-full object-cover" src={t.img} alt={t.name} />
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">{t.name}</h4>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section (Glassmorphism Cards) */}
      <section id="pricing" className="py-20 bg-zinc-50/50 dark:bg-zinc-900/10 border-t border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-zinc-900 dark:text-white">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">
              Start optimizing for free, and upgrade to unlock unlimited power when you need it.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:max-w-3xl md:mx-auto lg:max-w-none lg:grid-cols-3 lg:items-stretch px-4">
            
            {/* Free Plan */}
            <div className="rounded-2xl p-8 border border-zinc-200 bg-white/70 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-900/30 shadow-lg relative flex flex-col justify-between h-[500px] transition-all hover:scale-[1.01]">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Free Plan</h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Perfect to test basic match scoring.</p>
                <div className="mt-6">
                  <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">₹0</span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400"> / month</span>
                </div>
                <ul className="mt-8 space-y-4 text-sm text-zinc-650 dark:text-zinc-350">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                    <span>5 AI Analyses / month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                    <span>Manage up to 3 Resumes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                    <span>Basic Kanban tracker</span>
                  </li>
                  <li className="flex items-center gap-2 text-zinc-400 line-through">
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                    <span>AI Cover Letter drafts</span>
                  </li>
                </ul>
              </div>
              <Link 
                href="/register" 
                className="mt-8 inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-850 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all"
              >
                Sign Up Free
              </Link>
            </div>

            {/* Pro Plan - Highlighted */}
            <div className="rounded-2xl p-8 border-2 border-indigo-600 bg-white/80 dark:bg-zinc-900/40 dark:border-indigo-500 shadow-2xl relative flex flex-col justify-between h-[500px] transition-all hover:scale-[1.02]">
              <div className="absolute top-0 right-8 -translate-y-1/2 rounded-full bg-indigo-600 px-3 py-1 text-2xs font-bold text-white uppercase tracking-wider">
                Most Popular
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Pro Plan</h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Everything needed to land job offers.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">₹299</span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">/ month</span>
                  <span className="text-xs text-zinc-400 ml-2">($4.99/mo)</span>
                </div>
                <ul className="mt-8 space-y-4 text-sm text-zinc-650 dark:text-zinc-350">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                    <span className="font-semibold">Unlimited AI Analyses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                    <span className="font-semibold">Unlimited Resumes Uploads</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                    <span>Unlimited AI Cover Letters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                    <span>PDF Export & Priority Support</span>
                  </li>
                </ul>
              </div>
              <Link 
                href="/register" 
                className="mt-8 inline-flex items-center justify-center rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-550 transition-all shadow-md shadow-indigo-600/10"
              >
                Upgrade to Pro
              </Link>
            </div>

            {/* Ultimate Plan */}
            <div className="rounded-2xl p-8 border border-zinc-200 bg-white/70 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-900/30 shadow-lg relative flex flex-col justify-between h-[500px] transition-all hover:scale-[1.01]">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Ultimate Tier</h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Master every single interview loop.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">₹599</span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">/ month</span>
                  <span className="text-xs text-zinc-400 ml-2">($9.99/mo)</span>
                </div>
                <ul className="mt-8 space-y-4 text-sm text-zinc-650 dark:text-zinc-350">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                    <span className="font-semibold">Everything inside Pro</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                    <span>Live ATS Sandbox Sim</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                    <span>1-on-1 AI Interview coach</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                    <span>Dynamic Resume Keyword Injector</span>
                  </li>
                </ul>
              </div>
              <Link 
                href="/register" 
                className="mt-8 inline-flex items-center justify-center rounded-lg bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 py-3 text-sm font-semibold transition-all"
              >
                Get Ultimate Tier
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-20 border-t border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-zinc-900 dark:text-white">
              Frequently asked questions
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">
              Clear answers to common questions about ResumeIQ.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/35 overflow-hidden transition-all"
              >
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left font-medium text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${activeFaq === idx ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {activeFaq === idx && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-zinc-100 dark:border-zinc-800/50 px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">ResumeIQ</span>
          </div>

          <div className="flex gap-8 text-sm text-zinc-500 dark:text-zinc-400">
            <a href="#features" className="hover:text-zinc-900 dark:hover:text-white">Features</a>
            <a href="#pricing" className="hover:text-zinc-900 dark:hover:text-white">Pricing</a>
            <a href="#faq" className="hover:text-zinc-900 dark:hover:text-white">FAQ</a>
            <a href="/login" className="hover:text-zinc-900 dark:hover:text-white">Sign In</a>
          </div>

          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} ResumeIQ Inc. All rights reserved. Made for job seekers.
          </p>
        </div>
      </footer>

    </div>
  );
}
