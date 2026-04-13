import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { ARCHETYPE_COLORS, ARCHETYPE_PROFILES } from "@degenborn/shared";
import type { ArchetypeId } from "@degenborn/shared";
import { getProfileStore } from "@/lib/profile-store";

export const runtime = "nodejs";

/**
 * GET /api/og/challenge/[wallet]
 *
 * Returns a 1200×630 OG image for the challenge landing page.
 * "⚔ A Rug Necromancer is calling you out"
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { wallet: string } },
): Promise<Response> {
  const wallet = params.wallet.toLowerCase();

  const profile = getProfileStore(wallet);
  const archetype = (profile?.archetype ?? "unknown") as ArchetypeId;
  const archetypeProfile = archetype !== "unknown" ? ARCHETYPE_PROFILES[archetype] : null;
  const color = (ARCHETYPE_COLORS as Record<string, string>)[archetype] ?? "#9945ff";
  const short = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;

  const archetypeEmoji: Record<string, string> = {
    mad_gambler: "🎲",
    ice_whale: "🐋",
    rug_necromancer: "💀",
    diamond_cultist: "💎",
    sniper_jester: "🎯",
    ghost_bagholder: "👻",
  };
  const emoji = archetypeEmoji[archetype] ?? "⚔";

  const archetypeName = archetypeProfile?.name ?? "Unknown Monster";
  const tagline = archetypeProfile?.tagline ?? "...";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: `linear-gradient(135deg, #050508 0%, ${color}22 50%, #050508 100%)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          position: "relative",
          overflow: "hidden",
          gap: "20px",
        }}
      >
        {/* Challenge badge */}
        <div
          style={{
            position: "absolute",
            top: "32px",
            left: "0",
            right: "0",
            textAlign: "center",
            color: "#444",
            fontSize: "14px",
            letterSpacing: "5px",
            textTransform: "uppercase",
          }}
        >
          DEGENBORN · CHALLENGE
        </div>

        {/* Crossed swords icon */}
        <div style={{ fontSize: "52px" }}>⚔️</div>

        {/* Challenger info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              fontSize: "16px",
              color: "#555",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            {short}
          </div>

          {/* Emoji circle */}
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${color}44, ${color}11)`,
              border: `2px solid ${color}55`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "56px",
            }}
          >
            {emoji}
          </div>

          <div style={{ fontSize: "13px", color: "#444", letterSpacing: "2px" }}>is a</div>

          <div
            style={{
              fontSize: "60px",
              fontWeight: "900",
              color: color,
              textShadow: `0 0 60px ${color}55`,
              letterSpacing: "-1px",
            }}
          >
            {archetypeName}
          </div>

          <div style={{ fontSize: "22px", color: "#888", fontStyle: "italic" }}>
            &quot;{tagline}&quot;
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop: "8px",
            fontSize: "28px",
            fontWeight: "900",
            color: "#FFFFFF",
            letterSpacing: "1px",
          }}
        >
          Are you brave enough?
        </div>

        {/* Bottom */}
        <div
          style={{
            position: "absolute",
            bottom: "28px",
            color: "#333",
            fontSize: "14px",
            letterSpacing: "3px",
          }}
        >
          Connect Wallet to Accept · degenborn.xyz
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
