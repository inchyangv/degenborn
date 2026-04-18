import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getProfileStore } from "@/lib/profile-store";
import { ARCHETYPE_COLORS } from "@degenborn/shared";
import { canonicalizeWallet, isWalletInputSupported } from "@/lib/demo-wallets";
import { loadWalletProfile } from "@/lib/db";

export const runtime = "nodejs";

/**
 * GET /api/og/wanted/[wallet]?loss=1400&token=RUGTOKEN
 *
 * Generates a "WANTED" poster image (1080×1080 PNG) for a wallet after a big loss.
 * Query params:
 *   loss   — USD amount of the loss (default: "unknown amount")
 *   token  — token ticker (default: "UNKNOWN")
 */

const EMOJI: Record<string, string> = {
  mad_gambler: "🎲", ice_whale: "🐋", rug_necromancer: "💀",
  diamond_cultist: "💎", sniper_jester: "🎯", ghost_bagholder: "👻", unknown: "👾",
};

const CRIMES: Record<string, string> = {
  mad_gambler: "Reckless Aping in a School Zone",
  ice_whale: "Failure to Exit at Peak",
  rug_necromancer: "Repeatedly Walking Into Rugs",
  diamond_cultist: "Possession of Bags with Intent to Hold",
  sniper_jester: "Fumbling the Bag at Record Speed",
  ghost_bagholder: "Abandoning Portfolio After Death",
  unknown: "Crimes Against PnL",
};

export async function GET(
  req: NextRequest,
  { params }: { params: { wallet: string } },
): Promise<ImageResponse | Response> {
  const walletRaw = params.wallet;
  const walletLower = canonicalizeWallet(walletRaw);

  if (!isWalletInputSupported(walletLower)) {
    return new Response("Invalid wallet", { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const lossStr = searchParams.get("loss");
  const tokenStr = searchParams.get("token") ?? "UNKNOWN";
  const lossAmount = lossStr ? `$${parseInt(lossStr, 10).toLocaleString()}` : "unknown amount";

  const profile = getProfileStore(walletLower) ?? await loadWalletProfile(walletLower);
  const archetype = profile?.archetype ?? "unknown";
  const archetypeName = archetype === "unknown"
    ? "Unknown Monster"
    : archetype.split("_").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const accentColor = (ARCHETYPE_COLORS as Record<string, string>)[archetype] ?? "#ff3d3d";
  const emoji = EMOJI[archetype] ?? "👾";
  const crime = CRIMES[archetype] ?? "Crimes Against PnL";
  const shortWallet = `${walletLower.slice(0, 6)}...${walletLower.slice(-4)}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1080,
          background: "#0a0000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Impact, Arial Black, sans-serif",
          padding: "40px",
          border: `12px solid #ff3d3d`,
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Corner ornaments */}
        <div style={{ position: "absolute", top: 24, left: 24, fontSize: 28, color: "#ff3d3d88" }}>✦</div>
        <div style={{ position: "absolute", top: 24, right: 24, fontSize: 28, color: "#ff3d3d88" }}>✦</div>
        <div style={{ position: "absolute", bottom: 24, left: 24, fontSize: 28, color: "#ff3d3d88" }}>✦</div>
        <div style={{ position: "absolute", bottom: 24, right: 24, fontSize: 28, color: "#ff3d3d88" }}>✦</div>

        {/* WANTED header */}
        <div style={{
          fontSize: 96,
          fontWeight: 900,
          color: "#ff3d3d",
          letterSpacing: "0.3em",
          textShadow: "0 0 40px #ff3d3d88",
          marginBottom: 16,
        }}>
          WANTED
        </div>
        <div style={{ fontSize: 20, color: "#ff3d3d88", letterSpacing: "0.5em", marginBottom: 40 }}>
          DEAD OR REKT
        </div>

        {/* Monster portrait */}
        <div style={{
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accentColor}44, transparent)`,
          border: `4px solid ${accentColor}88`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 160,
          marginBottom: 40,
        }}>
          {emoji}
        </div>

        {/* Identity */}
        <div style={{ fontSize: 44, color: accentColor, fontWeight: 900, marginBottom: 8 }}>
          {archetypeName}
        </div>
        <div style={{ fontSize: 18, color: "#888", fontFamily: "Courier New, monospace", marginBottom: 40 }}>
          {shortWallet}
        </div>

        {/* Crime */}
        <div style={{
          background: "#ff3d3d15",
          border: "1px solid #ff3d3d44",
          borderRadius: 12,
          padding: "16px 40px",
          marginBottom: 24,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 16, color: "#ff3d3d88", letterSpacing: "0.3em", marginBottom: 8 }}>CRIME</div>
          <div style={{ fontSize: 28, color: "#fff", fontWeight: 900 }}>{crime}</div>
        </div>

        {/* Loss + token */}
        <div style={{ display: "flex", gap: 40, marginBottom: 40 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "#555", letterSpacing: "0.2em" }}>AMOUNT LOST</div>
            <div style={{ fontSize: 48, color: "#ff3d3d", fontWeight: 900 }}>{lossAmount}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "#555", letterSpacing: "0.2em" }}>TOKEN</div>
            <div style={{ fontSize: 48, color: "#888", fontWeight: 900 }}>${tokenStr.replace(/^\$/, "")}</div>
          </div>
        </div>

        {/* Reward */}
        <div style={{
          background: "#ffd70011",
          border: "1px solid #ffd70044",
          borderRadius: 12,
          padding: "12px 40px",
          marginBottom: 32,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 14, color: "#ffd70088", letterSpacing: "0.3em" }}>REWARD</div>
          <div style={{ fontSize: 32, color: "#ffd700", fontWeight: 900 }}>The satisfaction of ngmi</div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: 14, color: "#333", letterSpacing: "0.2em" }}>
          DegenBorn × Four.meme · #DegenBorn
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
    },
  );
}
