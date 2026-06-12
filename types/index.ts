export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  plan: "free" | "pro";
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resume {
  id: string;
  userId: string;
  filename: string;
  fileUrl: string;
  extractedText: string;
  createdAt: Date;
}

export interface ImprovementItem {
  issue: string;
  suggestion: string;
  before: string;
  after: string;
}

export interface ResumeAnalysis {
  matchScore: number;
  keywordsScore: number;
  skillsScore: number;
  experienceScore: number;
  formatScore: number;
  missingKeywords: string[];
  strengths: string[];
  improvements: ImprovementItem[];
  atsScore: number;
  atsSuggestions: string;
}

export interface Analysis {
  id: string;
  userId: string;
  resumeId: string;
  jobDescription: string;
  matchScore: number;
  keywordsScore: number;
  skillsScore: number;
  experienceScore: number;
  formatScore: number;
  missingKeywords: string[];
  strengths: string[];
  improvements: ImprovementItem[];
  atsScore: number;
  createdAt: Date;
  resume?: Resume;
}

export type JobStatus = "saved" | "applied" | "interview" | "offer" | "rejected";

export interface Job {
  id: string;
  userId: string;
  company: string;
  role: string;
  jdUrl: string | null;
  jdText: string | null;
  status: JobStatus;
  matchScore: number | null;
  notes: string | null;
  salary: string | null;
  location: string | null;
  appliedAt: Date | null;
  followUpDate: Date | null;
  createdAt: Date;
}

export interface CoverLetter {
  id: string;
  userId: string;
  resumeId: string;
  jobDescription: string;
  tone: "Professional" | "Enthusiastic" | "Concise";
  content: string;
  createdAt: Date;
  resume?: Resume;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  plan: "free" | "pro";
  status: string;
  currentPeriodEnd: Date;
  createdAt: Date;
}

export interface DashboardStats {
  totalApplications: number;
  interviewRate: number;
  avgMatchScore: number;
  activeJobs: number;
  applicationTrend: "up" | "down" | "neutral";
  activeJobsTrend: "up" | "down" | "neutral";
  interviewRateTrend: "up" | "down" | "neutral";
  avgMatchScoreTrend: "up" | "down" | "neutral";
}
