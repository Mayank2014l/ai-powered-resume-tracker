# 🚀 ResumeIQ — AI-Powered Resume Tracker

> A full-stack AI-powered career platform for intelligent resume analysis, job tracking, ATS optimization, and career assistance.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://prisma.io)

---

## 📌 Overview

**ResumeIQ** is a full-stack Next.js application designed to simplify the job search process through AI-powered career tools.

The platform combines resume analysis, ATS optimization, job application tracking, cover letter generation, and interview preparation into a unified career dashboard.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Resume Analyzer** | Analyze resumes against job descriptions using Claude AI |
| 📋 **Kanban Job Tracker** | Drag-and-drop application tracking across hiring stages |
| ✉️ **AI Cover Letters** | Generate personalized cover letters based on job roles |
| 💼 **Job Suggestions** | Surface relevant opportunities based on profile information |
| 🧪 **ATS Sandbox** | Identify keyword gaps and improve ATS compatibility |
| 🎤 **AI Interview Coach** | Practice interview questions with AI-powered feedback |
| 💳 **Billing Workflow** | Simulated multi-method payment and subscription workflow |
| 🛡️ **Admin Dashboard** | User management, plan controls, and platform statistics |
| 🌙 **Dark Mode** | Responsive dark and light theme support |

---

## 🏗️ Tech Stack

| Category | Technologies |
|---|---|
| **Framework** | Next.js 14 — App Router |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS, Framer Motion |
| **Authentication** | NextAuth.js v5 |
| **Database** | Prisma ORM, SQLite, PostgreSQL |
| **AI Integration** | Anthropic Claude API |
| **File Uploads** | UploadThing |
| **Deployment** | Vercel |

---

## 🧠 System Architecture

```text
                         ┌─────────────────────┐
                         │        USER         │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   NEXT.JS FRONTEND  │
                         │  App Router + UI    │
                         └──────────┬──────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
   ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
   │  AUTHENTICATION  │   │    API ROUTES    │   │   FILE UPLOADS   │
   │   NextAuth.js    │   │   Next.js API    │   │   UploadThing    │
   └────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘
            │                      │                      │
            └──────────────────────┼──────────────────────┘
                                   │
                      ┌────────────┴────────────┐
                      │                         │
                      ▼                         ▼
            ┌──────────────────┐      ┌──────────────────┐
            │    AI SERVICES   │      │    PRISMA ORM    │
            │    Claude API    │      │   Data Access    │
            └────────┬─────────┘      └────────┬─────────┘
                     │                         │
                     ▼                         ▼
            ┌──────────────────┐      ┌──────────────────┐
            │ Resume Analysis  │      │ PostgreSQL /     │
            │ ATS Optimization │      │ SQLite           │
            │ Cover Letters    │      │                  │
            │ Interview Coach  │      │ Users            │
            └──────────────────┘      │ Jobs             │
                                      │ Resumes          │
                                      │ Applications     │
                                      └──────────────────┘
```

---

## 🔄 Application Workflow

```text
User Registration / Login
           │
           ▼
      Career Dashboard
           │
     ┌─────┼───────────────┐
     │     │               │
     ▼     ▼               ▼
 Resume   Job Tracker    ATS Sandbox
 Upload
     │                         │
     ▼                         ▼
Resume Processing        Keyword Analysis
     │                         │
     └──────────┬──────────────┘
                │
                ▼
          Claude AI API
                │
       ┌────────┼────────┐
       │        │        │
       ▼        ▼        ▼
    Resume    Cover   Interview
    Insights  Letter   Feedback
```

---

## 📁 Project Structure

```text
app/
├── (auth)/                    # Authentication pages
├── (dashboard)/
│   └── dashboard/
│       ├── admin/             # Admin Dashboard
│       ├── analyzer/          # AI Resume Analyzer
│       ├── billing/           # Subscription & Plans
│       ├── cover-letter/      # AI Cover Letter Generator
│       ├── interviewer/       # AI Interview Coach
│       ├── jobs/              # Job Suggestions
│       ├── resumes/           # Resume Management
│       ├── sandbox/           # ATS Sandbox
│       ├── settings/          # User Settings
│       └── tracker/           # Kanban Job Tracker
│
├── api/                       # Next.js API Routes
└── checkout/                  # Checkout Workflow

components/                     # Reusable React Components
hooks/                          # Custom React Hooks
lib/                            # Auth, Prisma & AI Utilities
prisma/                         # Database Schema
public/                         # Static Assets
types/                          # TypeScript Definitions
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

```bash
git clone https://github.com/Mayank2014l/ai-powered-resume-tracker.git

cd ai-powered-resume-tracker

npm install
```

### Configure Environment Variables

```bash
cp .env.example .env
```

Add the required environment variables:

```env
DATABASE_URL="file:./dev.db"

NEXTAUTH_SECRET="your-secret-here"

AUTH_GOOGLE_ID="your-google-oauth-id"
AUTH_GOOGLE_SECRET="your-google-oauth-secret"

ANTHROPIC_API_KEY="your-anthropic-api-key"

UPLOADTHING_SECRET="your-uploadthing-secret"
```

> ⚠️ Never commit production API keys, secrets, or `.env` files to the repository.

---

## 🗄️ Database Setup

```bash
npx prisma generate
npx prisma db push
```

---

## ▶️ Run Locally

```bash
npm run dev
```

Open the application at:

```text
http://localhost:3000
```

---

## 🌐 Deployment

ResumeIQ can be deployed using **Vercel**.

For production deployments:

- Configure environment variables in the deployment platform.
- Use PostgreSQL instead of local SQLite storage.
- Generate the Prisma client during the build process.
- Keep all production credentials secure.

---

## 🎯 Project Goals

ResumeIQ was built to explore and implement:

- AI integration in career technology
- Resume and ATS analysis workflows
- Full-stack application architecture
- Authentication and authorization
- Database-driven dashboards
- AI-assisted productivity tools

---

## 🔮 Future Improvements

- 📊 Advanced resume scoring models
- 🔗 Real-time job API integrations
- 📄 Resume version comparison
- 🧭 AI-powered career roadmap generation
- 📈 Detailed career analytics dashboards
- 🤖 Improved ATS optimization algorithms

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  Built with ❤️ by <b>Mayank Pradhan</b>
</p>
