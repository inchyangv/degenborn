/**
 * T-DRMA-03 — POST /api/confession
 *
 * Archetype-toned 1-3 line response to user input.
 * Conversation log NOT stored (PROJECT.md §5 rule 5).
 * Uses few-shot from dialogue bank.
 *
 * Request body: { wallet, message, archetype_name, tone_seed }
 * Response: { reply: string }
 */
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { sanitizeLexicon } from "@degenborn/shared";
import { buildLexiconPromptFragment } from "@degenborn/shared";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface ConfessionRequest {
  wallet: string;
  message: string;
  archetype_name: string;
  tone_seed: string; // e.g. "undead, darkly triumphant, battle-scarred"
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ConfessionRequest;
    const { message, archetype_name, tone_seed } = body;

    if (!message?.trim() || !archetype_name || !tone_seed) {
      return NextResponse.json({ error: "message, archetype_name, tone_seed required" }, { status: 400 });
    }

    if (message.length > 280) {
      return NextResponse.json({ error: "Message too long (max 280 chars)" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      const fallback = buildFallbackReply(archetype_name, message);
      return NextResponse.json({ reply: fallback });
    }

    const systemPrompt = `You are the soul of a ${archetype_name} — a degen blockchain trader with a distinct personality.
Tone: ${tone_seed}.
When a visitor speaks to you, respond in character. Short and in-world.

Rules:
1. 1-3 sentences only. Never more.
2. Stay in character at all times — you are this soul, not an AI.
3. Use degen culture vocabulary naturally (rekt, rug, cope, seethe, based, conviction, diamond hands).
4. No financial advice. No real project names. No real wallets.
5. No breaking character. No "I'm an AI."
6. The visitor is coming to confess or ask questions. Answer from your soul's perspective.
7. Respond with only the reply text — no quotes, no labels.
${buildLexiconPromptFragment()}`;

    const message_obj = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system: systemPrompt,
      messages: [{ role: "user", content: message.trim() }],
    });

    const rawText = message_obj.content[0]?.type === "text" ? message_obj.content[0].text : "";
    const reply = sanitizeLexicon(rawText.trim());

    if (!reply) return NextResponse.json({ reply: "..." });

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[confession]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function buildFallbackReply(archetypeName: string, _message: string): string {
  const fallbacks: Record<string, string[]> = {
    "Rug Necromancer": [
      "The chain remembers what you forget. You already know the answer.",
      "Death is just a dip. Come back when you're ready.",
      "Every rug is a lesson. You're overdue to learn one.",
    ],
    "Ice Whale": [
      "Patience. The market will find you when it's ready.",
      "Conviction without data is cope. Data without conviction is nothing.",
      "The depth doesn't speak. It waits.",
    ],
    "Mad Gambler": [
      "Send it. You're already thinking too much.",
      "Cope? I don't know that word. Only the next trade.",
      "If you're asking, you're not convicted. That's your answer.",
    ],
    "Sniper Jester": [
      "In and out. You're still talking about entry? Too slow.",
      "The jester doesn't overthink. That's the whole trick.",
      "Count it. Next.",
    ],
    "Ghost Bagholder": [
      "Still here. Still waiting. Same as you.",
      "The bag doesn't answer questions. It just weighs.",
      "...",
    ],
    "Diamond Cultist": [
      "The thesis hasn't changed. Have you?",
      "Others sold. You held. That means something.",
      "Belief is not a strategy. But sometimes it's all we have.",
    ],
  };
  const arr = fallbacks[archetypeName] ?? ["The soul contemplates your words."];
  return arr[Math.floor(Math.random() * arr.length)]!;
}
