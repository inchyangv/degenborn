/**
 * T-DRMA-02 — POST /api/origin
 *
 * Generates a 3-paragraph first-person origin story for a wallet's soul.
 * Cached indefinitely per wallet (same wallet → same story).
 *
 * Request body: { wallet, dna, state, archetype }
 * Response: { paragraph1, paragraph2, paragraph3, cached: boolean }
 */
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { PersonaDNA, CharacterState, ArchetypeResult } from "@degenborn/shared";
import {
  buildOriginSystemPrompt,
  buildOriginUserPrompt,
  buildOriginCacheKey,
  sanitizeLexicon,
} from "@degenborn/shared";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// In-memory cache: same wallet → same story forever (within process)
const originCache = new Map<string, { paragraph1: string; paragraph2: string; paragraph3: string }>();

interface OriginRequest {
  wallet: string;
  dna: PersonaDNA;
  state: CharacterState;
  archetype: ArchetypeResult;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OriginRequest;
    const { wallet, dna, state, archetype } = body;

    if (!wallet || !dna || !state || !archetype) {
      return NextResponse.json(
        { error: "wallet, dna, state, archetype required" },
        { status: 400 },
      );
    }

    const cacheKey = buildOriginCacheKey(wallet);
    const cached = originCache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      const fallback = buildFallbackOrigin(archetype, dna, state);
      originCache.set(cacheKey, fallback);
      return NextResponse.json({ ...fallback, cached: false });
    }

    const systemPrompt = buildOriginSystemPrompt();
    const userPrompt = buildOriginUserPrompt({
      archetype_name: archetype.profile.name,
      archetype_tagline: archetype.profile.tagline,
      archetype_tone: archetype.profile.tone_seed,
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
      max_tokens: 600,
      temperature: 0,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const rawText =
      message.content[0]?.type === "text" ? message.content[0].text : "";

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("LLM did not return valid JSON");

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

    if (!result.paragraph1 || !result.paragraph2 || !result.paragraph3) {
      throw new Error("LLM output missing one or more paragraphs");
    }

    originCache.set(cacheKey, result);
    return NextResponse.json({ ...result, cached: false });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[origin]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function buildFallbackOrigin(
  archetype: ArchetypeResult,
  dna: PersonaDNA,
  state: CharacterState,
): { paragraph1: string; paragraph2: string; paragraph3: string } {
  return {
    paragraph1: `I came to the chain the same way everyone does — believing I saw something others missed. The first buys were clean. The logic was sound. I had ${Math.round(dna.conviction)}/100 conviction and the kind of confidence that only forms before the first real loss. I was a ${archetype.profile.name} before I knew what that meant.`,
    paragraph2: `Then the rugs came. ${state.scar_count > 0 ? `${state.scar_count} scar${state.scar_count > 1 ? "s" : ""} now mark where I stood when the chart went to zero.` : "The close calls were enough."} Corruption at ${Math.round(state.corruption)} tells the rest. I held things I shouldn't have held. I believed in things that didn't deserve belief. That's the chaos — ${Math.round(dna.chaos)}/100 and still rising.`,
    paragraph3: `What remains is this: level ${state.level}, mood ${state.mood}, and a survival score of ${Math.round(dna.survival)}. I didn't come back the same. I came back as a ${archetype.profile.name}. "${archetype.profile.tagline}" — not a motto I chose, but one the chain assigned. The scars are the receipts. The crowns are the proof. And I'm still here.`,
  };
}
