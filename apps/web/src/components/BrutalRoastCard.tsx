"use client";

/**
 * T-ROAST-01 — Brutal Roast Card component.
 *
 * Renders the 3-paragraph LLM roast with black bg / red typography.
 * Calls /api/roast on demand ("Go Brutal 🔥" button).
 * Downloads as degenborn_<wallet>_brutal.png via html2canvas.
 */

import { useState, useRef } from "react";
import type { PersonaDNA, CharacterState, ArchetypeResult } from "@degenborn/shared";
import type { RoastOutput } from "@degenborn/shared";

interface Props {
  wallet: string;
  dna: PersonaDNA;
  state: CharacterState;
  archetype: ArchetypeResult;
}

export default function BrutalRoastCard({ wallet, dna, state, archetype }: Props) {
  const [roast, setRoast] = useState<RoastOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const fetchRoast = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet, dna, state, archetype }),
      });
      if (!resp.ok) {
        const body = (await resp.json()) as { error?: string };
        throw new Error(body.error ?? `HTTP ${resp.status}`);
      }
      const data = (await resp.json()) as RoastOutput & { cached: boolean };
      setRoast(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Roast failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadCard = async () => {
    if (!cardRef.current || !roast) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0a0005",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      const short = wallet.slice(0, 8);
      link.download = `degenborn_${short}_brutal.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const short = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;

  return (
    <div className="space-y-3">
      {/* Trigger button */}
      {!roast && (
        <button
          onClick={fetchRoast}
          disabled={loading}
          className="w-full py-3 text-sm font-bold rounded border-2 transition-all"
          style={{
            borderColor: "#ff3d3d",
            color: "#ff3d3d",
            background: loading ? "#1a0a0a" : "transparent",
          }}
        >
          {loading ? "Generating roast..." : "Go Brutal 🔥"}
        </button>
      )}

      {error && (
        <div className="text-xs text-red-400 text-center opacity-70">{error}</div>
      )}

      {/* Roast card */}
      {roast && (
        <>
          <div
            ref={cardRef}
            style={{
              background: "linear-gradient(160deg, #0a0005 0%, #150005 50%, #0a0010 100%)",
              border: "1px solid #ff3d3d44",
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            }}
            className="rounded-lg p-6 space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs tracking-widest uppercase" style={{ color: "#ff3d3d", opacity: 0.7 }}>
                  Brutal Roast
                </div>
                <div className="text-xs opacity-40 mt-0.5 tracking-wider">{short}</div>
              </div>
              <div className="text-2xl">💀</div>
            </div>

            <div className="border-t" style={{ borderColor: "#ff3d3d33" }} />

            {/* Character name */}
            <div className="text-xs opacity-50 italic">
              {archetype.profile.name} · Level {state.level} · {state.mood}
            </div>

            {/* Paragraphs */}
            <div className="space-y-4 text-sm leading-relaxed">
              <RoastParagraph text={roast.paragraph1} color="#ff6060" />
              <RoastParagraph text={roast.paragraph2} color="#ff4040" />
              <RoastParagraph text={roast.paragraph3} color="#ff3d3d" />
            </div>

            <div className="border-t pt-3" style={{ borderColor: "#ff3d3d33" }}>
              <div className="text-xs opacity-30 tracking-widest text-right">
                DegenBorn × Four.meme
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={downloadCard}
              disabled={downloading}
              className="flex-1 py-2 text-xs rounded border transition-opacity opacity-60 hover:opacity-90"
              style={{ borderColor: "#ff3d3d", color: "#ff3d3d" }}
            >
              {downloading ? "Saving..." : "Download PNG"}
            </button>
            <button
              onClick={fetchRoast}
              disabled={loading}
              className="py-2 px-4 text-xs rounded border transition-opacity opacity-40 hover:opacity-70"
              style={{ borderColor: "#ff3d3d66", color: "#ff3d3d" }}
            >
              {loading ? "..." : "Re-roast"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function RoastParagraph({ text, color }: { text: string; color: string }) {
  return (
    <p style={{ color }} className="opacity-90">
      {text}
    </p>
  );
}
