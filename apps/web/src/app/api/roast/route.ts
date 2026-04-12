/**
 * T-ROAST-01 — POST /api/roast
 *
 * Calls Claude to generate a 3-paragraph brutal roast of the wallet's DNA/state.
 * Enforces: lexicon filter, daily seed determinism, output schema.
 *
 * Request body: { wallet, dna, state, archetype }
 * Response: { paragraph1, paragraph2, paragraph3, cached: boolean }
 */
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { PersonaDNA, CharacterState, ArchetypeResult } from "@degenborn/shared";
import {
  buildRoastSystemPrompt,
  buildRoastUserPrompt,
  buildDailyRoastSeed,
  sanitizeLexicon,
} from "@degenborn/shared";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// In-memory daily cache: dailySeed → RoastOutput
const roastCache = new Map<string, { paragraph1: string; paragraph2: string; paragraph3: string }>();

interface RoastRequest {
  wallet: string;
  dna: PersonaDNA;
  state: CharacterState;
  archetype: ArchetypeResult;
  date?: string; // YYYY-MM-DD, defaults to today
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RoastRequest;
    const { wallet, dna, state, archetype, date } = body;

    if (!wallet || !dna || !state || !archetype) {
      return NextResponse.json(
        { error: "wallet, dna, state, archetype required" },
        { status: 400 },
      );
    }

    // Daily cache key — same wallet on same day gets same roast
    const cacheKey = buildDailyRoastSeed(wallet, date);
    const cached = roastCache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      // Fallback for dev without API key
      const fallback = buildFallbackRoast(archetype.profile.name, dna, state);
      roastCache.set(cacheKey, fallback);
      return NextResponse.json({ ...fallback, cached: false });
    }

    const systemPrompt = buildRoastSystemPrompt();
    const userPrompt = buildRoastUserPrompt({
      archetype_name: archetype.profile.name,
      archetype_tagline: archetype.profile.tagline,
      aggression: Math.round(dna.aggression),
      conviction: Math.round(dna.conviction),
      chaos: Math.round(dna.chaos),
      luck: Math.round(dna.luck),
      survival: Math.round(dna.survival),
      scar_count: state.scar_count,
      crown_count: state.crown_count,
      corruption: Math.round(state.corruption),
      prestige: Math.round(state.prestige),
      mood: state.mood,
      level: state.level,
    });

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      temperature: 0, // deterministic output
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const rawText =
      message.content[0]?.type === "text" ? message.content[0].text : "";

    // Parse JSON from response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("LLM did not return valid JSON");
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      paragraph1?: string;
      paragraph2?: string;
      paragraph3?: string;
    };

    const result = {
      paragraph1: sanitizeLexicon(parsed.paragraph1 ?? ""),
      paragraph2: sanitizeLexicon(parsed.paragraph2 ?? ""),
      paragraph3: sanitizeLexicon(parsed.paragraph3 ?? ""),
    };

    // Validate all 3 paragraphs are non-empty
    if (!result.paragraph1 || !result.paragraph2 || !result.paragraph3) {
      throw new Error("LLM output missing one or more paragraphs");
    }

    roastCache.set(cacheKey, result);
    return NextResponse.json({ ...result, cached: false });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[roast]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Static fallback when ANTHROPIC_API_KEY is not set (dev mode). */
function buildFallbackRoast(
  archetypeName: string,
  dna: PersonaDNA,
  state: CharacterState,
): { paragraph1: string; paragraph2: string; paragraph3: string } {
  return {
    paragraph1: `Let's start with the data, because the data doesn't lie. You're a ${archetypeName} with ${Math.round(dna.chaos)}/100 chaos and ${Math.round(dna.luck)}/100 luck — that's not a trading strategy, that's a slot machine with extra steps. ${state.scar_count} scars. You didn't earn those by winning.`,
    paragraph2: `The average degen has at least some conviction. Yours sits at ${Math.round(dna.conviction)}/100 — which explains why you keep changing your mind mid-trade like you're picking a restaurant. Meanwhile survival is ${Math.round(dna.survival)}/100. You're technically alive. Technically.`,
    paragraph3: `Level ${state.level}. Corruption at ${Math.round(state.corruption)}. Mood: ${state.mood}. The numbers speak and they are not saying kind things. You can cope, you can seethe, you can close the tab — but when you come back tomorrow, the numbers will still be there. Ngmi.`,
  };
}
