import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { getAppUrl } from "@/lib/runtime-env";
import { DEMO_WALLETS } from "@/lib/demo-wallets";
import { ARCHETYPE_PROFILES, ARCHETYPE_COLORS } from "@degenborn/shared";
import type { ArchetypeId } from "@degenborn/shared";
import { listProfilesAsync } from "@/lib/profile-store";

export const runtime = "nodejs";

/**
 * GET /api/widget/token/[address]/embed
 *
 * Self-contained HTML page that shows the top holder monsters for a Four.meme token.
 * Designed for 480×320px iframe embedding on token discussion pages.
 */

function hashNumber(input: string, mod: number): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h) ^ input.charCodeAt(i);
    h = h >>> 0;
  }
  return h % mod;
}

const DEMO_ORDER: ArchetypeId[] = [
  "rug_necromancer", "ice_whale", "mad_gambler",
  "sniper_jester", "diamond_cultist", "ghost_bagholder",
];
const DEMO_WALLET_MAP: Record<ArchetypeId, string> = {
  rug_necromancer: DEMO_WALLETS.rug_necromancer,
  ice_whale: DEMO_WALLETS.ice_whale,
  mad_gambler: DEMO_WALLETS.mad_gambler,
  sniper_jester: DEMO_WALLETS.sniper_jester,
  diamond_cultist: DEMO_WALLETS.diamond_cultist,
  ghost_bagholder: DEMO_WALLETS.ghost_bagholder,
};
const EMOJI: Record<string, string> = {
  mad_gambler: "🎲", ice_whale: "🐋", rug_necromancer: "💀",
  diamond_cultist: "💎", sniper_jester: "🎯", ghost_bagholder: "👻",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { address: string } },
): Promise<NextResponse> {
  const { address } = params;
  const addrLower = address.toLowerCase();

  if (!isAddress(addrLower)) {
    return new NextResponse("Invalid token contract address", { status: 400 });
  }

  const appUrl = getAppUrl();
  const tokenSymbol = `$TOKEN_${addrLower.slice(-4).toUpperCase()}`;

  const storedProfiles = await listProfilesAsync(20);
  const source = storedProfiles.length >= 3 ? storedProfiles : null;

  const offset = hashNumber(addrLower, DEMO_ORDER.length);
  const orderedArchetypes = [
    ...DEMO_ORDER.slice(offset),
    ...DEMO_ORDER.slice(0, offset),
  ].slice(0, 5);

  const holders = orderedArchetypes.map((archetypeId, rank) => {
    const walletAddr = source
      ? (source[rank % source.length]?.wallet_address ?? DEMO_WALLET_MAP[archetypeId])
      : DEMO_WALLET_MAP[archetypeId];
    const holdPct = Math.max(5, Math.round(38 - rank * 6 + hashNumber(addrLower + rank, 8)));
    const profile = ARCHETYPE_PROFILES[archetypeId];
    const color = ARCHETYPE_COLORS[archetypeId];
    const emoji = EMOJI[archetypeId] ?? "✦";
    return { rank: rank + 1, walletAddr, archetypeId, archetypeName: profile.name, color, emoji, holdPct };
  });

  const holderCards = holders.map(({ rank, walletAddr, archetypeName, color, emoji, holdPct }) => `
    <a href="${appUrl}/m/${walletAddr}" target="_blank" rel="noopener" class="holder-card" style="border-color:${color}33">
      <div class="rank" style="color:${color}">#${rank}</div>
      <div class="avatar" style="border-color:${color}66;background:radial-gradient(circle,${color}33,transparent)">${emoji}</div>
      <div class="name" style="color:${color}">${archetypeName}</div>
      <div class="hold">${holdPct}% hold</div>
    </a>`).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=480, initial-scale=1" />
  <title>DegenBorn — ${tokenSymbol} Top Holders</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 480px; min-height: 320px;
      background: #050508;
      font-family: 'Courier New', monospace;
      color: #fff;
      border: 1px solid #9945ff44;
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      border-bottom: 1px solid #9945ff22;
      font-size: 10px;
    }
    .header-title { color: #9945ff; font-weight: 900; font-size: 11px; letter-spacing: 2px; }
    .header-sub { color: #444; font-size: 9px; }
    .token-label {
      color: #ffd700;
      font-weight: 900;
      font-size: 13px;
      letter-spacing: 1px;
    }
    .holders-row {
      display: flex;
      gap: 8px;
      padding: 12px 14px;
      overflow-x: auto;
      flex: 1;
    }
    .holder-card {
      flex-shrink: 0;
      width: 80px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      padding: 8px 6px;
      border: 1px solid #333;
      border-radius: 10px;
      background: #0a0a0f;
      text-decoration: none;
      cursor: pointer;
      transition: transform 0.1s;
    }
    .holder-card:hover { transform: translateY(-2px); }
    .rank { font-size: 9px; font-weight: bold; }
    .avatar {
      width: 44px; height: 44px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px;
      border: 1.5px solid;
    }
    .name { font-size: 8px; font-weight: 900; text-align: center; color: #ccc; line-height: 1.2; }
    .hold { font-size: 8px; color: #555; }
    .footer {
      padding: 8px 16px;
      border-top: 1px solid #9945ff22;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9px;
      color: #444;
    }
    .footer a { color: #9945ff; opacity: 0.7; text-decoration: none; }
    .demo-badge {
      font-size: 8px;
      color: #333;
      background: #111;
      padding: 2px 6px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="header-title">DEGENBORN</div>
      <div class="header-sub">Top Holder Monsters</div>
    </div>
    <div class="token-label">${tokenSymbol}</div>
  </div>
  <div class="holders-row">${holderCards}</div>
  <div class="footer">
    <span class="demo-badge">${source ? "live data" : "demo mode"}</span>
    <a href="${appUrl}" target="_blank" rel="noopener">
      ⚡ Powered by Four.meme × DegenBorn ↗
    </a>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "X-Frame-Options": "ALLOWALL",
      "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
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
