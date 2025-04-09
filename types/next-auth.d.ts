import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extending the built-in session types
   */
  interface Session {
    user: {
      /** The user's id */
      id: string;
    } & DefaultSession["user"];
  }
}
