import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, user.email))
        .limit(1);

      if (existing.length === 0) {
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 14);

        await db.insert(users).values({
          email: user.email,
          name: user.name ?? null,
          subscriptionStatus: "trialing",
          trialEndsAt,
        });
      }

      return true;
    },
    async jwt({ token }) {
      if (token.email) {
        try {
          const dbUser = await db
            .select()
            .from(users)
            .where(eq(users.email, token.email))
            .limit(1);

          if (dbUser.length > 0) {
            token.userId = dbUser[0].id;
            token.subscriptionStatus = dbUser[0].subscriptionStatus;
          }
        } catch {
          // DB query may fail in Edge runtime (middleware).
          // Return token as-is; page-level auth() will retry in Node.js.
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
});
