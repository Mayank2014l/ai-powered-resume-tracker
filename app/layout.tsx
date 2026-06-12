import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/shared/auth-provider";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "ResumeIQ | AI-Powered Resume & Job Application Tracker",
  description: "Optimize your resume with AI, track your job applications in real time, generate tailored cover letters, and maximize your chances of landing interviews.",
  metadataBase: new URL("https://resumeiq-saas.vercel.app"),
  openGraph: {
    title: "ResumeIQ | AI-Powered Resume & Job Application Tracker",
    description: "Optimize your resume with AI, track job applications, and get hired faster.",
    url: "https://resumeiq-saas.vercel.app",
    siteName: "ResumeIQ",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ResumeIQ Dashboard Mockup",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeIQ | AI-Powered Resume & Job Application Tracker",
    description: "Optimize your resume with AI, track job applications, and get hired faster.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <ThemeProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
