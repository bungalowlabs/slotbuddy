import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/db";
import { users, verificationTokens } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      id: "magic-link",
      name: "Magic Link",
      credentials: {
        email: { type: "email" },
        token: { type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const token = credentials?.token as string;
        if (!email || !token) return null;

        // Verify and consume the token
        const [row] = await db
          .select()
          .from(verificationTokens)
          .where(
            and(
              eq(verificationTokens.identifier, email),
              eq(verificationTokens.token, token)
            )
          )
          .limit(1);

        if (!row) return null;
        if (new Date(row.expires) < new Date()) return null;

        // Delete the used token
        await db
          .delete(verificationTokens)
          .where(
            and(
              eq(verificationTokens.identifier, email),
              eq(verificationTokens.token, token)
            )
          );

        return { email };
      },
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

        // Fire-and-forget admin notification
        import("@/lib/email").then(({ sendAdminNotification }) => sendAdminNotification({
          subject: `New signup: ${user.name || user.email}`,
          body: `
            <h2>New User Signed Up</h2>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0 0 8px;"><strong>Name:</strong> ${user.name || "—"}</p>
              <p style="margin: 0 0 8px;"><strong>Email:</strong> ${user.email}</p>
              <p style="margin: 0;"><strong>Trial ends:</strong> ${trialEndsAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
            </div>
          `,
        })).catch(() => {});
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
      }
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
          } else {
            delete token.userId;
            delete token.subscriptionStatus;
          }
        } catch {
          // DB query may fail in Edge runtime (middleware).
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
