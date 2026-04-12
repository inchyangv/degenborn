"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { PersonaDNA, ArchetypeResult, CharacterState } from "@degenborn/shared";
import { ARCHETYPE_COLORS } from "@degenborn/shared";
import Link from "next/link";
import html2canvas from "html2canvas";
import { useRef } from "react";

interface MonsterData {
  dna: PersonaDNA;
  archetype: ArchetypeResult;
  state: CharacterState;
}

interface OriginStory {
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
}

export default function OriginPage() {
  const params = useParams();
  const wallet = typeof params.wallet === "string" ? params.wallet : "";

  const [monster, setMonster] = useState<MonsterData | null>(null);
  const [story, setStory] = useState<OriginStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wallet) return;

    const load = async () => {
      try {
        const resp = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet }),
        });
        const analyzed = await resp.json() as { dna: PersonaDNA; archetype: ArchetypeResult };
        const { createInitialState } = await import("@/lib/state-machine");
        const state = createInitialState(wallet.toLowerCase(), analyzed.archetype.archetype as any);
        const monsterData: MonsterData = { dna: analyzed.dna, archetype: analyzed.archetype, state };
        setMonster(monsterData);

        // Fetch origin story
        const originResp = await fetch("/api/origin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wallet,
            dna: analyzed.dna,
            state,
            archetype: analyzed.archetype,
          }),
        });
        const originData = await originResp.json() as OriginStory;
        setStory(originData);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load origin story");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [wallet]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { backgroundColor: "#f5f0e8", scale: 2 });
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `degenborn_origin_${wallet.slice(0, 8)}.png`;
    link.click();
  };

  const color = monster ? (ARCHETYPE_COLORS[monster.archetype.archetype] ?? "#9945ff") : "#9945ff";

  return (
    <div className="min-h-screen pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Nav */}
        <div className="flex items-center justify-between py-4 mb-4 border-b border-[var(--degen-border)]">
          <Link href="/" className="text-xs text-gray-600 hover:text-gray-400">← Home</Link>
          <div className="text-xs font-mono uppercase tracking-widest" style={{ color }}>
            Origin Story
          </div>
          {wallet && (
            <Link href={`/monster?wallet=${wallet}`} className="text-xs text-gray-600 hover:text-gray-400">
              Monster Room →
            </Link>
          )}
        </div>

        {loading && (
          <div className="text-center py-20 text-gray-500 font-mono text-sm">
            The archive is being written...
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-[var(--neon-red)] text-sm">{error}</div>
        )}

        {monster && story && (
          <>
            {/* Archive card */}
            <div
              ref={cardRef}
              className="rounded-2xl p-8 mb-6 relative overflow-hidden"
              style={{
                background: "linear-gradient(160deg, #f5f0e8, #ede8d8)",
                border: `2px solid ${color}55`,
                fontFamily: "var(--font-serif), 'Cormorant Garamond', Georgia, serif",
                color: "#2a1f0e",
              }}
            >
              {/* Decorative border lines */}
              <div
                className="absolute inset-3 rounded-xl pointer-events-none"
                style={{ border: `1px solid ${color}33` }}
              />

              {/* Header */}
              <div className="text-center mb-8">
                <div
                  className="text-xs uppercase tracking-[0.4em] mb-2"
                  style={{ color: `${color}cc`, fontFamily: "var(--font-mono)" }}
                >
                  Origin Chronicle
                </div>
                <div className="text-3xl font-bold mb-1" style={{ color: "#2a1f0e" }}>
                  {monster.archetype.profile.name}
                </div>
                <div className="text-sm italic" style={{ color: "#6b5a3e" }}>
                  &ldquo;{monster.archetype.profile.tagline}&rdquo;
                </div>
                <div
                  className="mt-3 text-xs uppercase tracking-widest"
                  style={{ color: "#6b5a3e", fontFamily: "var(--font-mono)" }}
                >
                  {wallet.slice(0, 6)}...{wallet.slice(-4)}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-8">
                <div className="flex-1 h-px" style={{ background: `${color}55` }} />
                <div className="text-sm" style={{ color }}>✦</div>
                <div className="flex-1 h-px" style={{ background: `${color}55` }} />
              </div>

              {/* Story paragraphs */}
              <div className="space-y-6 text-base leading-relaxed" style={{ color: "#2a1f0e" }}>
                <p className="indent-8">{story.paragraph1}</p>
                <p className="indent-8">{story.paragraph2}</p>
                <p className="indent-8">{story.paragraph3}</p>
              </div>

              {/* Footer */}
              <div className="mt-10 pt-4 flex items-end justify-between" style={{ borderTop: `1px solid ${color}33` }}>
                <div className="space-y-0.5" style={{ fontFamily: "var(--font-mono)", color: "#6b5a3e", fontSize: "10px" }}>
                  <div>AGG {Math.round(monster.dna.aggression)} · CON {Math.round(monster.dna.conviction)} · CHA {Math.round(monster.dna.chaos)}</div>
                  <div>LCK {Math.round(monster.dna.luck)} · SRV {Math.round(monster.dna.survival)}</div>
                </div>
                <div className="text-right" style={{ fontFamily: "var(--font-serif)", color: "#6b5a3e", fontSize: "11px" }}>
                  <div className="italic">Witnessed by the DegenBorn Council</div>
                  <div className="text-xs">Under the sigil of Four.meme</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleDownload}
                className="px-5 py-2.5 font-black text-sm rounded-lg hover:brightness-110 transition-all"
                style={{ background: color, color: "#000" }}
              >
                ↓ Download PNG
              </button>
              <Link
                href={`/certificate/${wallet}`}
                className="px-5 py-2.5 border border-[var(--degen-border)] text-gray-400 font-bold text-sm rounded-lg hover:border-gray-400 hover:text-white transition-colors"
              >
                Birth Certificate →
              </Link>
              <Link
                href={`/monster?wallet=${wallet}`}
                className="px-5 py-2.5 border rounded-lg text-sm font-bold transition-colors hover:brightness-125"
                style={{ borderColor: `${color}55`, color }}
              >
                Soul Core →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
