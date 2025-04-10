import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { JWT } from "next-auth/jwt";
import { Session, User } from "next-auth";

// Simplified and robust URL handling for NextAuth
const baseUrl =
  process.env.NEXTAUTH_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : null);

// Simple diagnostics for auth setup
if (process.env.NODE_ENV === "production") {
  if (!process.env.NEXTAUTH_URL && !process.env.VERCEL_URL) {
    console.warn("⚠️ No NEXTAUTH_URL or VERCEL_URL set in production!");
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error("❌ Missing Google OAuth credentials in production!");
  }

  if (!process.env.NEXTAUTH_SECRET) {
    console.error("❌ Missing NEXTAUTH_SECRET in production!");
  }

  console.log(`Auth Base URL: ${baseUrl || "[MISSING]"}`);
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      // Simplified authorization for better compatibility
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "online",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    session({
      session,
      token,
      user,
    }: {
      session: Session;
      token?: JWT;
      user?: User;
    }) {
      if (session.user) {
        session.user.id = token?.sub || user?.id || "";
      }
      return session;
    },
    jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Allow relative callback URLs and same-origin callbacks
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: false, // Disable in production to reduce noise
  secret: process.env.NEXTAUTH_SECRET,
};

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth(authOptions);
