# 🚀 ResumeIQ — AI-Powered Resume Tracker

> A full-stack AI-powered career platform for resume analysis, job tracking, ATS optimization, and intelligent career assistance.

<p align="center">
  <a href="https://resumeiq-app-610.netlify.app/">
    <img src="https://img.shields.io/badge/🚀_LIVE_DEMO-Visit_ResumeIQ-00C7B7?style=for-the-badge" alt="Live Demo"/>
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript"/>
  <img src="https://img.shields.io/badge/TailwindCSS-3-38BDF8?style=for-the-badge&logo=tailwindcss"/>
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma"/>
</p>

---

## 📌 Overview

**ResumeIQ** is a full-stack AI-powered career platform designed to simplify the job search workflow.

The application combines **resume analysis, ATS optimization, job application tracking, cover letter generation, and interview preparation** into a unified career dashboard.

🌐 **Live Application:** https://resumeiq-app-610.netlify.app/

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Resume Analyzer** | Analyze resumes against job descriptions using AI |
| 📋 **Kanban Job Tracker** | Drag-and-drop application tracking across hiring stages |
| ✉️ **AI Cover Letters** | Generate personalized cover letters |
| 💼 **Job Suggestions** | Surface relevant career opportunities |
| 🧪 **ATS Sandbox** | Identify keyword gaps and improve ATS compatibility |
| 🎤 **AI Interview Coach** | Practice interview questions with AI feedback |
| 💳 **Billing Workflow** | Simulated subscription and payment workflow |
| 🛡️ **Admin Dashboard** | User, plan, and platform management |
| 🌙 **Dark Mode** | Responsive dark and light theme |

---

## 🏛️ System Architecture

```mermaid
flowchart TB

    USER([👤 User])

    NETLIFY[🌐 Netlify<br/>Hosting & Deployment]

    NEXT[⚡ Next.js 14<br/>App Router]

    subgraph DASHBOARD["Frontend Dashboard"]
        RESUME[📄 Resume Analyzer]
        ATS[🧪 ATS Sandbox]
        JOBS[📋 Job Tracker]
        COVER[✉️ Cover Letter]
        INTERVIEW[🎤 Interview Coach]
        SUGGEST[💼 Job Suggestions]
        BILLING[💳 Billing]
    end

    API[🔌 Next.js API Layer]

    subgraph SERVICES["Application Services"]
        AUTH[🔐 NextAuth.js<br/>Authentication]
        AI[🤖 Claude AI<br/>AI Services]
        UPLOAD[☁️ UploadThing<br/>File Uploads]
    end

    PRISMA[🔺 Prisma ORM<br/>Data Access Layer]

    subgraph DATABASE["Database Layer"]
        POSTGRES[(🐘 PostgreSQL<br/>Production)]
        SQLITE[(🗄️ SQLite<br/>Local Development)]
    end

    ADMIN[🛡️ Admin Dashboard]

    USER --> NETLIFY
    NETLIFY --> NEXT
    NEXT --> DASHBOARD

    DASHBOARD --> API

    API --> AUTH
    API --> AI
    API --> UPLOAD

    AUTH --> PRISMA
    AI --> PRISMA
    UPLOAD --> PRISMA

    PRISMA --> POSTGRES
    PRISMA --> SQLITE

    ADMIN --> API
```

---

## 🔄 Application Workflow

```mermaid
flowchart LR

    A[👤 User Login] --> B[📊 Career Dashboard]

    B --> C[📄 Upload Resume]
    B --> D[📋 Track Applications]
    B --> E[🧪 ATS Sandbox]

    C --> F[⚙️ Resume Processing]
    E --> G[🔍 Keyword Analysis]

    F --> H[🤖 AI Analysis Layer]
    G --> H

    H --> I[📊 Resume Insights]
    H --> J[✉️ Cover Letter]
    H --> K[🎤 Interview Feedback]
```

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
| **Deployment** | Netlify |

---

## 📁 Project Structure

```text
app/
├── (auth)/
├── (dashboard)/
│   └── dashboard/
│       ├── admin/
│       ├── analyzer/
│       ├── billing/
│       ├── cover-letter/
│       ├── interviewer/
│       ├── jobs/
│       ├── resumes/
│       ├── sandbox/
│       ├── settings/
│       └── tracker/
│
├── api/
└── checkout/

components/
hooks/
lib/
prisma/
public/
types/
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Clone Repository

```bash
git clone https://github.com/Mayank2014l/ai-powered-resume-tracker.git

cd ai-powered-resume-tracker
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

```bash
cp .env.example .env
```

Configure the required environment variables inside `.env`.

> ⚠️ Never commit API keys, database credentials, or production secrets.

### Setup Database

```bash
npx prisma generate
npx prisma db push
```

### Run Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🌐 Live Deployment

ResumeIQ is deployed on **Netlify**.

🚀 **Live Demo:** https://resumeiq-app-610.netlify.app/

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
