import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getProfileStore } from "@/lib/profile-store";
import { ARCHETYPE_COLORS } from "@degenborn/shared";

export const runtime = "nodejs";

/**
 * GET /api/widget/[wallet]/image
 *
 * Returns a 300×400 PNG mini monster card suitable for embedding on external platforms
 * (e.g. Four.meme trader profiles). Includes archetype, name, loyalty grade badge,
 * and DNA mini-bars.
 */

const ARCHETYPE_EMOJI: Record<string, string> = {
  mad_gambler: "🎲",
  ice_whale: "🐋",
  rug_necromancer: "💀",
  diamond_cultist: "💎",
  sniper_jester: "🎯",
  ghost_bagholder: "👻",
  unknown: "✦",
};

const ARCHETYPE_TAGLINES: Record<string, string> = {
  mad_gambler: "Apes in. Always.",
  ice_whale: "Patience. Then destruction.",
  rug_necromancer: "Rugged 7x. Still here.",
  diamond_cultist: "The bags are heavy. So is my conviction.",
  sniper_jester: "In. Out. Profit. Next.",
  ghost_bagholder: "Still holding. Always will be.",
  unknown: "My wallet speaks louder.",
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
  const emoji = ARCHETYPE_EMOJI[archetype] ?? "✦";
  const tagline = ARCHETYPE_TAGLINES[archetype] ?? ARCHETYPE_TAGLINES["unknown"]!;
  const short = `${walletLower.slice(0, 6)}...${walletLower.slice(-4)}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "300px",
          height: "400px",
          background: `linear-gradient(160deg, #050508 0%, ${accentColor}18 60%, #050508 100%)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "monospace",
          border: `1px solid ${accentColor}44`,
          borderRadius: "16px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Header bar */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            borderBottom: `1px solid ${accentColor}22`,
            fontSize: "10px",
            color: "#555",
          }}
        >
          <span>DEGENBORN</span>
          <span>⚡ four.meme</span>
        </div>

        {/* Character avatar */}
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accentColor}44 0%, ${accentColor}11 60%, transparent 100%)`,
            border: `2px solid ${accentColor}66`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "52px",
            marginTop: "24px",
            marginBottom: "16px",
          }}
        >
          {emoji}
        </div>

        {/* Archetype name */}
        <div
          style={{
            color: accentColor,
            fontSize: "18px",
            fontWeight: "900",
            textAlign: "center",
            letterSpacing: "1px",
            textTransform: "uppercase",
            marginBottom: "4px",
          }}
        >
          {archetypeName}
        </div>

        {/* Tagline */}
        <div
          style={{
            color: "#999",
            fontSize: "11px",
            textAlign: "center",
            fontStyle: "italic",
            maxWidth: "220px",
            lineHeight: "1.4",
            marginBottom: "16px",
            padding: "0 16px",
          }}
        >
          &ldquo;{tagline}&rdquo;
        </div>

        {/* DNA mini bars */}
        {dna ? (
          <div
            style={{
              width: "100%",
              padding: "0 20px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            {[
              { label: "AGG", value: dna.aggression, color: "#FF4444" },
              { label: "CON", value: dna.conviction, color: "#4488FF" },
              { label: "CHA", value: dna.chaos, color: "#FF8800" },
              { label: "LCK", value: dna.luck, color: "#44FF88" },
              { label: "SRV", value: dna.survival, color: accentColor },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ color: "#555", fontSize: "9px", fontWeight: "bold", width: "26px" }}>{label}</div>
                <div
                  style={{
                    flex: 1,
                    height: "5px",
                    background: "#111",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${value}%`,
                      height: "100%",
                      background: color,
                      borderRadius: "3px",
                    }}
                  />
                </div>
                <div style={{ color: "#555", fontSize: "9px", width: "20px", textAlign: "right" }}>{value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: "#444", fontSize: "11px", textAlign: "center" }}>
            No DNA data yet — analyze wallet first
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            marginTop: "auto",
            width: "100%",
            padding: "10px 16px",
            borderTop: `1px solid ${accentColor}22`,
            display: "flex",
            justifyContent: "space-between",
            fontSize: "9px",
            color: "#444",
          }}
        >
          <span>{short}</span>
          <span style={{ color: accentColor, opacity: 0.7 }}>Powered by Four.meme</span>
        </div>
      </div>
    ),
    {
      width: 300,
      height: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      },
    },
  );
}
