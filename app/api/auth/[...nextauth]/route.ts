import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { JWT } from "next-auth/jwt";
import { Session, User } from "next-auth";
import type { DefaultSession } from "next-auth";

// Determine the base URL for this environment
const getBaseUrl = () => {
  // First priority: Use NEXTAUTH_URL if explicitly set
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  // For production: Use VERCEL_URL for Vercel deployments or throw an error
  if (process.env.NODE_ENV === "production") {
    const vercelUrl = process.env.VERCEL_URL;

    // For Vercel deployments
    if (vercelUrl) {
      return `https://${vercelUrl}`;
    }

    // If no production URL is set, log warning
    console.warn(
      "No NEXTAUTH_URL or VERCEL_URL set in production environment. " +
        "OAuth redirects may not work properly."
    );

    // Return null to let NextAuth use its fallback, but log warning
    return null;
  }

  // Development fallback
  return "http://localhost:3000";
};

// Get the base URL
const baseUrl = getBaseUrl();

// Log environment info to help with debugging (no secrets)
console.log(`NextAuth Environment: ${process.env.NODE_ENV}`);
console.log(`Base URL resolved to: ${baseUrl || "Using NextAuth default"}`);
console.log(`VERCEL_URL exists: ${!!process.env.VERCEL_URL}`);
console.log(`NEXTAUTH_URL exists: ${!!process.env.NEXTAUTH_URL}`);
console.log(`Google OAuth ClientID exists: ${!!process.env.GOOGLE_CLIENT_ID}`);

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
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
      // Log redirect attempts to help debug
      console.log(`NextAuth Redirect - URL: ${url}, BaseURL: ${baseUrl}`);

      // Allows relative callback URLs
      if (url.startsWith("/")) {
        const redirectUrl = `${baseUrl}${url}`;
        console.log(`Redirecting to: ${redirectUrl}`);
        return redirectUrl;
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        console.log(`Redirecting to same origin: ${url}`);
        return url;
      }

      console.log(`Fallback redirect to baseUrl: ${baseUrl}`);
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? `__Secure-next-auth.session-token`
          : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name:
        process.env.NODE_ENV === "production"
          ? `__Secure-next-auth.callback-url`
          : `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name:
        process.env.NODE_ENV === "production"
          ? `__Host-next-auth.csrf-token`
          : `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    pkceCodeVerifier: {
      name:
        process.env.NODE_ENV === "production"
          ? `__Secure-next-auth.pkce.code_verifier`
          : `next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 10, // 10 minutes in seconds
      },
    },
  },
  debug:
    process.env.NODE_ENV === "development" ||
    process.env.NEXTAUTH_DEBUG === "true",
  secret: process.env.NEXTAUTH_SECRET,
  logger: {
    error(error: Error) {
      console.error("NextAuth Error:", error.name, error.message);
    },
    warn(warning: string) {
      console.warn("NextAuth Warning:", warning);
    },
    debug(message: string, metadata?: Record<string, unknown>) {
      console.log("NextAuth Debug:", message, metadata || "");
    },
  },
  // Explicitly set URL if we have one to override any default
  ...(baseUrl ? { url: baseUrl } : {}),
};

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth(authOptions);
