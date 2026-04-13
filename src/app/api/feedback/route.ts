import { db } from "@/db";
import { feedback } from "@/db/schema";
import { getResend } from "@/lib/resend";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const FEEDBACK_EMAIL = process.env.FEEDBACK_EMAIL || process.env.ADMIN_EMAIL;
    const FROM_EMAIL = process.env.FROM_EMAIL || "Hello! SlotBuddy <onboarding@resend.dev>";
    const { source, businessId, userEmail, message, rating } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!source) {
      return NextResponse.json({ error: "Source is required" }, { status: 400 });
    }

    await db.insert(feedback).values({
      source,
      businessId: businessId || null,
      userEmail: userEmail?.trim() || null,
      message: message.trim(),
      rating: rating || null,
    });

    // Email notification
    if (FEEDBACK_EMAIL) {
      try {
        const resend = getResend();
        await resend.emails.send({
          from: FROM_EMAIL,
          to: FEEDBACK_EMAIL,
          subject: `New feedback (${source})${rating ? ` - ${rating}/5` : ""}`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
              <h2>New Feedback</h2>
              <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 0 0 8px;"><strong>Source:</strong> ${source}</p>
                ${rating ? `<p style="margin: 0 0 8px;"><strong>Rating:</strong> ${"*".repeat(rating)}${"*".repeat(5 - rating).replace(/\*/g, ".")} (${rating}/5)</p>` : ""}
                ${userEmail ? `<p style="margin: 0 0 8px;"><strong>From:</strong> ${userEmail}</p>` : ""}
                <p style="margin: 0;"><strong>Message:</strong></p>
                <p style="margin: 8px 0 0; white-space: pre-wrap;">${message.trim()}</p>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Feedback email failed:", emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Feedback error:", err);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}
