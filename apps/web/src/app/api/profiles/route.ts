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
import { listProfilesAsync } from "@/lib/profile-store";
import type { PersonaDNA } from "@degenborn/shared";
import { DEMO_WALLETS } from "@/lib/demo-wallets";

// Fixture profiles for when profile store is empty (fresh server / no analyses run yet)
const FIXTURE_PROFILES = [
  {
    wallet_address: DEMO_WALLETS.mad_gambler,
    dna: { aggression: 85, conviction: 22, chaos: 72, luck: 48, survival: 30 },
    archetype: "mad_gambler",
  },
  {
    wallet_address: DEMO_WALLETS.rug_necromancer,
    dna: { aggression: 45, conviction: 38, chaos: 80, luck: 42, survival: 88 },
    archetype: "rug_necromancer",
  },
  {
    wallet_address: DEMO_WALLETS.ice_whale,
    dna: { aggression: 12, conviction: 91, chaos: 8, luck: 85, survival: 70 },
    archetype: "ice_whale",
  },
  {
    wallet_address: DEMO_WALLETS.diamond_cultist,
    dna: { aggression: 20, conviction: 88, chaos: 30, luck: 18, survival: 82 },
    archetype: "diamond_cultist",
  },
  {
    wallet_address: DEMO_WALLETS.sniper_jester,
    dna: { aggression: 78, conviction: 15, chaos: 45, luck: 90, survival: 40 },
    archetype: "sniper_jester",
  },
  {
    wallet_address: DEMO_WALLETS.ghost_bagholder,
    dna: { aggression: 18, conviction: 75, chaos: 55, luck: 25, survival: 20 },
    archetype: "ghost_bagholder",
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);
  const archetypeFilter = searchParams.get("archetype");

  const stored = await listProfilesAsync(limit);

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
