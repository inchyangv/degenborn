import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { getMutationDiaryAsync } from "@/lib/diary-store";
import { getProfileStore } from "@/lib/profile-store";
import { getAppUrl } from "@/lib/runtime-env";
import { canonicalizeWallet, isWalletInputSupported } from "@/lib/demo-wallets";
import { loadWalletProfile } from "@/lib/db";

/**
 * GET /api/metadata/[wallet]
 *
 * Returns OpenSea-compatible ERC-721 metadata JSON for a given wallet's Soul Core.
 * This is the tokenURI endpoint referenced by the SoulCore contract.
 *
 * Schema: https://docs.opensea.io/docs/metadata-standards
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { wallet: string } },
) {
  const { wallet } = params;
  const walletLower = canonicalizeWallet(wallet);

  if (!isWalletInputSupported(walletLower) || !isAddress(walletLower)) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  // Retrieve the latest character state from the profile store (or diary as fallback)
  const profile = getProfileStore(walletLower) ?? await loadWalletProfile(walletLower);
  const diary = await getMutationDiaryAsync(walletLower, 1);
  const latestState = diary.entries[0]?.state_after ?? null;

  const archetype = profile?.archetype ?? latestState?.archetype ?? "unknown";
  const dna = profile?.dna;

  const attributes: Array<{ trait_type: string; value: string | number; display_type?: string }> = [
    { trait_type: "Archetype", value: archetype },
    { trait_type: "Birthplace", value: "four.meme" },
    { trait_type: "Chain", value: "BNB Smart Chain" },
  ];

  if (dna) {
    attributes.push(
      { trait_type: "Aggression", value: dna.aggression, display_type: "number" },
      { trait_type: "Conviction", value: dna.conviction, display_type: "number" },
      { trait_type: "Chaos", value: dna.chaos, display_type: "number" },
      { trait_type: "Luck", value: dna.luck, display_type: "number" },
      { trait_type: "Survival", value: dna.survival, display_type: "number" },
    );
  }

  if (latestState) {
    attributes.push(
      { trait_type: "Level", value: latestState.level, display_type: "number" },
      { trait_type: "Mood", value: latestState.mood },
      { trait_type: "Corruption", value: latestState.corruption, display_type: "number" },
    );
    if (latestState.active_traits.length > 0) {
      attributes.push({ trait_type: "Active Traits", value: latestState.active_traits.join(", ") });
    }
  }

  const appUrl = getAppUrl();
  const archetypeName = archetype
    .split("_")
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const metadata = {
    name: `DegenBorn Soul Core — ${archetypeName}`,
    description: `A soulbound NFT representing the on-chain identity of ${walletLower}. Born from Four.meme wallet activity. Archetype: ${archetypeName}.`,
    image: `${appUrl}/api/og/${walletLower}`,
    external_url: `${appUrl}/monster?wallet=${walletLower}`,
    birthplace: "four.meme",
    attributes,
  };

  return NextResponse.json(metadata, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
