import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  resumeId: z.string(),
});

// ATS Check mock analyzer - gives detailed resume quality feedback
function analyzeResumeATS(resumeText: string, filename: string) {
  const text = resumeText.toLowerCase();

  // --- Section Detection ---
  const hasSummary = /summary|objective|profile|about/i.test(text);
  const hasExperience = /experience|work history|employment|intern/i.test(text);
  const hasEducation = /education|degree|university|college|b\.tech|mba|bachelor|master/i.test(text);
  const hasSkills = /skills|technologies|tech stack|languages|tools/i.test(text);
  const hasProjects = /project|portfolio|built|developed/i.test(text);
  const hasContact = /email|phone|linkedin|@/i.test(text);
  const hasCertifications = /certif|course|aws|google|meta|udemy/i.test(text);
  const hasAchievements = /achievement|award|honor|rank|topper|first/i.test(text);
  const hasNumbers = /\d+%|\d+ years|\d+\+|₹|\$|lakh|crore|\d+ projects|\d+ clients/i.test(text);
  const hasActionVerbs = /developed|built|led|designed|implemented|optimized|created|managed|delivered|achieved|increased|reduced/i.test(text);

  // --- Keyword Density ---
  const wordCount = resumeText.split(/\s+/).length;
  const isGoodLength = wordCount >= 300 && wordCount <= 800;
  const isTooShort = wordCount < 300;
  const isTooLong = wordCount > 800;

  // --- Name Detection ---
  const nameMatch = resumeText.match(/NAME:\s*(.+)/i) || resumeText.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/m);
  const detectedName = nameMatch ? nameMatch[1].trim() : filename.replace(/\.(pdf|docx)$/i, "").replace(/[-_]/g, " ");

  // Calculate scores
  const sectionScore = [hasSummary, hasExperience, hasEducation, hasSkills, hasProjects, hasContact].filter(Boolean).length;
  const atsScore = Math.min(98, Math.round(
    (sectionScore / 6) * 40 +
    (hasNumbers ? 20 : 0) +
    (hasActionVerbs ? 20 : 0) +
    (isGoodLength ? 10 : 5) +
    (hasCertifications ? 5 : 0) +
    (hasAchievements ? 5 : 0)
  ));

  // Issues
  const issues: { severity: "high" | "medium" | "low"; issue: string; fix: string }[] = [];

  if (!hasSummary) issues.push({ severity: "high", issue: "Professional Summary Missing", fix: "Add a 3-4 line summary at the top: who you are, what you do, and what value you bring." });
  if (!hasContact) issues.push({ severity: "high", issue: "Contact Info Not Found / Not ATS Readable", fix: "Add email, phone, and LinkedIn clearly at the top. Avoid placing them in headers/footers (ATS can't read those)." });
  if (!hasExperience) issues.push({ severity: "high", issue: "Work Experience Section Missing", fix: "Add a dedicated 'Experience' section with company, role, dates, and bullet points." });
  if (!hasSkills) issues.push({ severity: "high", issue: "Skills Section Missing", fix: "Add a 'Technical Skills' section listing your tools, languages, and frameworks." });
  if (!hasNumbers) issues.push({ severity: "medium", issue: "No Quantified Achievements", fix: "Add numbers to your bullets: '↑ performance by 30%', 'managed 5 projects', 'saved ₹2L cost'." });
  if (!hasActionVerbs) issues.push({ severity: "medium", issue: "Weak Bullet Points - No Action Verbs", fix: "Start bullets with strong action verbs: Developed, Designed, Led, Optimized, Delivered." });
  if (isTooShort) issues.push({ severity: "medium", issue: `Resume Too Short (${wordCount} words)`, fix: "Expand to at least 300-400 words. Add more details to your experience and project bullets." });
  if (isTooLong) issues.push({ severity: "low", issue: `Resume Too Long (${wordCount} words)`, fix: "Trim to 1-2 pages max. Remove old/irrelevant content. Recruiters scan for 6 seconds." });
  if (!hasProjects) issues.push({ severity: "medium", issue: "No Projects Listed", fix: "Add 2-3 projects with tech stack, your role, and results/impact." });
  if (!hasEducation) issues.push({ severity: "low", issue: "Education Section Not Detected", fix: "Add Education section with degree, institution, year, and CGPA/percentage." });
  if (!hasCertifications) issues.push({ severity: "low", issue: "No Certifications Found", fix: "Add relevant certifications (AWS, Google, Coursera, etc.) to boost credibility." });

  // Strengths
  const strengths: string[] = [];
  if (hasContact) strengths.push("✅ Contact information is present and ATS-readable");
  if (hasExperience) strengths.push("✅ Work experience section clearly structured");
  if (hasSkills) strengths.push("✅ Skills section detected — good for keyword matching");
  if (hasNumbers) strengths.push("✅ Quantified achievements found — strong for recruiter impact");
  if (hasActionVerbs) strengths.push("✅ Action verbs used — bullets are impactful");
  if (hasProjects) strengths.push("✅ Projects section present — demonstrates practical experience");
  if (hasCertifications) strengths.push("✅ Certifications listed — adds credibility");
  if (isGoodLength) strengths.push("✅ Resume length is ideal (300-800 words)");

  // ATS Tips
  const atsTips = [
    "Use standard section headings: 'Experience', 'Education', 'Skills' (not fancy names like 'My Journey')",
    "Avoid tables, columns, text boxes, and graphics — ATS can't parse them",
    "Use a clean single-column layout with standard fonts (Arial, Calibri, Times New Roman)",
    "Save as .PDF or .DOCX — not image-based PDFs",
    "Include keywords from job descriptions naturally in your bullets",
    "Avoid headers and footers — most ATS systems skip them entirely",
    "Use full dates (Jan 2024 – Jun 2024) not just years",
    "Spell out acronyms at least once: 'Artificial Intelligence (AI)'",
  ];

  return {
    detectedName,
    atsScore,
    wordCount,
    issues,
    strengths,
    atsTips,
    sectionsFound: { hasSummary, hasExperience, hasEducation, hasSkills, hasProjects, hasContact, hasCertifications, hasAchievements },
    resumeLength: isTooShort ? "short" : isTooLong ? "long" : "ideal",
  };
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { resumeId } = parsed.data;

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId, userId: session.user.id },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const result = analyzeResumeATS(resume.extractedText, resume.filename);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("ATS Check error:", error);
    return NextResponse.json({ error: error.message || "ATS analysis failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";
