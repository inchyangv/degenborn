import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getProfileStore } from "@/lib/profile-store";
import { ARCHETYPE_COLORS } from "@degenborn/shared";

export const runtime = "nodejs";

/**
 * GET /api/og/[wallet]
 *
 * Returns an OpenGraph-compatible PNG image (1200×630) for the given wallet's Soul Core.
 * Used as the og:image and twitter:image in /m/[wallet] page metadata.
 *
 * Uses Next.js built-in ImageResponse (next/og) — no additional packages needed.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { wallet: string } },
): Promise<Response> {
  const { wallet } = params;
  const walletLower = wallet.toLowerCase();

  // Basic hex address check (avoid viem isAddress in edge route)
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
  const short = `${walletLower.slice(0, 6)}...${walletLower.slice(-4)}`;

  const dnaBar = (label: string, value: number, color: string) =>
    `${label}: ${value}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "linear-gradient(135deg, #0D0D0D 0%, #1A0A2E 50%, #0D0D0D 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          padding: "48px",
          gap: "24px",
          position: "relative",
        }}
      >
        {/* Glow background */}
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accentColor}22 0%, transparent 70%)`,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Title */}
        <div style={{ color: "#AAAAAA", fontSize: "20px", letterSpacing: "4px" }}>
          DEGENBORN × FOUR.MEME
        </div>

        {/* Archetype */}
        <div
          style={{
            color: accentColor,
            fontSize: "72px",
            fontWeight: "900",
            textAlign: "center",
            textShadow: `0 0 40px ${accentColor}88`,
          }}
        >
          {archetypeName}
        </div>

        {/* Wallet */}
        <div style={{ color: "#666", fontSize: "24px", fontFamily: "monospace" }}>
          {short}
        </div>

        {/* DNA bars */}
        {dna && (
          <div
            style={{
              display: "flex",
              gap: "32px",
              marginTop: "16px",
            }}
          >
            {[
              { label: "AGG", value: dna.aggression, color: "#FF4444" },
              { label: "CON", value: dna.conviction, color: "#4444FF" },
              { label: "CHA", value: dna.chaos, color: "#FF8800" },
              { label: "LCK", value: dna.luck, color: "#44FF44" },
              { label: "SRV", value: dna.survival, color: "#FF44FF" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "120px",
                    background: "#1A1A2E",
                    borderRadius: "4px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    overflow: "hidden",
                    border: `1px solid ${color}44`,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: `${value}%`,
                      background: color,
                      opacity: 0.8,
                    }}
                  />
                </div>
                <div style={{ color: color, fontSize: "14px", fontWeight: "bold" }}>{label}</div>
                <div style={{ color: "#AAAAAA", fontSize: "18px" }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom label */}
        <div style={{ color: "#444", fontSize: "16px", marginTop: "8px" }}>
          Soul Core — Soulbound · Non-transferable
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
