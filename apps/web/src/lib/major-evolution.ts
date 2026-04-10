/**
 * Major Evolution — full character re-render at specific milestones.
 *
 * Triggered only at:
 *  1. 7-day profit surge (prestige crosses 50 → 70+)
 *  2. Survival of 3+ rug events (corruption ≥ 60 + survival_streak ≥ 3)
 *  3. Level-up threshold (level 3 → 5 → 8)
 *  4. Major comeback (scar_count ≥ 3 + recovery into revenge mood)
 *
 * Architecture:
 *  - Uses reference image from previous genesis as style anchor
 *  - Same archetype style guide + evolved modifiers
 *  - On failure: keeps existing base image (never loses character)
 */

import type { CharacterState, ArchetypeId, PersonaDNA } from "@degenborn/shared";
import { createHash } from "crypto";

export interface EvolutionCheck {
  should_rerender: boolean;
  trigger?: string;
  evolved_seed?: number;
}

export interface EvolutionResult {
  url: string;
  seed: number;
  prompt: string;
  trigger: string;
  is_placeholder: boolean;
  previous_url: string;
}

/** Major milestone triggers */
const LEVEL_THRESHOLDS = [3, 5, 8];

/**
 * Determine if a state transition warrants a full re-render.
 */
export function checkEvolutionTrigger(
  stateBefore: CharacterState,
  stateAfter: CharacterState,
): EvolutionCheck {
  // Trigger 1: Level-up to threshold
  for (const threshold of LEVEL_THRESHOLDS) {
    if (stateBefore.level < threshold && stateAfter.level >= threshold) {
      const seed = deriveEvolvedSeed(stateAfter, `level_${threshold}`);
      return { should_rerender: true, trigger: `level_up_${threshold}`, evolved_seed: seed };
    }
  }

  // Trigger 2: Prestige surge (50 → 70+)
  if (stateBefore.prestige < 70 && stateAfter.prestige >= 70) {
    const seed = deriveEvolvedSeed(stateAfter, "prestige_70");
    return { should_rerender: true, trigger: "prestige_surge", evolved_seed: seed };
  }

  // Trigger 3: Corruption + survival (rug necromancer evolution)
  if (
    stateBefore.corruption < 60 &&
    stateAfter.corruption >= 60 &&
    stateAfter.survival_streak >= 3
  ) {
    const seed = deriveEvolvedSeed(stateAfter, "rug_necromancer_ascension");
    return { should_rerender: true, trigger: "rug_ascension", evolved_seed: seed };
  }

  // Trigger 4: Major comeback (scarred → revenge)
  if (
    stateBefore.mood !== "revenge" &&
    stateAfter.mood === "revenge" &&
    stateAfter.scar_count >= 3
  ) {
    const seed = deriveEvolvedSeed(stateAfter, "comeback_revenge");
    return { should_rerender: true, trigger: "scarred_comeback", evolved_seed: seed };
  }

  return { should_rerender: false };
}

/**
 * Build the evolved re-render prompt.
 * References the previous character's core traits for style continuity.
 */
export function buildEvolutionPrompt(
  archetype: ArchetypeId,
  dna: PersonaDNA,
  state: CharacterState,
  trigger: string,
  previousPrompt?: string,
): string {
  const evolutionModifiers: Record<string, string> = {
    level_up_3: "slightly more powerful and scarred, same character but visibly evolved",
    level_up_5: "significantly more imposing, battle-worn armor, intense aura",
    level_up_8: "transcendent, god-like presence, reality warping around them",
    prestige_surge: "adorned with golden artifacts, royal bearing, luminous crown",
    rug_ascension: "half-zombie half-warrior, corruption made beautiful, zombie aura as power",
    scarred_comeback: "covered in healed scars that glow with revenge energy, phoenix-like",
  };

  const evolution = evolutionModifiers[trigger] ?? "visibly stronger and more complex";
  const base = `Portrait of a ${archetype.replace(/_/g, " ")} monster character, ${evolution}`;
  const stateMods = [];

  if (state.corruption >= 60) stateMods.push("corruption manifested as dark energy");
  if (state.prestige >= 70) stateMods.push("royal golden accoutrements");
  if (state.crown_count >= 3) stateMods.push("triple crown achievement marks");
  if (state.scar_count >= 3) stateMods.push("glowing battle scars");

  const fullPrompt =
    `${base}${stateMods.length > 0 ? ", " + stateMods.join(", ") : ""}. ` +
    `Dark fantasy RPG art, detailed portrait, dramatic lighting, consistent with previous design, no text, no watermark`;

  return fullPrompt;
}

/**
 * Attempt a full AI re-render. Falls back to current base image on failure.
 * Failure NEVER removes the existing character.
 */
export async function attemptEvolution(
  archetype: ArchetypeId,
  dna: PersonaDNA,
  state: CharacterState,
  trigger: string,
  previousUrl: string,
  evolvedSeed: number,
): Promise<EvolutionResult> {
  const prompt = buildEvolutionPrompt(archetype, dna, state, trigger);

  if (process.env.OPENAI_API_KEY) {
    try {
      const imageUrl = await callDallE(prompt);
      return {
        url: imageUrl,
        seed: evolvedSeed,
        prompt,
        trigger,
        is_placeholder: false,
        previous_url: previousUrl,
      };
    } catch (err) {
      console.warn("[major-evolution] Re-render failed, keeping existing character:", err);
    }
  }

  // Fallback: keep previous base image, character is preserved
  return {
    url: previousUrl,
    seed: evolvedSeed,
    prompt,
    trigger,
    is_placeholder: true,
    previous_url: previousUrl,
  };
}

async function callDallE(prompt: string): Promise<string> {
  const resp = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",   // HD for major evolution
      style: "vivid",
    }),
  });

  if (!resp.ok) throw new Error(`DALL-E ${resp.status}: ${await resp.text()}`);
  const data = await resp.json() as { data: { url: string }[] };
  const url = data.data[0]?.url;
  if (!url) throw new Error("No URL in DALL-E response");
  return url;
}

function deriveEvolvedSeed(state: CharacterState, suffix: string): number {
  const input = `${state.wallet_address}:${state.level}:${state.prestige}:${suffix}`;
  const hex = createHash("sha256").update(input).digest("hex").slice(0, 8);
  return parseInt(hex, 16);
}
