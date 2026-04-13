import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getProfileStore } from "@/lib/profile-store";
import { ARCHETYPE_COLORS } from "@degenborn/shared";

export const runtime = "nodejs";

/**
 * GET /api/og/[wallet]
 *
 * Returns an OpenGraph-compatible PNG image (1200×630) for the given wallet's Soul Core.
 * Designed as a meme card: archetype color bg + declaration quote + DNA bars.
 * Used as the og:image and twitter:image in /m/[wallet] page metadata.
 */

// Archetype-specific declaration lines — meme-ready
const ARCHETYPE_DECLARATIONS: Record<string, string> = {
  mad_gambler: "I don't wait. I ape in.",
  ice_whale: "I don't trade. I wait. Then I destroy.",
  rug_necromancer: "I've been rugged 7 times. Still here.",
  diamond_cultist: "The bags are heavy. So is my conviction.",
  sniper_jester: "In. Out. Profit. Next.",
  ghost_bagholder: "I'm still holding. Always will be.",
  unknown: "My wallet speaks louder than I do.",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { wallet: string } },
): Promise<Response> {
  const { wallet } = params;
  const walletLower = wallet.toLowerCase();

  if (!/^0x[0-9a-f]{40}$/i.test(walletLower)) {
    return new Response("Invalid wallet address", { status: 400 });
  }

  const profile = getProfileStore(walletLower);
  const archetype = profile?.archetype ?? "unknown";
  const dna = profile?.dna;

  const archetypeName = archetype === "unknown"
    ? "Unknown Monster"
    : archetype
        .split("_")
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

  const accentColor = (ARCHETYPE_COLORS as Record<string, string>)[archetype] ?? "#9945ff";
  const declaration = ARCHETYPE_DECLARATIONS[archetype] ?? ARCHETYPE_DECLARATIONS["unknown"]!;
  const short = `${walletLower.slice(0, 6)}...${walletLower.slice(-4)}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: `linear-gradient(135deg, #050508 0%, ${accentColor}18 50%, #050508 100%)`,
          display: "flex",
          flexDirection: "row",
          fontFamily: "monospace",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Left panel — character area */}
        <div
          style={{
            width: "380px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 32px",
            borderRight: `1px solid ${accentColor}33`,
            background: `linear-gradient(180deg, ${accentColor}12 0%, transparent 100%)`,
          }}
        >
          {/* Character placeholder — glowing circle */}
          <div
            style={{
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${accentColor}44 0%, ${accentColor}11 60%, transparent 100%)`,
              border: `2px solid ${accentColor}66`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "80px",
              marginBottom: "24px",
            }}
          >
            {archetype === "mad_gambler" ? "🎲" :
             archetype === "ice_whale" ? "🐋" :
             archetype === "rug_necromancer" ? "💀" :
             archetype === "diamond_cultist" ? "💎" :
             archetype === "sniper_jester" ? "🎯" :
             archetype === "ghost_bagholder" ? "👻" : "✦"}
          </div>

          {/* Archetype name */}
          <div
            style={{
              color: accentColor,
              fontSize: "28px",
              fontWeight: "900",
              textAlign: "center",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            {archetypeName}
          </div>

          {/* Wallet */}
          <div style={{ color: "#555", fontSize: "16px", fontFamily: "monospace", marginTop: "8px" }}>
            {short}
          </div>
        </div>

        {/* Right panel — declaration + DNA */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "48px 56px",
          }}
        >
          {/* Top label */}
          <div style={{ color: "#444", fontSize: "14px", letterSpacing: "4px", textTransform: "uppercase" }}>
            DEGENBORN × FOUR.MEME
          </div>

          {/* Declaration quote — the meme hook */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ color: "#333", fontSize: "36px", fontWeight: "900" }}>"</div>
            <div
              style={{
                color: "#FFFFFF",
                fontSize: "44px",
                fontWeight: "900",
                lineHeight: "1.2",
                textShadow: `0 0 60px ${accentColor}55`,
              }}
            >
              {declaration}
            </div>
          </div>

          {/* DNA bars */}
          {dna && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "AGG", value: dna.aggression, color: "#FF4444" },
                { label: "CON", value: dna.conviction, color: "#4488FF" },
                { label: "CHA", value: dna.chaos, color: "#FF8800" },
                { label: "LCK", value: dna.luck, color: "#44FF88" },
                { label: "SRV", value: dna.survival, color: accentColor },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ color: "#555", fontSize: "13px", fontWeight: "bold", width: "36px", fontFamily: "monospace" }}>{label}</div>
                  <div
                    style={{
                      flex: 1,
                      height: "8px",
                      background: "#111",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${value}%`,
                        height: "100%",
                        background: color,
                        borderRadius: "4px",
                        opacity: 0.85,
                      }}
                    />
                  </div>
                  <div style={{ color: "#666", fontSize: "14px", width: "28px", textAlign: "right", fontFamily: "monospace" }}>{value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom label */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ color: "#333", fontSize: "14px" }}>
              Soul Core · Soulbound · Non-transferable
            </div>
            <div
              style={{
                color: accentColor,
                fontSize: "13px",
                fontWeight: "700",
                opacity: 0.7,
              }}
            >
              ⚡ Powered by Four.meme
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
