import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { ARCHETYPE_COLORS, ARCHETYPE_PROFILES } from "@degenborn/shared";
import type { ArchetypeId } from "@degenborn/shared";

export const runtime = "nodejs";

/**
 * GET /api/og/quiz?type=rug_necromancer&agg=82&con=34&cha=76&lck=41&srv=91
 *
 * Returns a 1200×630 OG image for quiz result sharing.
 * "What Kind of Degen Are You?" result card.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") ?? "mad_gambler") as ArchetypeId;
  const agg = parseInt(searchParams.get("agg") ?? "50", 10);
  const con = parseInt(searchParams.get("con") ?? "50", 10);
  const cha = parseInt(searchParams.get("cha") ?? "50", 10);
  const lck = parseInt(searchParams.get("lck") ?? "50", 10);
  const srv = parseInt(searchParams.get("srv") ?? "50", 10);

  const profile = ARCHETYPE_PROFILES[type] ?? ARCHETYPE_PROFILES["mad_gambler"];
  const color = (ARCHETYPE_COLORS as Record<string, string>)[type] ?? "#9945ff";

  const archetypeEmoji: Record<string, string> = {
    mad_gambler: "🎲",
    ice_whale: "🐋",
    rug_necromancer: "💀",
    diamond_cultist: "💎",
    sniper_jester: "🎯",
    ghost_bagholder: "👻",
  };
  const emoji = archetypeEmoji[type] ?? "✦";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: `linear-gradient(135deg, #050508 0%, ${color}20 50%, #050508 100%)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          position: "relative",
          overflow: "hidden",
          padding: "48px",
          gap: "20px",
        }}
      >
        {/* Top label */}
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
          DEGENBORN · WHAT KIND OF DEGEN ARE YOU?
        </div>

        {/* Character emoji */}
        <div
          style={{
            fontSize: "80px",
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color}33 0%, ${color}0a 70%, transparent 100%)`,
            border: `2px solid ${color}55`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {emoji}
        </div>

        {/* "You are a..." */}
        <div style={{ color: "#666", fontSize: "22px", letterSpacing: "3px", textTransform: "uppercase" }}>
          You are a
        </div>

        {/* Archetype name — the hook */}
        <div
          style={{
            color: color,
            fontSize: "72px",
            fontWeight: "900",
            textAlign: "center",
            textShadow: `0 0 60px ${color}66`,
            lineHeight: "1",
            letterSpacing: "-1px",
          }}
        >
          {profile.name}
        </div>

        {/* Tagline */}
        <div
          style={{
            color: "#AAAAAA",
            fontSize: "26px",
            fontStyle: "italic",
            textAlign: "center",
          }}
        >
          &quot;{profile.tagline}&quot;
        </div>

        {/* DNA mini bars */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "8px",
          }}
        >
          {[
            { label: "AGG", value: agg, color: "#FF4444" },
            { label: "CON", value: con, color: "#4488FF" },
            { label: "CHA", value: cha, color: "#FF8800" },
            { label: "LCK", value: lck, color: "#44FF88" },
            { label: "SRV", value: srv, color: color },
          ].map(({ label, value, color: c }) => (
            <div
              key={label}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}
            >
              <div
                style={{
                  width: "48px",
                  height: "80px",
                  background: "#111",
                  borderRadius: "4px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  overflow: "hidden",
                  border: `1px solid ${c}33`,
                }}
              >
                <div style={{ width: "100%", height: `${value}%`, background: c, opacity: 0.85 }} />
              </div>
              <div style={{ color: c, fontSize: "12px", fontWeight: "bold" }}>{label}</div>
              <div style={{ color: "#666", fontSize: "14px" }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            position: "absolute",
            bottom: "28px",
            color: "#333",
            fontSize: "15px",
            letterSpacing: "2px",
          }}
        >
          Find yours → degenborn.xyz/quiz
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
