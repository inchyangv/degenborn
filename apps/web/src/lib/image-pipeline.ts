import type { PersonaDNA, ArchetypeId, CharacterState } from "@degenborn/shared";
import { createHash } from "crypto";

// ── Genesis image cache ────────────────────────────────────────────────────────
// In-memory: survives same process; cleared on restart.
// For production, persist this to DB or KV store alongside the wallet profile.
const genesisCache = new Map<string, GenesisImageResult>();

function getCacheKey(wallet: string, archetype: ArchetypeId): string {
  return `${wallet.toLowerCase()}:${archetype}`;
}

export interface GenesisImageResult {
  url: string;
  seed: number;
  prompt: string;
  is_placeholder: boolean;
}

const ARCHETYPE_STYLE_GUIDES: Record<ArchetypeId, string> = {
  mad_gambler:
    "a chaotic demon trader with glowing red eyes, torn suit jacket, surrounded by falling coins and burning charts, dark fantasy RPG style, neon accents",
  ice_whale:
    "a massive blue whale spirit wearing a frozen crown, cold ethereal aura, diamond-encrusted armor, glacial dark fantasy style",
  rug_necromancer:
    "a zombie necromancer in torn hooded robes holding a dead token scroll, surrounded by ghost tokens, dark magic glow, undead aesthetic",
  diamond_cultist:
    "a fanatical cultist kneeling before a giant diamond, heavy chains of faith, tattered robes, obsessive glowing eyes, dark dungeon setting",
  sniper_jester:
    "a grinning jester with a targeting reticle eye patch, holding golden daggers, quick and dangerous energy, fool's motley with high-tech upgrades",
  ghost_bagholder:
    "a translucent ghost figure holding heavy phantom bags, haunted expression, chains made of dead tokens, ethereal and sorrowful",
};

/**
 * Generate or retrieve a genesis character image.
 *
 * Priority:
 * 1. Check if cached image exists (by wallet + archetype seed)
 * 2. Try image API (OpenAI DALL-E / FAL.ai / Replicate)
 * 3. Fallback to archetype placeholder SVG
 */
export async function generateGenesisImage(
  wallet: string,
  dna: PersonaDNA,
  archetype: ArchetypeId,
  state?: Partial<CharacterState>,
): Promise<GenesisImageResult> {
  // Deterministic seed from wallet + DNA
  const seedInput = `${wallet.toLowerCase()}:${archetype}:${dna.aggression}:${dna.chaos}`;
  const seedHex = createHash("sha256").update(seedInput).digest("hex").slice(0, 8);
  const seed = parseInt(seedHex, 16);

  // P1-07: Return cached result if available — same wallet+archetype → same image URL
  const cacheKey = getCacheKey(wallet, archetype);
  const cached = genesisCache.get(cacheKey);
  if (cached) return cached;

  const styleGuide = ARCHETYPE_STYLE_GUIDES[archetype];
  const prompt = buildGenesisPrompt(state ?? {}, archetype, styleGuide);

  // Try OpenAI DALL-E 3
  if (process.env.OPENAI_API_KEY) {
    try {
      const url = await generateWithDallE(prompt, seed);
      const result: GenesisImageResult = { url, seed, prompt, is_placeholder: false };
      genesisCache.set(cacheKey, result);
      return result;
    } catch (err) {
      console.warn("[image-pipeline] DALL-E failed:", err);
    }
  }

  // Fallback: return placeholder URL (deterministic — same wallet always gets same placeholder)
  const placeholderUrl = `/archetypes/${archetype}_placeholder.svg`;
  const fallback: GenesisImageResult = { url: placeholderUrl, seed, prompt, is_placeholder: true };
  genesisCache.set(cacheKey, fallback);
  return fallback;
}

function buildGenesisPrompt(
  state: Partial<CharacterState>,
  _archetype: ArchetypeId,
  styleGuide: string,
): string {
  const modifiers: string[] = [styleGuide];

  if ((state.corruption ?? 0) > 50) modifiers.push("glowing zombie eyes");
  if ((state.prestige ?? 0) > 70) modifiers.push("royal golden cloak");
  if ((state.scar_count ?? 0) > 2) modifiers.push("multiple battle scars");
  if ((state.crown_count ?? 0) > 0) modifiers.push("golden crown");
  if ((state.survival_streak ?? 0) > 5) modifiers.push("skull accessories");

  return (
    `Portrait of ${modifiers.join(", ")}, ` +
    `dramatic lighting, detailed digital art, dark background, ` +
    `character card art style, no text, no watermark`
  );
}

async function generateWithDallE(prompt: string, _seed: number): Promise<string> {
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
      quality: "standard",
      style: "vivid",
    }),
  });

  if (!resp.ok) {
    throw new Error(`DALL-E ${resp.status}: ${await resp.text()}`);
  }

  const data = await resp.json() as { data: { url: string }[] };
  const url = data.data[0]?.url;
  if (!url) throw new Error("DALL-E returned no image URL");
  return url;
}
