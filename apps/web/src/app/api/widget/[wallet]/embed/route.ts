import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { getProfileStore } from "@/lib/profile-store";
import { ARCHETYPE_COLORS } from "@degenborn/shared";
import { getAppUrl } from "@/lib/runtime-env";
import { canonicalizeWallet, isWalletInputSupported } from "@/lib/demo-wallets";
import { loadWalletProfile } from "@/lib/db";

export const runtime = "nodejs";

/**
 * GET /api/widget/[wallet]/embed
 *
 * Returns a self-contained HTML page (iframe-embeddable) that renders the
 * DegenBorn monster mini-card for this wallet. Suitable for embedding on
 * Four.meme trader profiles via <iframe src="...embed"> with no additional JS.
 *
 * Designed dimensions: 300×400px (matches /image endpoint).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { wallet: string } },
): Promise<NextResponse> {
  const { wallet } = params;
  const walletLower = canonicalizeWallet(wallet);

  if (!isWalletInputSupported(walletLower) || !isAddress(walletLower)) {
    return new NextResponse("Invalid wallet address", { status: 400 });
  }

  const profile = getProfileStore(walletLower) ?? await loadWalletProfile(walletLower);
  const archetype = profile?.archetype ?? "unknown";
  const dna = profile?.dna;

  const archetypeName = archetype === "unknown"
    ? "Unknown Monster"
    : archetype
        .split("_")
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

  const accentColor = (ARCHETYPE_COLORS as Record<string, string>)[archetype] ?? "#9945ff";
  const short = `${walletLower.slice(0, 6)}...${walletLower.slice(-4)}`;
  const appUrl = getAppUrl();

  const EMOJI: Record<string, string> = {
    mad_gambler: "🎲", ice_whale: "🐋", rug_necromancer: "💀",
    diamond_cultist: "💎", sniper_jester: "🎯", ghost_bagholder: "👻",
  };
  const emoji = EMOJI[archetype] ?? "✦";

  const dnaRows = dna
    ? [
        { label: "AGG", value: dna.aggression, color: "#FF4444" },
        { label: "CON", value: dna.conviction, color: "#4488FF" },
        { label: "CHA", value: dna.chaos, color: "#FF8800" },
        { label: "LCK", value: dna.luck, color: "#44FF88" },
        { label: "SRV", value: dna.survival, color: accentColor },
      ]
        .map(
          ({ label, value, color }) => `
          <div class="dna-row">
            <span class="dna-label">${label}</span>
            <div class="dna-track"><div class="dna-fill" style="width:${value}%;background:${color}"></div></div>
            <span class="dna-value">${value}</span>
          </div>`,
        )
        .join("")
    : `<div style="color:#555;font-size:11px;text-align:center">Analyze wallet to see DNA</div>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=300, initial-scale=1" />
  <title>DegenBorn — ${archetypeName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 300px; height: 400px; overflow: hidden;
      background: linear-gradient(160deg, #050508 0%, ${accentColor}18 60%, #050508 100%);
      font-family: 'Courier New', monospace;
      color: #fff;
      border: 1px solid ${accentColor}44;
      border-radius: 16px;
      display: flex; flex-direction: column; align-items: center;
    }
    .header {
      width: 100%; display: flex; justify-content: space-between;
      padding: 10px 16px; border-bottom: 1px solid ${accentColor}22;
      font-size: 9px; color: #555;
    }
    .avatar {
      width: 110px; height: 110px; border-radius: 50%;
      background: radial-gradient(circle, ${accentColor}44 0%, ${accentColor}11 60%, transparent 100%);
      border: 2px solid ${accentColor}66;
      display: flex; align-items: center; justify-content: center;
      font-size: 48px; margin-top: 20px; margin-bottom: 12px;
    }
    .archetype-name {
      color: ${accentColor}; font-size: 17px; font-weight: 900;
      letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;
    }
    .dna-section { width: 100%; padding: 0 20px; }
    .dna-row { display: flex; align-items: center; gap: 6px; margin-bottom: 5px; }
    .dna-label { color: #555; font-size: 9px; font-weight: bold; width: 24px; }
    .dna-track { flex: 1; height: 5px; background: #111; border-radius: 3px; overflow: hidden; }
    .dna-fill { height: 100%; border-radius: 3px; }
    .dna-value { color: #555; font-size: 9px; width: 18px; text-align: right; }
    .footer {
      margin-top: auto; width: 100%;
      padding: 10px 16px; border-top: 1px solid ${accentColor}22;
      display: flex; justify-content: space-between;
      font-size: 9px; color: #444;
    }
    .footer a { color: ${accentColor}; opacity: 0.7; text-decoration: none; }
  </style>
</head>
<body>
  <div class="header">
    <span>DEGENBORN</span>
    <span>⚡ four.meme</span>
  </div>
  <div class="avatar">${emoji}</div>
  <div class="archetype-name">${archetypeName}</div>
  <div class="dna-section">${dnaRows}</div>
  <div class="footer">
    <span>${short}</span>
    <a href="${appUrl}/m/${walletLower}" target="_blank" rel="noopener">
      Powered by Four.meme ↗
    </a>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "X-Frame-Options": "ALLOWALL",
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
    },
  });
}
