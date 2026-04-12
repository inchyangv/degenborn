"use client";

/**
 * T-CERT-01 — Soul Birth Certificate.
 *
 * Vintage paper certificate format. Fully deterministic — same wallet = same cert.
 * Background color and all fields are derived from wallet seed (no LLM).
 */

import { useRef, useState } from "react";
import type { ArchetypeId } from "@degenborn/shared";
import {
  ARCHETYPE_PROFILES,
  ARCHETYPE_COLORS,
  evaluateBadges,
  pickShowcaseBadges,
} from "@degenborn/shared";
import type { CharacterState, PersonaDNA } from "@degenborn/shared";

interface Props {
  wallet: string;
  archetype: ArchetypeId;
  state: CharacterState;
  dna: PersonaDNA;
  characterName: string;
  characterTitle: string;
  /** ISO date the soul was born / minted */
  birthDate?: string;
}

// 5 deterministic background palettes (gold / crimson / obsidian / moss / bone)
const CERT_PALETTES = [
  {
    name: "gold",
    bg: "#1a1408",
    paper: "#2a2010",
    border: "#c9a227",
    text: "#f5e6b3",
    accent: "#ffd700",
    seal: "#c9a227",
  },
  {
    name: "crimson",
    bg: "#180808",
    paper: "#221010",
    border: "#8b1a1a",
    text: "#f5d0d0",
    accent: "#cc2222",
    seal: "#8b1a1a",
  },
  {
    name: "obsidian",
    bg: "#0a0a0f",
    paper: "#111118",
    border: "#4a4a6a",
    text: "#d0d0f0",
    accent: "#9945ff",
    seal: "#4a4a6a",
  },
  {
    name: "moss",
    bg: "#0a120a",
    paper: "#111810",
    border: "#2d5a1e",
    text: "#d0f0d0",
    accent: "#44aa33",
    seal: "#2d5a1e",
  },
  {
    name: "bone",
    bg: "#141210",
    paper: "#1e1c18",
    border: "#8a7a5a",
    text: "#f0ead8",
    accent: "#c8b87a",
    seal: "#8a7a5a",
  },
] as const;

function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0;
  }
  return hash;
}

function getPalette(wallet: string) {
  const seed = djb2(wallet.toLowerCase());
  return CERT_PALETTES[seed % CERT_PALETTES.length]!;
}

// Weakest / strongest DNA axis labels
function dnaAxes(dna: PersonaDNA): { weakest: string; strongest: string } {
  const entries: [string, number][] = [
    ["Aggression", dna.aggression],
    ["Conviction", dna.conviction],
    ["Chaos", dna.chaos],
    ["Luck", dna.luck],
    ["Survival", dna.survival],
  ];
  entries.sort((a, b) => a[1] - b[1]);
  return { weakest: entries[0]![0], strongest: entries[4]![0] };
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  const day = d.getUTCDate();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const ordinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]!);
  };
  return `${ordinal(day)} of ${months[d.getUTCMonth()]!}, ${d.getUTCFullYear()}`;
}

