import { NextRequest, NextResponse } from "next/server";
import type { PersonaDNA, ArchetypeResult, CharacterState } from "@degenborn/shared";
import { getAppUrl } from "@/lib/runtime-env";
import { getProfileStore } from "@/lib/profile-store";

interface ShareRequest {
  wallet: string;
  dna: PersonaDNA;
  archetype: ArchetypeResult;
  state: CharacterState;
}

/**
 * Generate share card metadata (caption + card data).
 * Does NOT auto-post anywhere — user explicitly triggers sharing.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ShareRequest;
    const { wallet, dna, archetype, state } = body;

    if (!wallet || !dna || !archetype || !state) {
      return NextResponse.json({ error: "wallet, dna, archetype, state required" }, { status: 400 });
    }

    // Generate meme caption
    const caption = generateShareCaption(dna, archetype, state);

    // T3-03: Use real genesis image if available, fall back to placeholder
    const storedProfile = getProfileStore(wallet.toLowerCase());
    const characterImageUrl =
      storedProfile?.image_url ??
      `/archetypes/${archetype.archetype}_placeholder.svg`;

    // Card metadata for OG/Twitter cards
    const appUrl = getAppUrl();
    const cardMeta = {
      title: `${archetype.profile.name} — DegenBorn Soul Core`,
      description: caption,
      image_url: characterImageUrl,
      card_url: `${appUrl}/monster?wallet=${wallet.toLowerCase()}`,
    };

    // Detect spam-like patterns (auto-post guard)
    const SPAM_PATTERNS = [/buy now/i, /guaranteed/i, /100x/i, /pump/i];
    for (const pattern of SPAM_PATTERNS) {
      if (pattern.test(caption)) {
        return NextResponse.json({ error: "caption contains prohibited content" }, { status: 422 });
      }
    }

    return NextResponse.json({ caption, card_meta: cardMeta, auto_posted: false });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function generateShareCaption(
  dna: PersonaDNA,
  archetype: ArchetypeResult,
  state: CharacterState,
): string {
  const templates: Record<string, string> = {
    mad_gambler: `I'm a ${archetype.profile.name} on @DegenBorn. ${dna.aggression} aggression. ${dna.chaos} chaos. Lv.${state.level}. built on four.meme`,
    ice_whale: `${archetype.profile.name} on @DegenBorn. Conviction ${dna.conviction}. Patience pays. Lv.${state.level}. built on four.meme`,
    rug_necromancer: `${archetype.profile.name} on @DegenBorn. Rugged ${Math.floor(dna.chaos / 25)}x. Still here. Survival ${dna.survival}. built on four.meme`,
    diamond_cultist: `${archetype.profile.name} on @DegenBorn. Conviction ${dna.conviction}. The bags don't move. Lv.${state.level}. built on four.meme`,
    sniper_jester: `${archetype.profile.name} on @DegenBorn. Aggression ${dna.aggression}. Luck ${dna.luck}. In and out. built on four.meme`,
    ghost_bagholder: `${archetype.profile.name} on @DegenBorn. Conviction ${dna.conviction}. Still holding. Lv.${state.level}. built on four.meme`,
  };

  return (
    templates[archetype.archetype] ??
    `${archetype.profile.name} on @DegenBorn · ${dna.aggression}/${dna.conviction}/${dna.chaos}/${dna.luck}/${dna.survival} · four.meme`
  );
}
