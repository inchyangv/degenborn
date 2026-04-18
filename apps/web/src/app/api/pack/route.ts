/**
 * GET /api/pack?token=0x...
 *
 * 2.6: Pack / Cult Formation — returns monsters grouped by shared token holding.
 * All profiles that hold the same Four.meme token form a "Pack".
 *
 * Response:
 * {
 *   token_address: string,
 *   pack_name: string,          // "Pack of $SYMBOL" or "Cult of 0x..."
 *   member_count: number,
 *   members: Array<{
 *     wallet: string,
 *     archetype: string,
 *     archetype_name: string,
 *     dna_summary: { aggression, conviction, chaos, luck, survival },
 *     mood: string,
 *   }>,
 *   avg_dna: { aggression, conviction, chaos, luck, survival },
 *   pack_mood: string,           // dominant mood across members
 *   is_demo: boolean,
 * }
 */
import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { ARCHETYPE_PROFILES } from "@degenborn/shared";
import type { WalletProfile } from "@/lib/profile-store";
import { listProfilesAsync } from "@/lib/profile-store";

export const runtime = "nodejs";

function hashStr(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h;
}

function avgDNA(profiles: WalletProfile[]) {
  if (profiles.length === 0) return { aggression: 50, conviction: 50, chaos: 50, luck: 50, survival: 50 };
  const sum = profiles.reduce(
    (acc, p) => ({
      aggression: acc.aggression + p.dna.aggression,
      conviction: acc.conviction + p.dna.conviction,
      chaos: acc.chaos + p.dna.chaos,
      luck: acc.luck + p.dna.luck,
      survival: acc.survival + p.dna.survival,
    }),
    { aggression: 0, conviction: 0, chaos: 0, luck: 0, survival: 0 },
  );
  const n = profiles.length;
  return {
    aggression: Math.round(sum.aggression / n),
    conviction: Math.round(sum.conviction / n),
    chaos: Math.round(sum.chaos / n),
    luck: Math.round(sum.luck / n),
    survival: Math.round(sum.survival / n),
  };
}

const MOODS = ["neutral", "greed", "despair", "revenge", "euphoria", "ghost"] as const;
type Mood = typeof MOODS[number];

function packMood(profiles: WalletProfile[]): Mood {
  const moodCounts = new Map<Mood, number>();
  for (const p of profiles) {
    const mood = (p.character_state?.mood ?? "neutral") as Mood;
    moodCounts.set(mood, (moodCounts.get(mood) ?? 0) + 1);
  }
  let topMood: Mood = "neutral";
  let topCount = 0;
  for (const [mood, count] of moodCounts) {
    if (count > topCount) { topMood = mood; topCount = count; }
  }
  return topMood;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const tokenRaw = searchParams.get("token") ?? "";
  const symbol = searchParams.get("symbol") ?? "";
  const tokenAddr = tokenRaw.toLowerCase();

  if (tokenAddr && !isAddress(tokenAddr)) {
    return NextResponse.json({ error: "invalid token address" }, { status: 400 });
  }

  const allProfiles = await listProfilesAsync(100);

  // Simulate "shared token holding" by using a deterministic hash:
  // In production: query event_store for wallets with buy/hold events for this token_address.
  // In demo: assign each profile to a token based on their wallet hash.
  let members: WalletProfile[];
  let isDemo = false;

  if (!tokenAddr) {
    // Without a specific token, return largest pack (all profiles for now)
    members = allProfiles.slice(0, 10);
    isDemo = true;
  } else {
    // Filter profiles that "hold" this token (demo: use deterministic assignment)
    if (allProfiles.length > 0) {
      members = allProfiles.filter((p) => {
        const walletHash = hashStr(`${p.wallet_address}:${tokenAddr}`);
        return walletHash % 3 !== 0; // ~67% chance of "holding" for demo
      }).slice(0, 15);
      isDemo = allProfiles.every((p) => !p.character_state?.updated_at || p.character_state.updated_at < 1000000);
    } else {
      members = [];
      isDemo = true;
    }
  }

  const avg = avgDNA(members);
  const mood = packMood(members);
  const packName = symbol ? `Pack of $${symbol.toUpperCase()}` : tokenAddr ? `Cult of ${tokenAddr.slice(0, 6)}…` : "The Degen Horde";

  return NextResponse.json({
    token_address: tokenAddr || null,
    pack_name: packName,
    member_count: members.length,
    members: members.map((p) => ({
      wallet: p.wallet_address,
      archetype: p.archetype,
      archetype_name: ARCHETYPE_PROFILES[p.archetype as keyof typeof ARCHETYPE_PROFILES]?.name ?? p.archetype,
      dna_summary: {
        aggression: p.dna.aggression,
        conviction: p.dna.conviction,
        chaos: p.dna.chaos,
        luck: p.dna.luck,
        survival: p.dna.survival,
      },
      mood: p.character_state?.mood ?? "neutral",
    })),
    avg_dna: avg,
    pack_mood: mood,
    is_demo: isDemo,
  });
}