export default function BirthCertificate({
  wallet,
  archetype,
  state,
  dna,
  characterName,
  characterTitle,
  birthDate,
}: Props) {
  const certRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const palette = getPalette(wallet);
  const profile = ARCHETYPE_PROFILES[archetype];
  const archetypeColor = ARCHETYPE_COLORS[archetype] ?? palette.accent;

  const earned = evaluateBadges(state);
  const showcase = pickShowcaseBadges(earned, 3);

  const { weakest, strongest } = dnaAxes(dna);
  const short = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  const date = birthDate ?? new Date().toISOString().slice(0, 10);

  const downloadCert = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(certRef.current, {
        backgroundColor: palette.bg,
        scale: 3, // high-res for OG / print
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `degenborn_${wallet.slice(0, 8)}_certificate.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Certificate card */}
      <div
        ref={certRef}
        style={{
          background: palette.paper,
          border: `2px solid ${palette.border}`,
          color: palette.text,
          fontFamily: "'Cormorant Garamond', 'Georgia', serif",
          position: "relative",
          overflow: "hidden",
        }}
        className="rounded-sm p-8 max-w-sm mx-auto"
      >
        {/* Corner ornaments */}
        <CornerOrnament color={palette.border} pos="tl" />
        <CornerOrnament color={palette.border} pos="tr" />
        <CornerOrnament color={palette.border} pos="bl" />
        <CornerOrnament color={palette.border} pos="br" />

        {/* Header rule */}
        <div className="text-center space-y-1 mb-6">
          <Rule color={palette.border} />
          <div className="text-xs tracking-[0.3em] uppercase opacity-60 py-1">
            Certificate of Soul Birth
          </div>
          <div className="text-xs tracking-widest opacity-40">
            DegenBorn × Four.meme
          </div>
          <Rule color={palette.border} />
        </div>

        {/* Body */}
        <div className="text-center space-y-4">
          <div className="text-sm italic opacity-60">
            This document hereby certifies that
          </div>

          <div>
            <div
              className="text-3xl font-bold tracking-wide"
              style={{ color: palette.accent }}
            >
              {characterName}
            </div>
            <div className="text-base italic opacity-70 mt-0.5">
              the {characterTitle}
            </div>
          </div>

          <div className="text-sm opacity-60 leading-relaxed">
            was awakened from wallet
            <br />
            <span
              className="text-xs tracking-widest"
              style={{ fontFamily: "monospace", color: palette.accent, opacity: 0.8 }}
            >
              {short}
            </span>
            <br />
            on the {formatDate(date)}
          </div>

          <div className="text-sm opacity-60">
            under the archetype of
          </div>
          <div
            className="text-xl font-bold tracking-widest uppercase"
            style={{ color: archetypeColor }}
          >
            {profile.name}
          </div>
          <div className="text-xs italic opacity-50">
            &ldquo;{profile.tagline}&rdquo;
          </div>

          <Rule color={palette.border} />

          {/* Blessings & Curses */}
          <div className="grid grid-cols-2 gap-4 text-sm text-left">
            <div>
              <div className="text-xs tracking-widest uppercase opacity-50 mb-2">
                Blessed With
              </div>
              {showcase.length > 0 ? (
                showcase.map((b) => (
                  <div key={b.id} className="flex items-center gap-1 text-xs opacity-80">
                    <span>{b.emoji}</span>
                    <span>{b.name}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs opacity-40 italic">No badges yet</div>
              )}
            </div>
            <div>
              <div className="text-xs tracking-widest uppercase opacity-50 mb-2">
                Cursed With
              </div>
              <div className="text-xs opacity-70 flex items-start gap-1">
                <span>☠</span>
                <span>Low {weakest}</span>
              </div>
              <div className="text-xs opacity-70 flex items-start gap-1">
                <span>☠</span>
                <span>High {strongest}</span>
              </div>
            </div>
          </div>

          <Rule color={palette.border} />

          {/* Witness */}
          <div className="text-xs opacity-40 leading-relaxed">
            Witnessed by the DegenBorn Council
            <br />
            Under the sigil of Four.meme
          </div>

          {/* Wax seal */}
          <WaxSeal color={archetypeColor} initial={profile.name[0]!} />
        </div>
      </div>

      {/* Download button */}
      <div className="flex justify-center">
        <button
          onClick={downloadCert}
          disabled={downloading}
          className="text-sm py-2 px-6 rounded border transition-opacity opacity-70 hover:opacity-100"
          style={{ borderColor: palette.border, color: palette.accent }}
        >
          {downloading ? "Rendering..." : "Download Certificate PNG"}
        </button>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Rule({ color }: { color: string }) {
  return (
    <div
      className="flex items-center gap-2 mx-auto"
      style={{ maxWidth: "80%" }}
    >
      <div className="flex-1 h-px" style={{ background: color, opacity: 0.4 }} />
      <div style={{ color, opacity: 0.6, fontSize: "10px" }}>✦</div>
      <div className="flex-1 h-px" style={{ background: color, opacity: 0.4 }} />
    </div>
  );
}

function CornerOrnament({ color, pos }: { color: string; pos: "tl" | "tr" | "bl" | "br" }) {
  const posStyles: Record<string, React.CSSProperties> = {
    tl: { top: 8, left: 8 },
    tr: { top: 8, right: 8 },
    bl: { bottom: 8, left: 8 },
    br: { bottom: 8, right: 8 },
  };
  return (
    <div
      style={{
        position: "absolute",
        color,
        opacity: 0.4,
        fontSize: "14px",
        lineHeight: 1,
        ...posStyles[pos],
      }}
    >
      ✦
    </div>
  );
}

function WaxSeal({ color, initial }: { color: string; initial: string }) {
  return (
    <div className="flex justify-center mt-2">
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          border: `2px solid ${color}`,
          background: `${color}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          color,
          fontSize: "18px",
          fontWeight: "bold",
          boxShadow: `0 0 12px ${color}44`,
        }}
      >
        {initial}
      </div>
    </div>
  );
}
