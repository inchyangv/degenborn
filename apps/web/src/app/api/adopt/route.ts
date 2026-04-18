/**
 * POST /api/adopt
 *
 * 4.3: Adoption / Pairing — two Soul Core wallets create a "child" Soul Core.
 *
 * Rules (deterministic, PROJECT.md section 23: "판정은 규칙, 표현은 AI"):
 * - Both wallets must have analyzed profiles (have a Soul Core)
 * - Child DNA = weighted average of parents + random trait from each
 * - Child archetype = classifyArchetype(child_dna)
 * - Child Soul Core: soulbound to child_wallet (must be provided)
 * - Relics from parents remain with parents (soulbound)
 *
 * Request body: { wallet_a, wallet_b, child_wallet }
 * Response: {
 *   child_wallet,
 *   child_dna: PersonaDNA,
 *   child_archetype: string,
 *   child_archetype_name: string,
 *   parent_a: string,
 *   parent_b: string,
 *   synthesis_notes: string,  // how DNA was combined
 * }
 *
 * NOTE: This is a demo-ready implementation. Production would:
 * - Require on-chain mutual consent (both parents sign)
 * - Mint child Soul Core NFT on-chain
 * - Verify child_wallet ≠ parent wallets
 */
import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { classify } from "@degenborn/archetype";
import { ARCHETYPE_PROFILES } from "@degenborn/shared";
import type { PersonaDNA } from "@degenborn/shared";
import { getProfileStore } from "@/lib/profile-store";
import { canonicalizeWallet, isWalletInputSupported } from "@/lib/demo-wallets";

function blendDNA(a: PersonaDNA, b: PersonaDNA, childWallet: string): PersonaDNA {
  // Deterministic seed from child wallet
  const seedBytes = childWallet.toLowerCase().split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0);

  // 60/40 weighted random blend (seeded)
  const weightA = 0.4 + ((seedBytes % 20) / 100); // 0.40–0.59
  const weightB = 1 - weightA;

  // Add small unique trait: ±10 on one axis chosen by seed
  const axis = ["aggression", "conviction", "chaos", "luck", "survival"][seedBytes % 5] as keyof Pick<PersonaDNA, "aggression" | "conviction" | "chaos" | "luck" | "survival">;
  const tweak = ((seedBytes >> 4) % 21) - 10; // –10 to +10

  function blend(aVal: number, bVal: number, tweakAxis: string, key: string): number {
    const base = Math.round(aVal * weightA + bVal * weightB);
    return Math.max(0, Math.min(100, key === tweakAxis ? base + tweak : base));
  }

  return {
    wallet_address: childWallet.toLowerCase(),
    aggression: blend(a.aggression, b.aggression, axis, "aggression"),
    conviction: blend(a.conviction, b.conviction, axis, "conviction"),
    chaos: blend(a.chaos, b.chaos, axis, "chaos"),
    luck: blend(a.luck, b.luck, axis, "luck"),
    survival: blend(a.survival, b.survival, axis, "survival"),
    computed_at: Math.floor(Date.now() / 1000),
    event_count: 0,
  };
}

function synthNotes(a: PersonaDNA, b: PersonaDNA, child: PersonaDNA, axis: string): string {
  const parts: string[] = [];
  if (child.aggression > Math.max(a.aggression, b.aggression)) parts.push("Aggression spike inherited");
  if (child.survival > Math.max(a.survival, b.survival)) parts.push("Survival instinct amplified");
  if (child.chaos > 70) parts.push("Chaos runs strong in the bloodline");
  if (child.luck > 70) parts.push("Lucky genes passed down");
  if (child.conviction > 70) parts.push("Diamond hands in the DNA");
  parts.push(`Dominant trait axis: ${axis}`);
  return parts.join(". ") + ".";
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as {
      wallet_a: string;
      wallet_b: string;
      child_wallet: string;
    };

    const { wallet_a, wallet_b, child_wallet } = body;

    if (!wallet_a || !wallet_b || !child_wallet) {
      return NextResponse.json({ error: "wallet_a, wallet_b, child_wallet required" }, { status: 400 });
    }

    const addrA = canonicalizeWallet(wallet_a) as `0x${string}`;
    const addrB = canonicalizeWallet(wallet_b) as `0x${string}`;
    const addrChild = canonicalizeWallet(child_wallet) as `0x${string}`;

    for (const [label, addr] of [["wallet_a", addrA], ["wallet_b", addrB], ["child_wallet", addrChild]] as const) {
      if (!isWalletInputSupported(addr) || !isAddress(addr)) {
        return NextResponse.json({ error: `invalid address: ${label}` }, { status: 400 });
      }
    }

    if (addrA === addrB) {
      return NextResponse.json({ error: "wallet_a and wallet_b must be different" }, { status: 400 });
    }

    if (addrChild === addrA || addrChild === addrB) {
      return NextResponse.json({ error: "child_wallet must be different from parents" }, { status: 400 });
    }

    const profileA = getProfileStore(addrA);
    const profileB = getProfileStore(addrB);

    if (!profileA || !profileB) {
      return NextResponse.json({
        error: "Both wallets must have analyzed profiles. Run /birth for each wallet first.",
        missing: [!profileA && addrA, !profileB && addrB].filter(Boolean),
      }, { status: 422 });
    }

    // Deterministic axis from child wallet seed
    const seed = addrChild.toLowerCase().split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0);
    const axis = ["aggression", "conviction", "chaos", "luck", "survival"][seed % 5];

    const childDNA = blendDNA(profileA.dna, profileB.dna, addrChild);
    const childArchetype = classify(childDNA);
    const archetypeProfile = ARCHETYPE_PROFILES[childArchetype.archetype as keyof typeof ARCHETYPE_PROFILES];

    return NextResponse.json({
      child_wallet: addrChild,
      child_dna: childDNA,
      child_archetype: childArchetype.archetype,
      child_archetype_name: archetypeProfile?.name ?? childArchetype.archetype,
      child_tagline: archetypeProfile?.tagline ?? "",
      parent_a: addrA,
      parent_b: addrB,
      parent_a_archetype: profileA.archetype,
      parent_b_archetype: profileB.archetype,
      synthesis_notes: synthNotes(profileA.dna, profileB.dna, childDNA, axis),
      birth_url: `/birth?wallet=${addrChild}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[adopt]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
