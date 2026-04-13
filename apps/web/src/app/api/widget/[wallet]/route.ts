import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { getProfileStore } from "@/lib/profile-store";
import { getAppUrl } from "@/lib/runtime-env";

export const runtime = "nodejs";

/**
 * GET /api/widget/[wallet]
 *
 * Returns a JSON payload that Four.meme (or any third-party) can use to embed
 * a DegenBorn monster card directly on their platform.
 *
 * Schema:
 *   wallet         string   — checksummed wallet address
 *   archetype      string   — e.g. "rug_necromancer"
 *   archetype_name string   — e.g. "Rug Necromancer"
 *   level          number   — character level (1+)
 *   loyalty_score  number   — 0–100 Four.meme loyalty score
 *   loyalty_grade  string   — "Bronze" | "Silver" | "Gold" | "Diamond" | "Legendary"
 *   image_url      string   — absolute URL to OG/portrait image (1200×630 PNG)
 *   widget_image_url string — absolute URL to mini card (300×400 PNG)
 *   share_url      string   — absolute URL to the monster's public profile page
 *   embed_url      string   — URL for iframe embed
 *   powered_by     string   — "DegenBorn × four.meme"
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { wallet: string } },
): Promise<NextResponse> {
  const { wallet } = params;
  const walletLower = wallet.toLowerCase();

  if (!isAddress(walletLower)) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  const profile = getProfileStore(walletLower);
  const archetype = profile?.archetype ?? "unknown";
  const archetypeName = archetype === "unknown"
    ? "Unknown Monster"
    : archetype
        .split("_")
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

  const appUrl = getAppUrl();

  const payload = {
    wallet: walletLower,
    archetype,
    archetype_name: archetypeName,
    level: 1,                               // static until state persistence is added (T2-01)
    loyalty_score: null,                    // available after /api/analyze is called for this wallet
    loyalty_grade: null,
    dna: profile?.dna ?? null,
    image_url: `${appUrl}/api/og/${walletLower}`,
    widget_image_url: `${appUrl}/api/widget/${walletLower}/image`,
    share_url: `${appUrl}/m/${walletLower}`,
    embed_url: `${appUrl}/api/widget/${walletLower}/embed`,
    powered_by: "DegenBorn × four.meme",
    last_updated: profile?.last_scored_at ?? null,
  };

  return NextResponse.json(payload, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Cache-Control": "no-store",
    },
  });
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
