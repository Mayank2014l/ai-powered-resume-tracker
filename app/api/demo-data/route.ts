import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || "Demo User",
        },
      });
    }

    // 1. Seed 3 Sample Resumes
    const resume1 = await prisma.resume.create({
      data: {
        userId: user.id,
        filename: "Alex_Chen_Senior_FullStack_Resume.pdf",
        fileUrl: "https://storage.resumeiq.co/resumes/demo/Alex_Chen_Resume.pdf",
        extractedText: `ALEX CHEN
San Francisco, CA | alex.chen@example.com | (555) 234-5678 | linkedin.com/in/alexchen-dev | github.com/alexchen

SUMMARY
Senior Full Stack Engineer with 6+ years of experience architecting high-throughput React, Next.js, and TypeScript applications. Proven track record scaling Postgres database pipelines and reducing SSR load times by 42%.

EXPERIENCE
Staff Frontend & Systems Engineer | Acme Cloud Inc. | 2022 - Present
- Architected enterprise Next.js App Router applications serving 2.4M monthly active users with sub-200ms TTFB.
- Led migration of 14 core microservices to Node.js & TypeScript, improving CI/CD deployment reliability by 35%.
- Implemented comprehensive Stripe billing integration processing $8.5M in annual recurring subscriptions.
- Managed PostgreSQL schemas with Prisma ORM, indexing high-volume tables for 65% faster query execution.

Full Stack Software Engineer | Horizon Tech | 2019 - 2022
- Engineered responsive UI components using React, TypeScript, and Tailwind CSS.
- Developed scalable REST and GraphQL APIs with Express and PostgreSQL.
- Reduced bundle size by 38% via dynamic imports, lazy loading, and modern image optimization.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript (ES6+), Python, SQL, HTML5, CSS3
Frameworks & Libraries: React, Next.js, Node.js, Express, Tailwind CSS, GraphQL, Prisma ORM
Cloud & Databases: PostgreSQL, Redis, AWS (S3, Lambda), Docker, Git, CI/CD pipelines

EDUCATION
B.S. Computer Science | University of California, Berkeley | 2015 - 2019`,
      },
    });

    const resume2 = await prisma.resume.create({
      data: {
        userId: user.id,
        filename: "Sarah_Miller_Frontend_UIUX_Resume.pdf",
        fileUrl: "https://storage.resumeiq.co/resumes/demo/Sarah_Miller_Resume.pdf",
        extractedText: `SARAH MILLER
Seattle, WA | sarah.miller@example.com | (555) 876-5432 | sarahmiller.design

SUMMARY
Design-focused Senior Frontend Engineer specializing in React, Next.js, Tailwind CSS, and Figma Design Systems. Passionate about web accessibility (WCAG AAA) and delightful micro-interactions.

EXPERIENCE
Senior UI/UX Engineer | Lumina Studio | 2021 - Present
- Created comprehensive multi-brand Design System used across 6 web applications in React and Tailwind CSS.
- Improved Core Web Vitals to 99+ score across all metrics, boosting SEO organic conversion by 28%.
- Collaborated closely with product designers in Figma to build accessible, animated user interfaces.

Frontend Developer | PixelCraft Media | 2018 - 2021
- Developed interactive web applications using React, Next.js, and Framer Motion.
- Conducted usability tests with 120+ users, iterating interfaces to achieve 94% user satisfaction.

TECHNICAL SKILLS
Frontend: React, Next.js, TypeScript, Tailwind CSS, Framer Motion, HTML5/CSS3, Storybook
Design & Prototyping: Figma, Adobe XD, Design Tokens, User Testing, WCAG Accessibility
Tools: Git, Vite, Webpack, Vercel, Jest, Playwright

EDUCATION
B.A. Digital Media & Interactive Design | University of Washington | 2014 - 2018`,
      },
    });

    const resume3 = await prisma.resume.create({
      data: {
        userId: user.id,
        filename: "David_Kumar_Backend_Cloud_Resume.pdf",
        fileUrl: "https://storage.resumeiq.co/resumes/demo/David_Kumar_Resume.pdf",
        extractedText: `DAVID KUMAR
Austin, TX | david.kumar@example.com | (555) 432-1098 | github.com/davidkumar

SUMMARY
Backend & Cloud Infrastructure Engineer with deep expertise in distributed systems, Node.js, Go, PostgreSQL, and AWS architecture. Passionate about database optimization and zero-downtime deployments.

EXPERIENCE
Lead Backend Engineer | Apex Data Systems | 2021 - Present
- Designed event-driven microservices architecture processing 40,000 requests/sec with Node.js and Kafka.
- Optimized PostgreSQL database clustering and Redis caching, cutting average query latency from 85ms to 12ms.
- Provisioned infrastructure-as-code using Terraform and Docker on AWS ECS and Kubernetes.

Backend Developer | Nexus Financial | 2018 - 2021
- Built secure financial transaction APIs adhering to PCI-DSS compliance using Node.js and PostgreSQL.
- Implemented automated end-to-end integration tests achieving 92% test coverage.

TECHNICAL SKILLS
Languages: Node.js, TypeScript, Go, Python, SQL, Bash
Infrastructure: AWS (ECS, RDS, S3, CloudFront), Docker, Kubernetes, Terraform, CI/CD
Databases: PostgreSQL, Redis, MongoDB, Prisma, Kafka

EDUCATION
B.S. Software Engineering | University of Texas at Austin | 2014 - 2018`,
      },
    });

    // 2. Seed 5 Job Tracker Applications Across Stages
    const today = new Date();
    const futureDate1 = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    const futureDate2 = new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.job.create({
        data: {
          userId: user.id,
          company: "Stripe",
          role: "Senior Full Stack Engineer",
          salary: "$165,000 - $185,000",
          status: "applied",
          location: "San Francisco, CA (Hybrid)",
          jdUrl: "https://stripe.com/jobs",
          matchScore: 94,
          followUpDate: futureDate1,
          notes: "Applied via referral. Resume tailored with Stripe billing & Next.js keywords.",
        },
      }),
      prisma.job.create({
        data: {
          userId: user.id,
          company: "Vercel",
          role: "Next.js Solutions Architect",
          salary: "$155,000 - $175,000",
          status: "interview",
          location: "Remote (US)",
          jdUrl: "https://vercel.com/careers",
          matchScore: 91,
          followUpDate: futureDate2,
          notes: "Technical round scheduled with Frontend Engineering Director tomorrow at 2 PM.",
        },
      }),
      prisma.job.create({
        data: {
          userId: user.id,
          company: "Google",
          role: "Staff Frontend Software Engineer",
          salary: "$195,000 - $225,000",
          status: "offer",
          location: "Mountain View, CA",
          jdUrl: "https://careers.google.com",
          matchScore: 88,
          notes: "Received formal written offer! Reviewing compensation package and equity vesting.",
        },
      }),
      prisma.job.create({
        data: {
          userId: user.id,
          company: "Airbnb",
          role: "Design Systems & UI Engineer",
          salary: "$160,000 - $180,000",
          status: "saved",
          location: "San Francisco, CA (Remote)",
          jdUrl: "https://careers.airbnb.com",
          matchScore: 82,
          notes: "Need to tailor resume bullets to highlight Figma token architectures before submitting.",
        },
      }),
      prisma.job.create({
        data: {
          userId: user.id,
          company: "Netflix",
          role: "UI Platform Engineer",
          salary: "$180,000 - $210,000",
          status: "rejected",
          location: "Los Gatos, CA",
          jdUrl: "https://jobs.netflix.com",
          matchScore: 71,
          notes: "Applied early January. Feedback: looking for candidates with specialized WebGL/Canvas experience.",
        },
      }),
    ]);

    // 3. Seed Realistic Analyses for Showcasing
    await prisma.analysis.create({
      data: {
        userId: user.id,
        resumeId: resume1.id,
        jobDescription: "Senior Full Stack Engineer (Next.js, TypeScript, PostgreSQL, Stripe Payments) at Stripe",
        matchScore: 94,
        keywordsScore: 96,
        skillsScore: 92,
        experienceScore: 95,
        formatScore: 93,
        atsScore: 95,
        missingKeywords: JSON.stringify(["GraphQL federation", "Kubernetes Helm charts", "Playwright E2E testing"]),
        strengths: JSON.stringify([
          "Demonstrates quantifiable business impact with 42% SSR load time reduction and $8.5M Stripe volume.",
          "Strong alignment with Next.js App Router, TypeScript, and high-volume PostgreSQL architecture.",
          "Clear experience progression from Full Stack Engineer to Staff-level responsibilities.",
          "Concise, ATS-friendly single-page layout with high keyword density.",
        ]),
        improvements: JSON.stringify([
          {
            issue: "Expand on end-to-end automated testing frameworks",
            suggestion: "Specify test frameworks like Playwright or Jest used in CI/CD pipelines.",
            before: "Led migration of 14 core microservices improving CI/CD reliability.",
            after: "Led migration of 14 microservices and deployed Playwright test suites, improving CI/CD reliability by 35%.",
          },
          {
            issue: "Quantify database scaling achievements",
            suggestion: "Mention specific table sizes or throughput metrics for Postgres.",
            before: "Managed PostgreSQL schemas with Prisma ORM.",
            after: "Engineered high-concurrency PostgreSQL schemas with Prisma ORM across 10M+ records.",
          },
        ]),
      },
    });

    await prisma.analysis.create({
      data: {
        userId: user.id,
        resumeId: resume2.id,
        jobDescription: "Senior UI/UX & Design Systems Engineer (React, Tailwind, Figma, WCAG) at Airbnb",
        matchScore: 88,
        keywordsScore: 89,
        skillsScore: 92,
        experienceScore: 84,
        formatScore: 90,
        atsScore: 91,
        missingKeywords: JSON.stringify(["Design Tokens Studio", "Micro-frontend architecture", "Jest Snapshot Testing"]),
        strengths: JSON.stringify([
          "Strong focus on accessibility (WCAG AAA) and Core Web Vitals optimization.",
          "Proven Design System leadership across 6 multi-brand applications.",
          "Excellent collaboration between Figma designers and engineering teams.",
        ]),
        improvements: JSON.stringify([
          {
            issue: "Highlight automated visual regression testing",
            suggestion: "Mention Storybook test runners or Chromatic visual diffing.",
            before: "Created comprehensive multi-brand Design System in React.",
            after: "Created multi-brand Design System with Storybook & Chromatic automated visual regression tests.",
          },
        ]),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Demo data seeded successfully!",
      resumesCount: 3,
      jobsCount: 5,
      analysesCount: 2,
    });
  } catch (error: any) {
    console.error("Error seeding demo data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to seed demo data" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ success: true, message: "No data to clear" });
    }

    // Delete user's demo data in transaction
    await prisma.$transaction([
      prisma.analysis.deleteMany({ where: { userId: user.id } }),
      prisma.job.deleteMany({ where: { userId: user.id } }),
      prisma.resume.deleteMany({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
      success: true,
      message: "All demo data cleared successfully!",
    });
  } catch (error: any) {
    console.error("Error clearing demo data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to clear demo data" },
      { status: 500 }
    );
  }
}
