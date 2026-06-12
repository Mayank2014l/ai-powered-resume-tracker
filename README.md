# ResumeIQ 🚀
### AI-Powered Resume Audit & Kanban Job Tracker SaaS

ResumeIQ is a production-ready, full-stack Next.js 14 SaaS application engineered to help job seekers optimize their resumes using AI, organize and track opportunities on a Kanban pipeline, and draft high-conversion cover letters.

---

## 🛠️ Tech Stack & Badges

[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma_ORM-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Anthropic Claude](https://img.shields.io/badge/Claude_3.5_Sonnet-D97706?style=flat)](https://www.anthropic.com/)
[![Stripe Billing](https://img.shields.io/badge/Stripe_Billing-635BFF?style=flat&logo=stripe&logoColor=white)](https://stripe.com/)
[![Uploadthing](https://img.shields.io/badge/Uploadthing_Files-FF4500?style=flat)](https://uploadthing.com/)
[![Resend Email](https://img.shields.io/badge/Resend_Email-000000?style=flat)](https://resend.com/)

---

## 📸 Screenshots & Demos

> [!NOTE]
> *Insert visual dashboard previews and walkthrough recordings below.*

| Dashboard Main | Kanban Job Tracker | Resume AI Analyzer |
|:---:|:---:|:---:|
| `[Mockup Image Placeholder]` | `[Mockup Image Placeholder]` | `[Mockup Image Placeholder]` |

* **Live Demo Link:** `[Insert Deployment URL Placeholder]`

---

## ✨ Features Built

1. **AI-Powered Resume Auditor**: Computes a detailed match score, keywords breakdown, missing requirements tag cloud, and actionable before/after sentence corrections.
2. **Drag & Drop Kanban Board**: 5 pipeline columns (Saved, Applied, Interview, Offer, Rejected) for managing opportunity pipelines.
3. **AI Cover Letter Generator**: Generates customized 3-paragraph letters in seconds matching tone preferences (Professional, Enthusiastic, Concise).
4. **Interactive Analytics Dashboards**: Line graphs representing applications, bar charts showing match score alignment, status donuts, funnel rates, and active intensity heatmaps.
5. **Stripe Subscription Billing**: Support for upgrading to the Pro plan ($4.99/mo) with full invoice receipts history and feedback cancellation modals.
6. **Responsive Zinc-950 Dark Mode**: Smooth dark theme switcher with custom scrollbars and glassmorphism layouts.

---

## 🚀 Step-by-Step Setup Guide

Follow these instructions to run ResumeIQ locally:

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/resume-tracker.git
cd resume-tracker
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```

### 3. Setup PostgreSQL Database Schema
Run Prisma database sync to create all required tables:
```bash
npx prisma db push
```

*(Optional) Launch Prisma Studio to visually inspect database entries:*
```bash
npx prisma studio
```

### 4. Configure Stripe CLI (Local Webhooks)
Install Stripe CLI, log in, and forward events to your local route handler:
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
Copy the webhook signing secret (starts with `whsec_`) and insert it as `STRIPE_WEBHOOK_SECRET` in your `.env` file.

### 5. Launch Development Server
Start the local server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing the Mock Payment & AI Fallback
To make local verification fast, we have built-in smart mock logic:
* If no **Stripe Secret Key** is provided, the pricing button will execute a sandbox upgrade that updates your profile's plan to "pro" immediately on redirect.
* If no **Anthropic API Key** is provided, the Analyzer and Cover Letter routes will compile high-quality mock evaluation items so you can test all circular scores, tag clouds, before/after columns, and edit boxes without live API credits.
