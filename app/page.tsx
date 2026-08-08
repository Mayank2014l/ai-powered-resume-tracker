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
      icon: <Sparkles className="h-6 w-6 text-emerald-400" />,
      title: "AI Resume Analysis",
      description: "Compare your resume against any job description and receive a detailed match score computed by Claude Sonnet AI."
    },
    {
      icon: <Layers className="h-6 w-6 text-emerald-400" />,
      title: "Kanban Job Tracker",
      description: "Organize your active search stages. Drag and drop listings through Saved, Applied, Interview, Offer, and Rejected."
    },
    {
      icon: <FileText className="h-6 w-6 text-emerald-400" />,
      title: "AI Cover Letters",
      description: "Instantly draft highly personalized cover letters matching your resume details to the job description in seconds."
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-emerald-400" />,
      title: "Advanced Analytics",
      description: "Gain core insights into your pipeline conversion rates, average match scores, and application activity trends."
    },
    {
      icon: <Shield className="h-6 w-6 text-emerald-400" />,
      title: "ATS Optimization",
      description: "Pinpoint missing keywords and formatting flaws that commonly cause systems to filter out applications."
    },
    {
      icon: <UserCheck className="h-6 w-6 text-emerald-400" />,
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
    <div className="min-h-screen bg-graphite-base text-gray-200 transition-colors duration-300 font-sans">
      
      {/* Sticky Header Navbar */}
      <header className="sticky top-0 z-50 border-b border-graphite-border bg-graphite-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white">ResumeIQ</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            {session ? (
              <Link 
                href="/dashboard" 
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors duration-200 shadow-md shadow-emerald-600/10"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="hidden sm:inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors duration-200 shadow-md shadow-emerald-600/10"
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
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400 mb-6 w-fit">
                <Sparkles className="h-3 w-3" />
                <span>Next-Gen Career Optimization SaaS</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white leading-[1.1]">
                Land more interviews with <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">AI-powered Optimization</span>
              </h1>
              <p className="mt-6 text-lg text-gray-400 leading-relaxed max-w-2xl">
                Compare resumes against job descriptions, audit key skills, track multiple stages with our Kanban pipeline, and draft tailored cover letters instantly using Claude AI.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/register" 
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white hover:bg-emerald-500 transition-all duration-200 shadow-lg shadow-emerald-600/15"
                >
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <a 
                  href="#how-it-works" 
                  className="inline-flex items-center justify-center rounded-lg border border-graphite-border bg-graphite-surface px-6 py-3.5 text-base font-semibold text-gray-300 hover:bg-graphite-surfaceHover hover:text-white transition-all duration-200"
                >
                  See How it Works
                </a>
              </div>

              {/* Social Proof */}
              <div className="mt-12 flex flex-col sm:flex-row sm:items-center gap-4 border-t border-graphite-border pt-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <img 
                      key={i} 
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-graphite-base" 
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
                    <span className="ml-2 text-sm font-semibold text-white">4.9/5 rating</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Trusted by over <strong className="font-semibold text-white">2,400+ job seekers</strong> worldwide.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Dashboard Mockup */}
            <div className="lg:col-span-5 relative mt-12 lg:mt-0">
              <div className="relative rounded-xl border border-graphite-border bg-graphite-surface p-2 shadow-2xl">
                {/* Mockup Header browser dots */}
                <div className="flex items-center gap-1.5 border-b border-graphite-border pb-2 px-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/70" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/70" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/70" />
                  <span className="ml-4 text-2xs text-gray-500 font-mono">app.resumeiq.co/dashboard</span>
                </div>
                {/* Mockup Body Content */}
                <div className="p-3 grid grid-cols-12 gap-3 text-2xs">
                  {/* Sidebar mockup */}
                  <div className="col-span-3 border-r border-graphite-border pr-2 flex flex-col gap-2">
                    <div className="h-4 w-full rounded bg-emerald-500/20" />
                    <div className="h-3 w-4/5 rounded bg-graphite-surfaceHover" />
                    <div className="h-3 w-5/6 rounded bg-graphite-surfaceHover" />
                    <div className="h-3 w-3/4 rounded bg-graphite-surfaceHover" />
                  </div>
                  {/* Dashboard body mockup */}
                  <div className="col-span-9 flex flex-col gap-3">
                    <div className="flex gap-2">
                      <div className="flex-1 p-2 rounded border border-graphite-border bg-graphite-base">
                        <span className="text-gray-400 block mb-1">Match Score</span>
                        <span className="text-lg font-bold text-emerald-400">88%</span>
                      </div>
                      <div className="flex-1 p-2 rounded border border-graphite-border bg-graphite-base">
                        <span className="text-gray-400 block mb-1">Applications</span>
                        <span className="text-lg font-bold text-white">42</span>
                      </div>
                    </div>
                    {/* Activity Feed mockup */}
                    <div className="p-2.5 rounded border border-graphite-border bg-graphite-base flex flex-col gap-1.5">
                      <span className="font-semibold text-3xs text-gray-400 uppercase tracking-wider block">Recent Audits</span>
                      <div className="flex justify-between items-center border-b border-graphite-border pb-1">
                        <span className="text-gray-300">Frontend Developer</span>
                        <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 font-semibold">92%</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-graphite-border pb-1">
                        <span className="text-gray-300">Product Designer</span>
                        <span className="rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 font-semibold">74%</span>
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
      <section id="features" className="py-20 border-t border-graphite-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Maximize your hireability in one single workspace
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-400">
              Everything you need to bypass ATS checks, document notes, and optimize applications.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="group relative rounded-xl border border-graphite-border bg-graphite-surface p-6 hover:border-emerald-500/50 hover:bg-graphite-surfaceHover transition-all duration-200 cursor-default"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-20 bg-graphite-surface/50 border-t border-graphite-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              How it works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-400">
              Transform your applications in three simple steps.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-3 relative">
            <div className="absolute top-1/2 left-0 right-0 hidden lg:block h-0.5 bg-graphite-border -translate-y-6 z-0" />
            
            {steps.map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center px-4 bg-graphite-surface p-6 rounded-xl border border-graphite-border shadow-sm">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white mb-6 shadow-md shadow-emerald-600/20">
                  {step.num}
                </span>
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 border-t border-graphite-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Success stories
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-400">
              Read how developers, designers, and managers landed interviews at top tier companies.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {testimonials.map((t, idx) => (
              <div 
                key={idx} 
                className="flex flex-col justify-between rounded-xl border border-graphite-border bg-graphite-surface p-6 shadow-sm"
              >
                <p className="text-sm italic text-gray-300">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <img className="h-10 w-10 rounded-full object-cover ring-1 ring-graphite-border" src={t.img} alt={t.name} />
                  <div>
                    <h4 className="text-sm font-semibold text-white">{t.name}</h4>
                    <span className="text-xs text-gray-400">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-graphite-surface/50 border-t border-graphite-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-400">
              Start optimizing for free, and upgrade to unlock unlimited power when you need it.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:max-w-3xl md:mx-auto lg:max-w-none lg:grid-cols-3 lg:items-stretch px-4">
            
            {/* Free Plan */}
            <div className="rounded-2xl p-8 border border-graphite-border bg-graphite-surface shadow-lg relative flex flex-col justify-between h-[500px]">
              <div>
                <h3 className="text-xl font-bold text-white">Free Plan</h3>
                <p className="mt-2 text-sm text-gray-400">Perfect to test basic match scoring.</p>
                <div className="mt-6">
                  <span className="text-4xl font-extrabold text-white">₹0</span>
                  <span className="text-sm text-gray-400"> / month</span>
                </div>
                <ul className="mt-8 space-y-4 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                    <span>5 AI Analyses / month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                    <span>Manage up to 3 Resumes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                    <span>Basic Kanban tracker</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-500 line-through">
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-gray-600" />
                    <span>AI Cover Letter drafts</span>
                  </li>
                </ul>
              </div>
              <Link 
                href="/register" 
                className="mt-8 inline-flex items-center justify-center rounded-lg border border-graphite-border bg-graphite-base py-3 text-sm font-semibold text-gray-300 hover:bg-graphite-surfaceHover hover:text-white transition-all"
              >
                Sign Up Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="rounded-2xl p-8 border-2 border-emerald-500 bg-graphite-surface shadow-2xl relative flex flex-col justify-between h-[500px]">
              <div className="absolute top-0 right-8 -translate-y-1/2 rounded-full bg-emerald-600 px-3 py-1 text-2xs font-bold text-white uppercase tracking-wider shadow">
                Most Popular
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Pro Plan</h3>
                <p className="mt-2 text-sm text-emerald-400">Everything needed to land job offers.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">₹299</span>
                  <span className="text-sm text-gray-400">/ month</span>
                  <span className="text-xs text-gray-500 ml-2">($4.99/mo)</span>
                </div>
                <ul className="mt-8 space-y-4 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-white">Unlimited AI Analyses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-white">Unlimited Resumes Uploads</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                    <span>Unlimited AI Cover Letters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                    <span>PDF Export & Priority Support</span>
                  </li>
                </ul>
              </div>
              <Link 
                href="/register" 
                className="mt-8 inline-flex items-center justify-center rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/10"
              >
                Upgrade to Pro
              </Link>
            </div>

            {/* Ultimate Plan */}
            <div className="rounded-2xl p-8 border border-teal-500/50 bg-graphite-surface shadow-lg relative flex flex-col justify-between h-[500px]">
              <div>
                <h3 className="text-xl font-bold text-white">Ultimate Tier</h3>
                <p className="mt-2 text-sm text-teal-400">Master every single interview loop.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">₹599</span>
                  <span className="text-sm text-gray-400">/ month</span>
                  <span className="text-xs text-gray-500 ml-2">($9.99/mo)</span>
                </div>
                <ul className="mt-8 space-y-4 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-white">Everything inside Pro</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                    <span>Live ATS Sandbox Sim</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                    <span>1-on-1 AI Interview coach</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                    <span>Dynamic Resume Keyword Injector</span>
                  </li>
                </ul>
              </div>
              <Link 
                href="/register" 
                className="mt-8 inline-flex items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-500 py-3 text-sm font-semibold transition-all shadow-md shadow-teal-600/10"
              >
                Get Ultimate Tier
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-20 border-t border-graphite-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Frequently asked questions
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-400">
              Clear answers to common questions about ResumeIQ.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="rounded-lg border border-graphite-border bg-graphite-surface overflow-hidden transition-all"
              >
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left font-medium text-white hover:bg-graphite-surfaceHover transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${activeFaq === idx ? "rotate-180" : ""}`} />
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
                      <div className="border-t border-graphite-border px-6 py-4 text-sm text-gray-400 leading-relaxed">
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
      <footer className="border-t border-graphite-border bg-graphite-surface py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-white">ResumeIQ</span>
          </div>

          <div className="flex gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <a href="/login" className="hover:text-white transition-colors">Sign In</a>
          </div>

          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} ResumeIQ Inc. All rights reserved. Made for job seekers.
          </p>
        </div>
      </footer>

    </div>
  );
}

