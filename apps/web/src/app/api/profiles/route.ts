/**
 * GET /api/profiles
 *
 * Returns analyzed wallet profiles from the in-memory store.
 * Falls back to fixture profiles when the store is empty (fresh server start).
 * Used by gallery, landing page, and leaderboard-style views.
 *
 * Query params:
 *   limit  — max results (default 20)
 *   archetype — filter by archetype slug
 */
import { NextRequest, NextResponse } from "next/server";
import { listProfiles } from "@/lib/profile-store";
import { classify } from "@degenborn/archetype";
import type { PersonaDNA } from "@degenborn/shared";

// Fixture profiles for when profile store is empty (fresh server / no analyses run yet)
const FIXTURE_PROFILES = [
  {
    wallet_address: "0xmad_gambler0000000000000000000000000001",
    dna: { aggression: 85, conviction: 22, chaos: 72, luck: 48, survival: 30 },
    archetype: "mad_gambler",
  },
  {
    wallet_address: "0xrug_necromancer000000000000000000000001",
    dna: { aggression: 45, conviction: 38, chaos: 80, luck: 42, survival: 88 },
    archetype: "rug_necromancer",
  },
  {
    wallet_address: "0xice_whale0000000000000000000000000000001",
    dna: { aggression: 12, conviction: 91, chaos: 8, luck: 85, survival: 70 },
    archetype: "ice_whale",
  },
  {
    wallet_address: "0xdiamond_cultist00000000000000000000001",
    dna: { aggression: 20, conviction: 88, chaos: 30, luck: 18, survival: 82 },
    archetype: "diamond_cultist",
  },
  {
    wallet_address: "0xsniper_jester000000000000000000000001",
    dna: { aggression: 78, conviction: 15, chaos: 45, luck: 90, survival: 40 },
    archetype: "sniper_jester",
  },
  {
    wallet_address: "0xghost_bagholder00000000000000000000001",
    dna: { aggression: 18, conviction: 75, chaos: 55, luck: 25, survival: 20 },
    archetype: "ghost_bagholder",
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);
  const archetypeFilter = searchParams.get("archetype");

  const stored = listProfiles();

  // Use stored profiles if available, otherwise return fixture profiles
  const source = stored.length > 0 ? stored : FIXTURE_PROFILES.map((f) => ({
    wallet_address: f.wallet_address,
    dna: f.dna as PersonaDNA,
    archetype: f.archetype,
    archetype_confidence: 1,
    last_scored_at: 0,
  }));

  let results = source;
  if (archetypeFilter) {
    results = results.filter((p) => p.archetype === archetypeFilter);
  }

  return NextResponse.json({
    profiles: results.slice(0, limit).map((p) => ({
      wallet_address: p.wallet_address,
      wallet_short: `${p.wallet_address.slice(0, 6)}...${p.wallet_address.slice(-4)}`,
      archetype: p.archetype,
      dna: p.dna,
      last_scored_at: p.last_scored_at,
      is_fixture: p.last_scored_at === 0,
    })),
    total: results.length,
    from_store: stored.length > 0,
  });
}
