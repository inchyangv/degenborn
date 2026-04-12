"use client";

/**
 * T-EULO-01 — Flatline Eulogy Card
 *
 * Renders the "In Memoriam" card for flatlined wallets.
 * Deterministic: same wallet + state always yields same card.
 * Supports PNG download (html2canvas) and resurrection stamp overlay.
 */
import type { PersonaDNA, ArchetypeResult, CharacterState } from "@degenborn/shared";
import { ARCHETYPE_COLORS } from "@degenborn/shared";
import { useRef, useState } from "react";
import { formatDate, daysAlive } from "@/lib/flatline";

interface Props {
  dna: PersonaDNA;
  archetype: ArchetypeResult;
  state: CharacterState;
  wallet: string;
  /** Unix seconds — when the soul was "born" (first event or mint) */
  birthAt: number;
  /** Unix seconds — last known activity event */
  lastActiveAt: number;
  /** If true, renders a RESURRECTED stamp overlay */
  resurrected?: boolean;
  /** LLM-generated cause of flatline (1 sentence, already sanitized) */
  causeOfFlatline?: string;
}

// Deterministic cause-of-flatline from DNA when no LLM result is available
function deriveCause(dna: PersonaDNA, archetype: string): string {
  const causes: Record<string, string> = {
    mad_gambler: "aggression exceeded all available capital",
    ice_whale: "conviction outlasted the market's patience",
    rug_necromancer: "chaos finally consumed what survival had built",
    diamond_cultist: "conviction held past the last breath",
    sniper_jester: "luck ran out between exits",
    ghost_bagholder: "the bags held on — the soul let go",
  };
  if (dna.chaos > 70 && dna.survival < 30) return "chaos exceeded survival — the void won";
  if (dna.conviction > 70) return causes[archetype] ?? "conviction outlasted everything";
  return causes[archetype] ?? "the silence came without warning";
}

export default function EulogyCard({
  dna,
  archetype,
  state,
  wallet,
  birthAt,
  lastActiveAt,
  resurrected = false,
  causeOfFlatline,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const archetypeColor = ARCHETYPE_COLORS[archetype.archetype] ?? "#9945ff";
  const shortWallet = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  const cause = causeOfFlatline ?? deriveCause(dna, archetype.archetype);

  // Deterministic last dialogue from state mood
  const lastWords: Record<string, string> = {
    neutral: "I was here.",
    euphoria: "I had it. I really had it.",
    despair: "The bags are still open.",
    revenge: "I'll be back. I swear it.",
    greed: "Just one more trade.",
    ghost: "...",
  };
  const lastDialogue = lastWords[state.mood] ?? "...";

  const birthDateStr = birthAt > 0 ? formatDate(birthAt) : "unknown date";
  const flatlineStr = lastActiveAt > 0 ? formatDate(lastActiveAt) : "unknown date";
  const days = birthAt > 0 && lastActiveAt > 0 ? daysAlive(birthAt, lastActiveAt) : 0;

  const downloadCard = async () => {
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      if (cardRef.current) {
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: "#0a0a0f",
          scale: 2,
          useCORS: true,
        });
        const link = document.createElement("a");
        link.download = `degenborn_${wallet.slice(0, 8)}_eulogy.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    } catch (e) {
      console.error("Eulogy download failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Card */}
      <div
        ref={cardRef}
        className="relative mx-auto rounded-2xl overflow-hidden"
        style={{
          maxWidth: 400,
          background: "linear-gradient(160deg, #0f0f0f 0%, #1a0a0a 100%)",
          border: `1px solid ${archetypeColor}44`,
          fontFamily: "monospace",
        }}
      >
        {/* Resurrection stamp — absolute overlay */}
        {resurrected && (
          <div
            className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
            style={{ transform: "rotate(-12deg)" }}
          >
            <div
              className="px-6 py-3 border-4 text-2xl font-black rounded tracking-widest"
              style={{
                borderColor: "#00ff88",
                color: "#00ff88",
                background: "rgba(0,0,0,0.6)",
                opacity: 0.85,
              }}
            >
              RESURRECTED
            </div>
          </div>
        )}

        <div className="p-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="text-[10px] text-gray-600 tracking-[0.4em] uppercase mb-1">
              DegenBorn × Four.meme
            </div>
            <div className="text-xl font-black text-white tracking-widest uppercase">
              In Memoriam
            </div>
            <div className="mt-2 border-t border-b py-2" style={{ borderColor: `${archetypeColor}44` }}>
              <div className="text-base font-black" style={{ color: archetypeColor }}>
                {archetype.profile.name}
              </div>
              <div className="text-[11px] text-gray-500 font-mono">
                the {archetype.profile.tagline}
              </div>
              <div className="text-[10px] text-gray-700 font-mono mt-1">{shortWallet}</div>
            </div>
          </div>

          {/* Dates */}
          <div className="text-center mb-4 space-y-1">
            <div className="text-[11px] text-gray-500 font-mono">born {birthDateStr}</div>
            <div className="text-[11px] text-gray-500 font-mono">flatlined {flatlineStr}</div>
            {days > 0 && (
              <div className="text-[11px] font-bold font-mono" style={{ color: archetypeColor }}>
                {days.toLocaleString()} days on-chain
              </div>
            )}
          </div>

          {/* DNA snapshot — abstract units */}
          <div className="mb-4 border rounded-lg p-3" style={{ borderColor: "#ffffff0f", background: "#0a0a0f" }}>
            <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-2 text-center">
              Final DNA
            </div>
            <div className="flex justify-around">
              {[
                ["AGG", dna.aggression, "#ff3d3d"],
                ["CON", dna.conviction, "#00d4ff"],
                ["CHA", dna.chaos, "#9945ff"],
                ["LCK", dna.luck, "#ffd700"],
                ["SRV", dna.survival, "#00ff88"],
              ].map(([label, score, color]) => (
                <div key={label as string} className="text-center">
                  <div className="text-[9px] text-gray-600 font-mono">{label}</div>
                  <div className="text-sm font-black font-mono" style={{ color: color as string }}>
                    {score}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Final state */}
          <div className="text-center mb-4">
            <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Final State</div>
            <div className="text-[11px] font-mono text-gray-300">
              Level {state.level} · {state.mood} · {state.scar_count} scars · {state.crown_count} crowns
            </div>
          </div>

          {/* Cause of flatline */}
          <div className="mb-4 text-center">
            <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Cause of Flatline</div>
            <div className="text-[11px] text-gray-400 italic">"{cause}"</div>
          </div>

          {/* Last words */}
          <div className="mb-5 text-center">
            <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Last Words</div>
            <div className="text-sm font-bold text-white italic">"{lastDialogue}"</div>
          </div>

          {/* Footer epitaph */}
          <div className="text-center border-t pt-4" style={{ borderColor: `${archetypeColor}22` }}>
            <div className="text-[10px] text-gray-600 font-mono">Rest in chaos.</div>
            <div className="text-[10px] text-gray-700 font-mono">— The DegenBorn Council</div>
          </div>
        </div>
      </div>

      {/* Download button */}
      <div className="flex justify-center">
        <button
          onClick={downloadCard}
          disabled={downloading}
          className="px-6 py-2.5 text-xs font-bold rounded-lg transition-all disabled:opacity-50 hover:brightness-110"
          style={{ backgroundColor: archetypeColor, color: "#000" }}
        >
          {downloading ? "Generating…" : "Download Eulogy PNG"}
        </button>
      </div>

      <div className="text-[10px] text-gray-700 text-center">
        Inactive 30+ days · Auto-detected flatline
      </div>
    </div>
  );
}
