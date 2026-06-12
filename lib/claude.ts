import { ResumeAnalysis } from "@/types";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL_NAME = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";

interface ImprovementItem {
  issue: string;
  suggestion: string;
  before: string;
  after: string;
}

// Generate Mock Resume Analysis for fallback
function generateMockAnalysis(resumeText: string, jobDescription: string): ResumeAnalysis {
  // Simple heuristic analysis for mockup interactivity
  const jdLower = jobDescription.toLowerCase();
  const resumeLower = resumeText.toLowerCase();

  const techKeywords = [
    "react", "next.js", "typescript", "tailwind", "node.js", "graphql", 
    "postgresql", "docker", "aws", "ci/cd", "stripe", "prisma", "python",
    "kubernetes", "redis", "mongodb", "agile", "scrum", "jest"
  ];

  const foundKeywords: string[] = [];
  const missingKeywords: string[] = [];

  techKeywords.forEach(kw => {
    const inJd = jdLower.includes(kw);
    const inResume = resumeLower.includes(kw);
    if (inJd && inResume) {
      foundKeywords.push(kw.toUpperCase());
    } else if (inJd && !inResume) {
      missingKeywords.push(kw.toUpperCase());
    }
  });

  // If no keywords matched because of empty JD/Resume, add defaults
  if (missingKeywords.length === 0) {
    missingKeywords.push("NEXT.JS", "TYPESCRIPT", "TAILWIND CSS", "PRISMA", "STRIPE");
  }

  const keywordCoverage = techKeywords.filter(kw => jdLower.includes(kw)).length;
  const matchCount = foundKeywords.length;
  const matchRatio = keywordCoverage > 0 ? matchCount / keywordCoverage : 0.65;
  const matchScore = Math.min(100, Math.max(35, Math.round(matchRatio * 100)));

  const keywordsScore = Math.min(100, Math.round(matchScore * 1.05));
  const skillsScore = Math.min(100, Math.round(matchScore * 0.95));
  const experienceScore = Math.min(100, Math.round(matchScore * 0.9));
  const formatScore = 88;
  const atsScore = Math.round((matchScore + formatScore) / 2);

  const strengths = [
    "Strong technical command shown in core front-end patterns.",
    "Solid foundations in modern single-page applications and responsive layouts.",
    "Clear section headers and readable, scan-friendly chronological listings."
  ];

  const improvements: ImprovementItem[] = [];
  if (missingKeywords.includes("NEXT.JS") || missingKeywords.includes("TYPESCRIPT")) {
    improvements.push({
      issue: "Missing key frameworks in experience items",
      suggestion: "Mention Next.js and TypeScript explicitly in your latest software engineering project descriptions.",
      before: "Developed full stack client interfaces and APIs.",
      after: "Developed type-safe full-stack client interfaces and server-side routes using Next.js and TypeScript."
    });
  }

  improvements.push({
    issue: "Vague project metric accomplishments",
    suggestion: "Integrate quantitative metrics (e.g., % page load speed-up, load time savings) to prove business impact.",
    before: "Responsible for improving landing page efficiency and loading times.",
    after: "Redesigned assets and optimized bundle sizes, yielding a 42% decrease in page-load times and raising user retention metrics."
  });

  improvements.push({
    issue: "Generic summary statement",
    suggestion: "Include your target role and direct engineering focus in the header summary.",
    before: "Experienced coder looking to find a challenging software development role.",
    after: "Performance-oriented Full-Stack Developer specializing in Next.js/Tailwind SaaS designs and type-safe database architectures."
  });

  return {
    matchScore,
    keywordsScore,
    skillsScore,
    experienceScore,
    formatScore,
    missingKeywords,
    strengths,
    improvements,
    atsScore,
    atsSuggestions: "Your resume structure is largely parseable. However, to guarantee 100% ATS readability: 1. Keep headers in single cells rather than multi-layered tables. 2. Export as a clean PDF without embedded graphic illustrations."
  };
}

