/**
 * POST /api/curse
 *
 * Cursed Mode — Roast Battle: two wallets enter, one (or none) leaves with dignity.
 * Calls Claude to generate a savage head-to-head roast and declare a winner.
 *
 * Request body: { walletA, walletB, dnaA, dnaB, archetypeA, archetypeB }
 * Response: {
 *   roast_a: string,      // 2-sentence savage roast of wallet A
 *   roast_b: string,      // 2-sentence savage roast of wallet B
 *   verdict: string,      // comparative verdict paragraph
 *   winner: "A" | "B" | "BOTH_LOST",
 *   winner_reason: string,
 * }
 */
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { PersonaDNA, ArchetypeResult } from "@degenborn/shared";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DEGEN_VOCAB = [
  "ngmi", "wagmi", "ape", "jeet", "exit liq", "rug", "bag", "degen",
  "fumbled the bag", "paper hands", "diamond hands", "fomo",
];

function buildCursePrompt(
  walletA: string, dnaA: PersonaDNA, archetypeA: ArchetypeResult,
  walletB: string, dnaB: PersonaDNA, archetypeB: ArchetypeResult,
): string {
  return `You are DegenBorn's Cursed Oracle — a savage, unhinged crypto spirit who roasts wallets with zero mercy.

Two wallets enter. You must:
1. Roast WALLET A in 2 savage sentences. Use degen vocab.
2. Roast WALLET B in 2 savage sentences. Use degen vocab.
3. Compare them in 1-2 sentences and declare a winner, or declare BOTH_LOST if both are equally pathetic.
4. Respond ONLY as JSON with this exact shape:
   { "roast_a": "...", "roast_b": "...", "verdict": "...", "winner": "A" | "B" | "BOTH_LOST", "winner_reason": "..." }

Degen vocab to weave in: ${DEGEN_VOCAB.slice(0, 6).join(", ")}.

WALLET A (${walletA.slice(0, 8)}...):
  Archetype: ${archetypeA.archetype} — ${archetypeA.profile?.tagline ?? ""}
  Aggression ${dnaA.aggression} | Conviction ${dnaA.conviction} | Chaos ${dnaA.chaos} | Luck ${dnaA.luck} | Survival ${dnaA.survival}

WALLET B (${walletB.slice(0, 8)}...):
  Archetype: ${archetypeB.archetype} — ${archetypeB.profile?.tagline ?? ""}
  Aggression ${dnaB.aggression} | Conviction ${dnaB.conviction} | Chaos ${dnaB.chaos} | Luck ${dnaB.luck} | Survival ${dnaB.survival}

Be savage. Be specific. Use the DNA stats to roast. Go.`;
}

interface CurseRequest {
  walletA: string;
  walletB: string;
  dnaA: PersonaDNA;
  dnaB: PersonaDNA;
  archetypeA: ArchetypeResult;
  archetypeB: ArchetypeResult;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as CurseRequest;
    const { walletA, walletB, dnaA, dnaB, archetypeA, archetypeB } = body;

    if (!walletA || !walletB || !dnaA || !dnaB || !archetypeA || !archetypeB) {
      return NextResponse.json({ error: "walletA, walletB, dnaA, dnaB, archetypeA, archetypeB required" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      // Fallback roast when no API key
      const fallback = deterministicCurse(walletA, dnaA, archetypeA, walletB, dnaB, archetypeB);
      return NextResponse.json(fallback);
    }

    const prompt = buildCursePrompt(walletA, dnaA, archetypeA, walletB, dnaB, archetypeB);

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const parsed = JSON.parse(jsonMatch[0]) as {
      roast_a: string; roast_b: string; verdict: string;
      winner: "A" | "B" | "BOTH_LOST"; winner_reason: string;
    };

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[curse]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function deterministicCurse(
  walletA: string, dnaA: PersonaDNA, archetypeA: ArchetypeResult,
  walletB: string, dnaB: PersonaDNA, archetypeB: ArchetypeResult,
) {
  const scoreA = dnaA.luck + dnaA.survival - dnaA.chaos * 0.5;
  const scoreB = dnaB.luck + dnaB.survival - dnaB.chaos * 0.5;
  const winner = Math.abs(scoreA - scoreB) < 5 ? "BOTH_LOST" : scoreA > scoreB ? "A" : "B";

  const roasts: Record<string, string[]> = {
    mad_gambler: ["This ${addr} apes into anything with a pulse and wonders why they're ngmi.", "Aggression ${agg}/100 and brain cells 3/100 — classic fumbled-the-bag energy."],
    ice_whale: ["${addr} holds so long they probably married their bags. Conviction ${conv}/100, sense 0/100.", "Still here. Still holding. Still ngmi. Diamond hands, paper brain."],
    rug_necromancer: ["${addr} collects rugs like it's a hobby. Chaos ${chaos}/100, self-awareness 0/100.", "Every token they touch dies. They somehow survive. Cockroach energy."],
    diamond_cultist: ["${addr} would hold through nuclear winter. Luck ${luck}/100, touch grass never.", "Conviction ${conv}/100 — that's not faith, that's a cope. Exit liq doesn't exist in their worldview."],
    sniper_jester: ["${addr} fancies themselves a sniper but mostly hits their own foot. Luck ${luck}/100.", "In and out faster than their attention span. Jeet mentality but make it art."],
    ghost_bagholder: ["${addr} hasn't closed a position since 2021. Ghost mode isn't a mood, it's a prison.", "Survival ${surv}/100 only because corpses don't quit. Still holding. God help them."],
  };

  const getTemplate = (archetype: string, data: PersonaDNA, addr: string) => {
    const lines = roasts[archetype] ?? roasts.mad_gambler;
    return lines[0]
      .replace("${addr}", addr.slice(0, 8) + "…")
      .replace("${agg}", String(data.aggression))
      .replace("${conv}", String(data.conviction))
      .replace("${chaos}", String(data.chaos))
      .replace("${luck}", String(data.luck))
      .replace("${surv}", String(data.survival))
      + " " + lines[1]
      .replace("${addr}", addr.slice(0, 8) + "…")
      .replace("${agg}", String(data.aggression))
      .replace("${conv}", String(data.conviction))
      .replace("${chaos}", String(data.chaos))
      .replace("${luck}", String(data.luck))
      .replace("${surv}", String(data.survival));
  };

  return {
    roast_a: getTemplate(archetypeA.archetype, dnaA, walletA),
    roast_b: getTemplate(archetypeB.archetype, dnaB, walletB),
    verdict: winner === "BOTH_LOST"
      ? "Both of these wallets are a cry for help. The market didn't rug them — they rugged themselves."
      : `${winner === "A" ? walletA.slice(0, 8) : walletB.slice(0, 8)}… edges out — not because they're good, but because the other one is catastrophically worse.`,
    winner,
    winner_reason: winner === "BOTH_LOST"
      ? "equally disastrous"
      : `luck+survival advantage of ${Math.abs(scoreA - scoreB).toFixed(0)} points`,
  };
}
