/**
 * GET /api/yearbook?season=1
 *
 * 1.7 (P2): Yearbook / Class Photo — returns all monsters for the season,
 * formatted as a class photo grid entry.
 *
 * Each monster gets a one-liner "most likely to..." auto-generated from their DNA.
 */
import { NextRequest, NextResponse } from "next/server";
import { ARCHETYPE_PROFILES } from "@degenborn/shared";
import { listProfilesAsync } from "@/lib/profile-store";

export const runtime = "nodejs";

const YEARBOOK_CAPTIONS: Record<string, (dna: { aggression: number; chaos: number; luck: number; survival: number; conviction: number }) => string> = {
  mad_gambler: (d) => d.aggression > 85 ? "most likely to ape $50k into a token named after a food" : "most likely to forget they had a stop loss",
  ice_whale: (d) => d.luck > 80 ? "most likely to accidentally hold a 100x" : "most likely to still be holding in 2030",
  rug_necromancer: (d) => d.survival > 80 ? "most likely to survive a nuclear rug pull" : "most likely to get rugged twice in one day",
  diamond_cultist: (d) => d.conviction > 85 ? "most likely to diamond hands into zero" : "most likely to still be explaining why their bags will pump",
  sniper_jester: (d) => d.luck > 75 ? "most likely to exit perfectly by accident" : "most likely to paper hand a 10x at 2x",
  ghost_bagholder: (d) => d.chaos > 70 ? "most likely to still be alive despite everything" : "most likely to haunt a dead token forever",
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const season = parseInt(searchParams.get("season") ?? "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 100);

  const profiles = await listProfilesAsync(limit);

  const entries = profiles.map((p, idx) => {
    const captionFn = YEARBOOK_CAPTIONS[p.archetype];
    const caption = captionFn ? captionFn(p.dna) : "most likely to trade forever and never learn";
    const profile = ARCHETYPE_PROFILES[p.archetype as keyof typeof ARCHETYPE_PROFILES];

    return {
      rank: idx + 1,
      wallet: p.wallet_address,
      wallet_short: `${p.wallet_address.slice(0, 6)}…${p.wallet_address.slice(-4)}`,
      archetype: p.archetype,
      archetype_name: profile?.name ?? p.archetype,
      yearbook_caption: caption,
      monster_url: `/monster?wallet=${p.wallet_address}`,
      dna_summary: {
        aggression: p.dna.aggression,
        conviction: p.dna.conviction,
        chaos: p.dna.chaos,
        luck: p.dna.luck,
        survival: p.dna.survival,
      },
    };
  });

  return NextResponse.json({
    season,
    title: `DegenBorn Season ${season} Yearbook`,
    subtitle: "Class of the Rugged, the Crowned, and the Somehow Still Standing",
    total_monsters: entries.length,
    entries,
    generated_at: new Date().toISOString(),
  });
}
