import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate-limit by user id to stop accidental loops from burning tokens
  if (!rateLimit(`ai-desc:${session.user.id}`)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a moment." },
      { status: 429 }
    );
  }

  const { name, durationMinutes, field } = await req.json();
  const targetField: "title" | "description" = field === "title" ? "title" : "description";

  if (!name?.trim()) {
    return NextResponse.json({ error: "Service name is required" }, { status: 400 });
  }

  // Pull business name/description for context
  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.userId, session.user.id))
    .limit(1);

  if (!business) {
    return NextResponse.json({ error: "No business found" }, { status: 404 });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

    const prompt = targetField === "title"
      ? `Rewrite this service name to be clear, professional, and customer-friendly. Keep it short (2-5 words). No emojis, no quotes around the answer. Just the title text.

Business: ${business.name}${business.description ? ` — ${business.description}` : ""}
Current service name: ${name.trim()}`
      : `Write a short, friendly customer-facing description for this service on a booking page. 1-2 sentences, max 180 characters. No emojis, no marketing fluff, no quotes around the answer. Just the description text.

Business: ${business.name}${business.description ? ` — ${business.description}` : ""}
Service name: ${name.trim()}${durationMinutes ? `\nDuration: ${durationMinutes} minutes` : ""}`;

    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: targetField === "title" ? 30 : 120,
      messages: [{ role: "user", content: prompt }],
    });

    const block = msg.content[0];
    const result =
      block && block.type === "text" ? block.text.trim().replace(/^["']|["']$/g, "") : "";

    if (!result) {
      return NextResponse.json({ error: "Empty response" }, { status: 502 });
    }

    return NextResponse.json({ [targetField]: result });
  } catch (err) {
    console.error("AI description error:", err);
    return NextResponse.json(
      { error: "Failed to generate description" },
      { status: 500 }
    );
  }
}
