import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "mock-google-id",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "mock-google-secret",
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || "mock-github-id",
      clientSecret: process.env.AUTH_GITHUB_SECRET || "mock-github-secret",
    }),
    Credentials({
      name: "Magic Link",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const emailStr = credentials.email as string;

        // Find or create user to facilitate easy testing & seamless magic link simulation
        let user = await prisma.user.findUnique({
          where: { email: emailStr },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: emailStr,
              name: emailStr.split("@")[0],
              plan: emailStr === "admin@resumeiq.co" ? "admin" : "free",
            },
          });
        }
        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.plan = (user as any).plan || "free";
      }
      if (trigger === "update" && session?.plan) {
        token.plan = session.plan;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).plan = token.plan as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    newUser: "/dashboard",
  },
  secret: process.env.NEXTAUTH_SECRET || "super-secret-key-12345",
});
