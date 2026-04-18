/**
 * GET /api/gif/genesis?wallet=0x...
 *
 * Returns an animated GIF (GIF89a) showing the genesis "reveal" animation:
 * dark silhouette → dimmed color → full archetype color (7 frames, ~4.5s loop).
 *
 * No native dependencies — pure Node.js LZW + GIF89a encoder.
 */
import { NextRequest, NextResponse } from "next/server";
import { canonicalizeWallet } from "@/lib/demo-wallets";
import { encodeGif, renderGenesisFrames } from "@/lib/gif-encoder";

export const runtime = "nodejs";

const ARCHETYPE_COLORS: Record<string, [number, number, number]> = {
  mad_gambler:     [255, 60,  60],
  ice_whale:       [0,   180, 255],
  rug_necromancer: [140, 40,  255],
  diamond_cultist: [0,   220, 180],
  sniper_jester:   [255, 200, 0],
  ghost_bagholder: [160, 160, 200],
};

const VALID_ARCHETYPES = new Set(Object.keys(ARCHETYPE_COLORS));

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const rawWallet = searchParams.get("wallet") ?? "demo";
  const wallet = canonicalizeWallet(rawWallet);
  const archetypeParam = searchParams.get("archetype") ?? "rug_necromancer";
  const archetypeId = VALID_ARCHETYPES.has(archetypeParam) ? archetypeParam : "rug_necromancer";

  const color = ARCHETYPE_COLORS[archetypeId];
  const GIF_SIZE = 240;

  const { palette, frames } = renderGenesisFrames(GIF_SIZE, GIF_SIZE, color);
  const gif = encodeGif({ width: GIF_SIZE, height: GIF_SIZE, palette, frames, loop: 0 });

  const shortWallet = wallet.length >= 8 ? wallet.slice(0, 8) : wallet;
  return new NextResponse(gif.buffer as ArrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "public, max-age=3600",
      "Content-Disposition": `inline; filename="genesis-${shortWallet}.gif"`,
    },
  });
}