export async function analyzeResume(resumeText: string, jobDescription: string): Promise<ResumeAnalysis> {
  if (!resumeText || !jobDescription) {
    throw new Error("Resume text and job description are required for analysis.");
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("ANTHROPIC_API_KEY is missing. Falling back to mock local analysis...");
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API delay
    return generateMockAnalysis(resumeText, jobDescription);
  }

  const systemPrompt = `You are a professional ATS recruiter and career optimization AI. Compare the Resume text with the Job Description.
Evaluate the candidate and return a structured JSON response containing:
1. matchScore (integer 0-100)
2. keywordsScore (integer 0-100)
3. skillsScore (integer 0-100)
4. experienceScore (integer 0-100)
5. formatScore (integer 0-100)
6. missingKeywords (array of strings) - keywords from JD not present or weak in the resume
7. strengths (array of strings) - 3-5 positive features of the resume
8. improvements (array of objects with fields: issue, suggestion, before, after) - actionable before/after edits
9. atsScore (integer 0-100)
10. atsSuggestions (string) - detailed explanation of ATS compatibility and recommendations

Return ONLY the raw JSON block. Do not wrap in markdown or any other explanation. Ensure the JSON is valid.`;

  const userPrompt = `RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        max_tokens: 3000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error:", errorText);
      throw new Error(`Claude API request failed: ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.content[0].text;
    
    // Clean JSON content if wrapped in markdown codeblocks
    const cleanJsonString = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJsonString) as ResumeAnalysis;
  } catch (error) {
    console.error("Claude integration failed, serving mock fallback:", error);
    return generateMockAnalysis(resumeText, jobDescription);
  }
}

export async function generateCoverLetter(
  resumeText: string,
  jobDescription: string,
  tone: string,
  personalNote?: string
): Promise<string> {
  const finalTone = tone || "Professional";

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("ANTHROPIC_API_KEY is missing. Generating mock cover letter...");
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate delay
    return `Dear Hiring Team,

I am writing to express my enthusiastic interest in the position open at your company, as described in the job description. Having reviewed the required qualifications, I am confident that my technical expertise, experience, and problem-solving skills align perfectly with the role.

Throughout my career, I have focused on building resilient software solutions and working with modern full-stack web architectures. My resume demonstrates a proven track record of designing performant components, integrating robust APIs, and collaborating with cross-functional teams to deliver projects on tight timelines. ${personalNote ? `Additionally, ${personalNote}.` : ""} I am eager to bring this same dedication and focus to your organization.

I would welcome the opportunity to discuss my qualifications in an interview. Thank you for your time, consideration, and leadership in this space. I look forward to hearing from you.

Sincerely,
[Your Name]`;
  }

  const systemPrompt = `You are an expert career consultant. Write a professional, tailored 3-paragraph cover letter based on the provided Resume, Job Description, Tone, and optional personal note. Do not output anything other than the cover letter content itself. Use placeholders like [Company Name], [Job Title], and [Your Name] where appropriate.`;

  const userPrompt = `RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

TONE: ${finalTone}
${personalNote ? `PERSONAL NOTE: ${personalNote}` : ""}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text.trim();
  } catch (error) {
    console.error("Claude Cover Letter API failed, serving mock:", error);
    return `Dear Hiring Manager,\n\nI am thrilled to apply for this exciting opportunity. Given my technical background, I believe I can make immediate, positive contributions to your development team.\n\nBest regards,\n[Your Name]`;
  }
}

export async function generateWeeklyInsights(summaryText: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return `Your application activity remains consistent! Your current average match score is 78%, which places you in a strong position for technical reviews. We noticed that you have 4 upcoming follow-ups; sending timely updates can increase your interview conversion rate by up to 15%. Focus on tailoring keywords for your target roles.`;
  }

  const systemPrompt = `You are a job search performance coach. Write a brief 3-4 sentence insight summarizing the user's weekly job search progress and offering one strategic piece of advice. Keep it concise, motivational, and actionable.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: "user", content: `Here is my data summary: ${summaryText}` }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API failed: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text.trim();
  } catch (error) {
    return `Your application momentum looks solid. Keep tailoring your resumes and targeting high-match score listings to secure more interviews.`;
  }
}
