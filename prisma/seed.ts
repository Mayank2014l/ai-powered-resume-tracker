import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database demo data...");

  // Upsert demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@resumeiq.co" },
    update: {},
    create: {
      email: "demo@resumeiq.co",
      name: "Alex Chen",
      plan: "pro",
    },
  });

  console.log(`Demo user ready: ${user.email} (ID: ${user.id})`);

  // Clear existing demo user data
  await prisma.analysis.deleteMany({ where: { userId: user.id } });
  await prisma.job.deleteMany({ where: { userId: user.id } });
  await prisma.resume.deleteMany({ where: { userId: user.id } });

  // Create Resumes
  const resume1 = await prisma.resume.create({
    data: {
      userId: user.id,
      filename: "Alex_Chen_Senior_FullStack_Resume.pdf",
      fileUrl: "https://storage.resumeiq.co/resumes/demo/Alex_Chen_Resume.pdf",
      extractedText: `ALEX CHEN\nSan Francisco, CA | alex.chen@example.com | (555) 234-5678\n\nSUMMARY\nSenior Full Stack Engineer with 6+ years of experience architecting high-throughput React, Next.js, and TypeScript applications. Proven track record scaling Postgres database pipelines and reducing SSR load times by 42%.\n\nEXPERIENCE\nStaff Frontend & Systems Engineer | Acme Cloud Inc. | 2022 - Present\n- Architected enterprise Next.js App Router applications serving 2.4M monthly active users with sub-200ms TTFB.\n- Led migration of 14 core microservices to Node.js & TypeScript, improving CI/CD deployment reliability by 35%.\n- Implemented comprehensive Stripe billing integration processing $8.5M in annual recurring subscriptions.\n- Managed PostgreSQL schemas with Prisma ORM, indexing high-volume tables for 65% faster query execution.\n\nTECHNICAL SKILLS\nLanguages: TypeScript, JavaScript (ES6+), Python, SQL, HTML5, CSS3\nFrameworks: React, Next.js, Node.js, Express, Tailwind CSS, GraphQL, Prisma ORM\nCloud & DB: PostgreSQL, Redis, AWS, Docker, Git, CI/CD`,
    },
  });

  const resume2 = await prisma.resume.create({
    data: {
      userId: user.id,
      filename: "Sarah_Miller_Frontend_UIUX_Resume.pdf",
      fileUrl: "https://storage.resumeiq.co/resumes/demo/Sarah_Miller_Resume.pdf",
      extractedText: `SARAH MILLER\nSeattle, WA | sarah.miller@example.com | (555) 876-5432\n\nSUMMARY\nDesign-focused Senior Frontend Engineer specializing in React, Next.js, Tailwind CSS, and Figma Design Systems. Passionate about web accessibility (WCAG AAA) and delightful micro-interactions.\n\nEXPERIENCE\nSenior UI/UX Engineer | Lumina Studio | 2021 - Present\n- Created comprehensive multi-brand Design System used across 6 web applications in React and Tailwind CSS.\n- Improved Core Web Vitals to 99+ score across all metrics, boosting SEO organic conversion by 28%.\n\nTECHNICAL SKILLS\nFrontend: React, Next.js, TypeScript, Tailwind CSS, Framer Motion, HTML5/CSS3, Storybook\nDesign: Figma, Adobe XD, Design Tokens, User Testing, WCAG Accessibility`,
    },
  });

  // Create Jobs
  const today = new Date();
  const futureDate1 = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
  const futureDate2 = new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000);

  await prisma.job.createMany({
    data: [
      {
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
      {
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
      {
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
      {
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
      {
        userId: user.id,
        company: "Netflix",
        role: "UI Platform Engineer",
        salary: "$180,000 - $210,000",
        status: "rejected",
        location: "Los Gatos, CA",
        jdUrl: "https://jobs.netflix.com",
        matchScore: 71,
        notes: "Applied early January. Looking for candidate with specialized WebGL canvas experience.",
      },
    ],
  });

  // Create Sample Analysis
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
      ]),
      improvements: JSON.stringify([
        {
          issue: "Expand on end-to-end automated testing frameworks",
          suggestion: "Specify test frameworks like Playwright or Jest used in CI/CD pipelines.",
          before: "Led migration of 14 core microservices improving CI/CD reliability.",
          after: "Led migration of 14 microservices and deployed Playwright test suites, improving CI/CD reliability by 35%.",
        },
      ]),
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
