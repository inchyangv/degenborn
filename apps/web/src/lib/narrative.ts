import type { PersonaDNA, ArchetypeResult } from "@degenborn/shared";

export interface NarrativeOutput {
  tagline: string;          // ≤ 120 chars, shown big on screen
  long_description: string; // 2–3 sentences for NFT metadata
  caption: string;          // 1–2 lines, meme tone, share card copy
  tone: string;             // mood hint (not displayed)
}

/**
 * Generate narrative copy for a wallet's archetype.
 *
 * Uses OpenAI if available; falls back to deterministic template copy.
 * Never contains investment advice. Output is always structured JSON.
 */
export async function generateNarrative(
  dna: PersonaDNA,
  archetype: ArchetypeResult,
): Promise<NarrativeOutput> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      return await generateWithLLM(dna, archetype, apiKey);
    } catch (err) {
      console.warn("[narrative] LLM failed, using template:", err);
    }
  }
  return generateFromTemplate(dna, archetype);
}

async function generateWithLLM(
  dna: PersonaDNA,
  archetype: ArchetypeResult,
  apiKey: string,
): Promise<NarrativeOutput> {
  const systemPrompt = `You are a dark fantasy character narrator for a crypto trading persona system.
Generate narrative copy for a wallet's monster character.

Rules:
- NEVER give investment advice
- NO predictions about tokens or market
- Keep tagline ≤ 120 characters
- Tone: ${archetype.profile.tone_seed}
- The character is based on their trading behavior — it is fiction, not financial advice
- Use vivid monster/RPG language

Return ONLY valid JSON matching this schema:
{
  "tagline": "string ≤120 chars",
  "long_description": "2-3 sentences",
  "caption": "1-2 lines, meme tone",
  "tone": "string mood hint"
}`;

  const userPrompt = `Archetype: ${archetype.profile.name}
DNA: Aggression ${dna.aggression}, Conviction ${dna.conviction}, Chaos ${dna.chaos}, Luck ${dna.luck}, Survival ${dna.survival}
Archetype description: ${archetype.profile.description}`;

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.85,
      max_tokens: 400,
      response_format: { type: "json_object" },
    }),
  });

  if (!resp.ok) throw new Error(`OpenAI ${resp.status}`);
  const data = await resp.json() as { choices: { message: { content: string } }[] };
  const raw = data.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw);

  // Sanitize — never expose financial advice
  const banList = ["buy", "sell", "invest", "pump", "moon", "guaranteed"];
  for (const field of ["tagline", "long_description", "caption"] as const) {
    for (const banned of banList) {
      if (typeof parsed[field] === "string") {
        parsed[field] = parsed[field].replace(new RegExp(banned, "gi"), "***");
      }
    }
  }

  return parsed as NarrativeOutput;
}

/** Deterministic template fallback — no LLM required */
function generateFromTemplate(dna: PersonaDNA, archetype: ArchetypeResult): NarrativeOutput {
  const templates: Record<string, NarrativeOutput> = {
    mad_gambler: {
      tagline: `Aggression ${dna.aggression}. Chaos ${dna.chaos}. You never slow down.`,
      long_description: `The Mad Gambler never learned the word "wait." With aggression at ${dna.aggression} and chaos at ${dna.chaos}, every candle is a trigger. The losses are just the price of staying in the game.`,
      caption: `${dna.aggression} aggression. still going. 🔥`,
      tone: "frenetic",
    },
    ice_whale: {
      tagline: `Conviction ${dna.conviction}. You waited. You won.`,
      long_description: `Cold, patient, inevitable. The Ice Whale enters when others panic and exits when others celebrate. Conviction at ${dna.conviction} doesn't need luck — it has time.`,
      caption: `conviction ${dna.conviction}. luck ${dna.luck}. patience is the trade. 🧊`,
      tone: "stoic",
    },
    rug_necromancer: {
      tagline: `Rugged ${dna.chaos > 50 ? "many times" : "once too many"}. Still here. Chaos ${dna.chaos}, Survival ${dna.survival}.`,
      long_description: `The Rug Necromancer has seen tokens die and found profit in the aftermath. Chaos ${dna.chaos}, survival ${dna.survival} — the undead don't fear rugs. They feed on them.`,
      caption: `rugged again. came back again. survival ${dna.survival}. 💀`,
      tone: "undead",
    },
    diamond_cultist: {
      tagline: `Conviction ${dna.conviction}. Luck ${dna.luck}. The bags are heavy. The belief is heavier.`,
      long_description: `The Diamond Cultist holds when others sell, holds when the chart is red, holds when the team disappears. Conviction ${dna.conviction} is a religion. The P&L is irrelevant to the faithful.`,
      caption: `still holding. conviction ${dna.conviction}. it will pump. 💎`,
      tone: "obsessive",
    },
    sniper_jester: {
      tagline: `In. Out. ${dna.luck}% luck. ${dna.aggression}% aggression. Count it.`,
      long_description: `The Sniper Jester dances in and out before the music stops. Aggression ${dna.aggression} means fast entries. Luck ${dna.luck} means they hit. It shouldn't work — but it does.`,
      caption: `entered. exited. profitable. luck ${dna.luck}. 🎯`,
      tone: "cocky",
    },
    ghost_bagholder: {
      tagline: `Conviction ${dna.conviction}. Survival ${dna.survival}. Still waiting for the pump.`,
      long_description: `The Ghost Bagholder believed in the project before it died. Conviction ${dna.conviction} means the bags are still there. Survival ${dna.survival} means so are they — barely.`,
      caption: `bags from 2024. still holding. definitely fine. 👻`,
      tone: "haunted",
    },
  };

  return templates[archetype.archetype] ?? {
    tagline: `${archetype.profile.name} — Aggression ${dna.aggression}, Survival ${dna.survival}`,
    long_description: archetype.profile.description,
    caption: `${archetype.profile.tagline} [${dna.aggression}/${dna.conviction}/${dna.chaos}]`,
    tone: archetype.profile.tone_seed,
  };
}
