import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getProfileStore } from "@/lib/profile-store";
import { ARCHETYPE_COLORS } from "@degenborn/shared";
import { canonicalizeWallet, isWalletInputSupported } from "@/lib/demo-wallets";
import { loadWalletProfile } from "@/lib/db";

export const runtime = "nodejs";

/**
 * GET /api/og/report/[wallet]
 *
 * Renders a "Degen Report Card" OG image — school report card format.
 * 1200×630 PNG with:
 *  - Subject grades (F–S scale) derived from DNA axes
 *  - Archetype-specific teacher comment
 *  - DegenBorn Academy stamp
 *  - "Powered by Four.meme" watermark
 */

function dnaToGrade(score: number): string {
  if (score >= 90) return "S+";
  if (score >= 80) return "S";
  if (score >= 70) return "A";
  if (score >= 60) return "B";
  if (score >= 45) return "C";
  if (score >= 30) return "D";
  return "F";
}

function gradeColor(grade: string): string {
  if (grade.startsWith("S")) return "#ffd700";
  if (grade === "A") return "#00ff88";
  if (grade === "B") return "#00d4ff";
  if (grade === "C") return "#9945ff";
  if (grade === "D") return "#ff8800";
  return "#ff3d3d";
}

const TEACHER_COMMENTS: Record<string, string> = {
  mad_gambler: "Does not read the board. Apes in immediately. High energy. Often in detention.",
  ice_whale: "Quiet, methodical, and disturbingly patient. Intimidates other students.",
  rug_necromancer: "Has failed this course several times. Still here. Respect.",
  diamond_cultist: "Refuses to sell test answers. Conviction is admirable. Results are not.",
  sniper_jester: "Never stays long enough to finish the exam. Somehow still passing.",
  ghost_bagholder: "Present but absent. The bag grows heavier every semester.",
  unknown: "Identity unverified. Please submit your wallet for evaluation.",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { wallet: string } },
): Promise<Response> {
  const { wallet } = params;
  const walletLower = canonicalizeWallet(wallet);

  if (!isWalletInputSupported(walletLower)) {
    return new Response("Invalid wallet address", { status: 400 });
  }

  const profile = getProfileStore(walletLower) ?? await loadWalletProfile(walletLower);
  const archetype = profile?.archetype ?? "unknown";
  const dna = profile?.dna;

  const archetypeName = archetype === "unknown"
    ? "Unknown"
    : archetype.split("_").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const accentColor = (ARCHETYPE_COLORS as Record<string, string>)[archetype] ?? "#9945ff";
  const teacherComment = TEACHER_COMMENTS[archetype] ?? TEACHER_COMMENTS["unknown"]!;
  const short = `${walletLower.slice(0, 6)}...${walletLower.slice(-4)}`;

  const subjects = dna ? [
    { name: "Aggression", score: dna.aggression },
    { name: "Conviction", score: dna.conviction },
    { name: "Chaos", score: dna.chaos },
    { name: "Luck", score: dna.luck },
    { name: "Survival", score: dna.survival },
  ] : [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#faf6e8",
          display: "flex",
          flexDirection: "column",
          fontFamily: "serif",
          position: "relative",
          border: "8px solid #8b7355",
          overflow: "hidden",
        }}
      >
        {/* Header band */}
        <div
          style={{
            width: "100%",
            background: "#1a1a1a",
            padding: "16px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ color: "#ffd700", display: "flex", fontSize: "28px", fontWeight: "900", letterSpacing: "4px" }}>
              DEGENBORN ACADEMY
            </div>
            <div style={{ color: "#666", display: "flex", fontSize: "12px", letterSpacing: "2px" }}>
              Est. 2024 · Powered by Four.meme · BNB Smart Chain Campus
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ color: "#888", display: "flex", fontSize: "11px" }}>STUDENT ID</div>
            <div style={{ color: "#ccc", display: "flex", fontSize: "14px", fontFamily: "monospace" }}>{short}</div>
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            display: "flex",
            padding: "24px 40px 20px",
            gap: "32px",
          }}
        >
          {/* Left column — grades */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "14px", color: "#666", display: "flex", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "12px" }}>
              Academic Performance
            </div>

            {subjects.length > 0 ? subjects.map(({ name, score }) => {
              const grade = dnaToGrade(score);
              const gColor = gradeColor(grade);
              return (
                <div
                  key={name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #ddd",
                    padding: "8px 0",
                  }}
                >
                  <div style={{ color: "#333", display: "flex", fontSize: "18px", fontWeight: "bold", flex: 1 }}>{name}</div>
                  <div style={{ color: "#888", display: "flex", justifyContent: "center", fontSize: "14px", width: "80px", textAlign: "center" }}>
                    {score}/100
                  </div>
                  <div
                    style={{
                      width: "48px",
                      height: "36px",
                      background: "#1a1a1a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "4px",
                      color: gColor,
                      fontSize: "22px",
                      fontWeight: "900",
                    }}
                  >
                    {grade}
                  </div>
                </div>
              );
            }) : (
              <div style={{ color: "#999", display: "flex", fontSize: "16px", marginTop: "20px" }}>
                No DNA data on record. Wallet not yet analyzed.
              </div>
            )}

            {/* "Parents' signature" */}
            <div style={{ marginTop: "auto", borderTop: "1px solid #ccc", paddingTop: "12px", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "12px", color: "#999", display: "flex" }}>Parent / Guardian Signature:</div>
              <div style={{ fontSize: "20px", color: "#ddd", display: "flex", fontStyle: "italic", marginTop: "4px" }}>
                _________________________________
              </div>
            </div>
          </div>

          {/* Right column — archetype + comment */}
          <div style={{ width: "300px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Archetype badge */}
            <div
              style={{
                background: "#1a1a1a",
                border: `2px solid ${accentColor}`,
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div style={{ color: "#666", display: "flex", fontSize: "11px", letterSpacing: "3px" }}>ARCHETYPE</div>
              <div style={{ color: accentColor, display: "flex", fontSize: "24px", fontWeight: "900", textAlign: "center", textTransform: "uppercase" }}>
                {archetypeName}
              </div>
            </div>

            {/* Teacher comment */}
            <div
              style={{
                background: "#f5f0e0",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "14px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ fontSize: "11px", color: "#888", display: "flex", letterSpacing: "2px", marginBottom: "8px" }}>
                HOMEROOM TEACHER'S COMMENT
              </div>
              <div style={{ fontSize: "15px", color: "#333", display: "flex", fontStyle: "italic", lineHeight: "1.5" }}>
                {`"${teacherComment}"`}
              </div>
              <div style={{ marginTop: "12px", fontSize: "11px", color: "#999", display: "flex" }}>
                — Prof. On-Chain · Dept. of Market Psychology
              </div>
            </div>

            {/* Stamp */}
            <div
              style={{
                border: `3px solid ${accentColor}`,
                borderRadius: "50%",
                width: "90px",
                height: "90px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                alignSelf: "flex-end",
                opacity: 0.8,
              }}
            >
              <div style={{ color: accentColor, display: "flex", fontSize: "9px", fontWeight: "900", letterSpacing: "1px", textAlign: "center" }}>
                DEGENBORN
              </div>
              <div style={{ color: accentColor, display: "flex", fontSize: "7px", textAlign: "center" }}>
                ACADEMY
              </div>
              <div style={{ color: accentColor, display: "flex", fontSize: "7px" }}>EST. 2024</div>
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
