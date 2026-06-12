# ResumeIQ — AI-Powered Resume Tracker

> Full-stack Next.js 14 application for intelligent resume analysis, job tracking, and AI-powered career tools.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://prisma.io)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Resume Analyzer** | Match resume against any JD using Claude Sonnet AI |
| 📋 **Kanban Job Tracker** | Drag-and-drop application tracking across stages |
| ✉️ **AI Cover Letters** | Generate personalized cover letters instantly |
| 💼 **LinkedIn Job Suggestions** | Sync LinkedIn profile to surface matched roles |
| 🧪 **ATS Sandbox** | Live ATS keyword gap scanner & optimization |
| 🎤 **AI Interview Coach** | Practice mock interview Q&A with AI feedback |
| 💳 **Payment Gateway** | UPI QR, Net Banking, Wallets, Cards — multi-method |
| 🛡️ **Admin Panel** | User management, plan overrides, system stats |
| 🌙 **Dark Mode** | Full dark/light theme toggle support |

---

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Auth**: NextAuth.js v5 (Credentials, Google, GitHub OAuth)
- **Database**: Prisma ORM (SQLite locally / PostgreSQL on Vercel)
- **AI**: Anthropic Claude Sonnet API
- **Payments**: Simulated UPI/Card/NetBanking/Wallet gateway
- **File Uploads**: UploadThing

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ai-powered-resume-tracker.git
cd ai-powered-resume-tracker

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your actual API keys

# Setup database
npx prisma generate
npx prisma db push

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
DATABASE_URL="file:./dev.db"          # SQLite (local) or PostgreSQL (production)
NEXTAUTH_SECRET="your-secret-here"    # Generate: openssl rand -base64 33
AUTH_GOOGLE_ID="your-google-oauth-id"
AUTH_GOOGLE_SECRET="your-google-oauth-secret"
ANTHROPIC_API_KEY="sk-ant-..."        # For AI resume analysis
STRIPE_SECRET_KEY="sk_test_..."       # For real payment processing
UPLOADTHING_SECRET="sk_live_..."      # For PDF/DOCX upload
```

> 💡 All API keys are **optional** — the app runs fully with built-in mock/simulation modes when keys are missing.

---

## 🌐 Deploy to Vercel

The easiest way to deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ai-powered-resume-tracker)

### Manual Vercel Deployment

```bash
npm i -g vercel
vercel --prod
```

Set environment variables in Vercel Dashboard → Project → Settings → Environment Variables.

> ⚠️ **Important**: Change `DATABASE_URL` to a PostgreSQL URL (e.g. Neon, Supabase) for production. SQLite is not supported on Vercel's serverless environment.

---

## 👤 Admin Login

Navigate to `/dashboard/admin` and authenticate with:
- **Email**: `admin@resumeiq.co`

The admin panel provides:
- User directory with plan management
- System-wide statistics (resumes, jobs, users)
- Ability to upgrade/downgrade any user's plan

---

## 💳 Payment Support

If payment is completed but plan is not activated, send payment screenshot to:
**support@resumeiq.co**

UPI ID for direct payment: **8076973546@nyes**

---

## 📁 Project Structure

```
app/
├── (auth)/           # Login / Register pages
├── (dashboard)/      # All dashboard pages
│   └── dashboard/
│       ├── admin/        # Admin panel
│       ├── analyzer/     # AI Resume Analyzer
│       ├── billing/      # Subscription & plans
│       ├── cover-letter/ # AI Cover Letter generator
│       ├── interviewer/  # AI Interview Coach
│       ├── jobs/         # LinkedIn Job Suggestions
│       ├── resumes/      # My Resumes list
│       ├── sandbox/      # ATS Sandbox
│       ├── settings/     # User profile settings
│       └── tracker/      # Kanban Job Tracker
├── api/              # Next.js API Routes
└── checkout/         # Payment checkout page
components/           # Shared React components
hooks/               # Custom React hooks
lib/                 # Auth, Prisma, Stripe, AI utilities
prisma/              # Database schema
```

---

## 📄 License

MIT License — Built by P K Sreenivas
