import { db } from "@/db";
import { verificationTokens } from "@/db/schema";
import { getResend } from "@/lib/resend";
import { randomBytes, createHash } from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, callbackPath } = await req.json();

    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Generate a token
    const raw = randomBytes(32).toString("hex");
    const token = createHash("sha256").update(raw).digest("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store it
    await db.insert(verificationTokens).values({
      identifier: email.trim().toLowerCase(),
      token,
      expires,
    });

    // Build the verification URL
    const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
    const redirect = callbackPath || "/dashboard";
    const verifyUrl = `${baseUrl}/auth/verify?email=${encodeURIComponent(email.trim().toLowerCase())}&token=${token}&redirect=${encodeURIComponent(redirect)}`;

    // Send the email
    const fromEmail = process.env.FROM_EMAIL || "Hello! SlotBuddy <onboarding@resend.dev>";
    const resend = getResend();
    await resend.emails.send({
      from: fromEmail,
      to: email.trim(),
      subject: "Sign in to Hello! SlotBuddy",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #1f2b2e;">Sign in to Hello! SlotBuddy</h2>
          <p>Click the button below to sign in. This link expires in 24 hours.</p>
          <a href="${verifyUrl}" style="display: inline-block; background: #0f766e; color: #fff; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: 500; margin: 16px 0;">
            Sign in
          </a>
          <p style="color: #9ca3af; font-size: 13px; margin-top: 24px;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #9ca3af; font-size: 12px;">Sent by Hello! SlotBuddy</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Magic link error:", err);
    return NextResponse.json({ error: "Failed to send magic link" }, { status: 500 });
  }
}
