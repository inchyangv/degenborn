import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getProfileStore } from "@/lib/profile-store";
import { ARCHETYPE_COLORS, ARCHETYPE_PROFILES } from "@degenborn/shared";
import { canonicalizeWallet, isWalletInputSupported } from "@/lib/demo-wallets";
import { loadWalletProfile } from "@/lib/db";

export const runtime = "nodejs";

/**
 * GET /api/og/obituary/[wallet]?token=RUGTOKEN&pnl=-1400
 *
 * Generates a token obituary card (1080×1080 PNG).
 * Shown when a token held by this wallet goes to zero.
 *
 * Query params:
 *   token — token ticker
 *   pnl   — PnL in USD (negative = loss)
 */

const EMOJI: Record<string, string> = {
  mad_gambler: "🎲", ice_whale: "🐋", rug_necromancer: "💀",
  diamond_cultist: "💎", sniper_jester: "🎯", ghost_bagholder: "👻", unknown: "👾",
};

const EPITAPHS: Record<string, string[]> = {
  mad_gambler: [
    "Ape'd in at the top. Didn't ape out.",
    "Fast hands. Slow exit. RIP.",
    "The chart said sell. He said more.",
  ],
  ice_whale: [
    "Held with conviction. The conviction was wrong.",
    "Patience is a virtue. This was not the time.",
    "The whale held. The token didn't.",
  ],
  rug_necromancer: [
    "Survived three rugs. Not this one.",
    "Even the necromancer can't revive a zero.",
    "The rug pulled back.",
  ],
  diamond_cultist: [
    "Diamond hands. Paper outcome.",
    "Still holding, technically.",
    "The faith was real. The dev was not.",
  ],
  sniper_jester: [
    "Fast in, fast rekt. No exit.",
    "Called the entry. Missed the exit. Classic.",
    "The jester became the joke.",
  ],
  ghost_bagholder: [
    "Was already a ghost. Now more so.",
    "The bag finally reached zero.",
    "The dev left. The bag followed.",
  ],
  unknown: ["Rest in pieces.", "They were so ngmi.", "gone but not remembered"],
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
  const tokenStr = searchParams.get("token") ?? "UNKNOWN";
  const pnlStr = searchParams.get("pnl");
  const pnlAmount = pnlStr ? parseInt(pnlStr, 10) : 0;
  const lossDisplay = pnlAmount < 0 ? `-$${Math.abs(pnlAmount).toLocaleString()}` : null;

  const profile = getProfileStore(walletLower) ?? await loadWalletProfile(walletLower);
  const archetype = profile?.archetype ?? "unknown";
  const archetypeName = archetype === "unknown"
    ? "Unknown Monster"
    : archetype.split("_").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const accentColor = (ARCHETYPE_COLORS as Record<string, string>)[archetype] ?? "#9945ff";
  const emoji = EMOJI[archetype] ?? "👾";
  const epitaphBank = EPITAPHS[archetype] ?? EPITAPHS.unknown!;
  // Deterministic epitaph pick
  const epitaphIdx = Math.abs(walletLower.charCodeAt(2) + walletLower.charCodeAt(5)) % epitaphBank.length;
  const epitaph = epitaphBank[epitaphIdx]!;

  const shortWallet = `${walletLower.slice(0, 6)}...${walletLower.slice(-4)}`;
  const tokenClean = tokenStr.replace(/^\$/, "").toUpperCase();
  const profileData = ARCHETYPE_PROFILES[archetype as keyof typeof ARCHETYPE_PROFILES];
  const tagline = profileData?.tagline ?? "ngmi.";

  // Date in "APRIL 18, 2026" format
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1080,
          background: "linear-gradient(160deg, #050508, #0a0005)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          fontFamily: "Georgia, Times New Roman, serif",
          padding: "50px 60px",
          boxSizing: "border-box",
        }}
      >
        {/* Obituary header */}
        <div style={{
          borderBottom: "2px solid #ffffff22",
          width: "100%",
          textAlign: "center",
          paddingBottom: 24,
          marginBottom: 40,
        }}>
          <div style={{
            fontSize: 14,
            color: "#555",
            letterSpacing: "0.6em",
            fontFamily: "Impact, sans-serif",
            marginBottom: 8,
          }}>
            IN MEMORIAM
          </div>
          <div style={{
            fontSize: 64,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "0.05em",
            fontFamily: "Impact, sans-serif",
          }}>
            ${tokenClean}
          </div>
          <div style={{ fontSize: 16, color: "#444", marginTop: 8 }}>
            {dateStr} · Cause of death: rug
          </div>
        </div>

        {/* Monster + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 50, marginBottom: 50 }}>
          <div style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accentColor}33, transparent)`,
            border: `3px solid ${accentColor}55`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 100,
          }}>
            {emoji}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 18, color: "#555", letterSpacing: "0.2em" }}>HELD BY</div>
            <div style={{ fontSize: 48, color: accentColor, fontWeight: 900, fontFamily: "Impact, sans-serif" }}>
              {archetypeName}
            </div>
            <div style={{ fontSize: 20, color: "#888", fontFamily: "Courier New, monospace" }}>
              {shortWallet}
            </div>
            <div style={{ fontSize: 18, color: "#444", fontStyle: "italic", marginTop: 8 }}>
              "{tagline}"
            </div>
          </div>
        </div>

        {/* Epitaph box */}
        <div style={{
          background: "#0a000a",
          border: "1px solid #ffffff11",
          borderRadius: 16,
          padding: "32px 50px",
          textAlign: "center",
          marginBottom: 40,
          width: "100%",
        }}>
          <div style={{ fontSize: 18, color: "#555", letterSpacing: "0.3em", marginBottom: 16, fontFamily: "Impact, sans-serif" }}>
            EPITAPH
          </div>
          <div style={{ fontSize: 36, color: "#ddd", fontStyle: "italic", lineHeight: 1.4 }}>
            "{epitaph}"
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 60, marginBottom: 40 }}>
          {lossDisplay && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, color: "#555", letterSpacing: "0.2em", fontFamily: "Impact, sans-serif" }}>FINAL PnL</div>
              <div style={{ fontSize: 52, color: "#ff3d3d", fontWeight: 900, fontFamily: "Impact, sans-serif" }}>{lossDisplay}</div>
            </div>
          )}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "#555", letterSpacing: "0.2em", fontFamily: "Impact, sans-serif" }}>STATUS</div>
            <div style={{ fontSize: 52, color: "#666", fontWeight: 900, fontFamily: "Impact, sans-serif" }}>RUGGED</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "#555", letterSpacing: "0.2em", fontFamily: "Impact, sans-serif" }}>MONSTER</div>
            <div style={{ fontSize: 52, color: "#aaa", fontWeight: 900, fontFamily: "Impact, sans-serif" }}>STILL HERE</div>
          </div>
        </div>

        {/* Weeping monster (styled) */}
        <div style={{ fontSize: 40, color: "#333", textAlign: "center", marginBottom: 32 }}>
          {emoji} 😢 {emoji}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: "1px solid #ffffff11",
          width: "100%",
          paddingTop: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div style={{ fontSize: 14, color: "#333", fontFamily: "Impact, sans-serif" }}>DegenBorn × Four.meme</div>
          <div style={{ fontSize: 14, color: "#333", fontFamily: "Impact, sans-serif" }}>#DegenBorn #ngmi</div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
    },
  );
}
