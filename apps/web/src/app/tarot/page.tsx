"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { drawWeeklyTarot, ARCHETYPE_COLORS } from "@degenborn/shared";
import type { WeeklyTarotDraw } from "@degenborn/shared";
import Link from "next/link";
import html2canvas from "html2canvas";

const SAMPLE_WALLETS = [
  { label: "Rug Necromancer", wallet: "0xrugnecromancer000000000000000000000000001" },
  { label: "Ice Whale", wallet: "0xicewhale000000000000000000000000000000001" },
  { label: "Mad Gambler", wallet: "0xmadgambler0000000000000000000000000000001" },
  { label: "Ghost Bagholder", wallet: "0xghostbagholder00000000000000000000000001" },
];

// Archetype color from affinity
function cardColor(draw: WeeklyTarotDraw): string {
  if (draw.card.archetype_affinity) {
    return ARCHETYPE_COLORS[draw.card.archetype_affinity] ?? "#9945ff";
  }
  const palette = ["#9945ff", "#00d4ff", "#ffd700", "#ff3d3d", "#00ff88", "#aaaaaa"];
  return palette[draw.card.number % palette.length]!;
}

function TarotContent() {
  const searchParams = useSearchParams();
  const walletParam = searchParams.get("wallet") ?? "";
  const [wallet, setWallet] = useState(walletParam);
  const [draw, setDraw] = useState<WeeklyTarotDraw | null>(null);
  const [revealed, setRevealed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wallet) return;
    const d = drawWeeklyTarot(wallet);
    setDraw(d);
    setRevealed(false);
    setTimeout(() => setRevealed(true), 200);
  }, [wallet]);

  const handleDraw = (w: string) => {
    if (!w.trim()) return;
    setWallet(w.trim());
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { backgroundColor: "#0a0a0f", scale: 2 });
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `degenborn_tarot_${wallet.slice(0, 8)}_${draw?.week ?? "this-week"}.png`;
    link.click();
  };

  const color = draw ? cardColor(draw) : "#9945ff";

  return (
    <div className="min-h-screen pb-16 px-4">
      <div className="max-w-sm mx-auto">
        {/* Nav */}
        <div className="flex items-center justify-between py-4 mb-4 border-b border-[var(--degen-border)]">
          <Link href="/" className="text-xs text-gray-600 hover:text-gray-400">← Home</Link>
          <div className="text-xs font-mono text-[var(--neon-purple)] uppercase tracking-widest">Weekly Tarot</div>
          <Link href="/horoscope" className="text-xs text-gray-600 hover:text-gray-400">Horoscope →</Link>
        </div>

        {/* Wallet input */}
        <div className="mb-6">
          <div className="flex gap-2 mb-2">
            <input
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="0x... wallet address"
              className="flex-1 bg-[var(--degen-muted)] border border-[var(--degen-border)] rounded-lg px-3 py-2 text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-[var(--neon-purple)]"
            />
            <button
              onClick={() => handleDraw(wallet)}
              className="px-4 py-2 bg-[var(--neon-purple)] text-white font-black text-sm rounded-lg hover:brightness-110 transition-all"
            >
              Draw
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_WALLETS.map((s) => (
              <button
                key={s.wallet}
                onClick={() => handleDraw(s.wallet)}
                className="px-2 py-0.5 text-[10px] border border-[var(--degen-border)] text-gray-500 rounded-full hover:border-gray-500 hover:text-gray-300 transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {!draw && (
          <div className="text-center py-16 text-gray-600 text-sm">
            Enter a wallet to draw your weekly card.
          </div>
        )}

        {draw && (
          <>
            {/* Card flip animation wrapper — T1-06 */}
            <style>{`
              @keyframes card-flip {
                0%   { transform: rotateY(90deg); opacity: 0; }
                100% { transform: rotateY(0deg);  opacity: 1; }
              }
            `}</style>

            {/* Card — 9:16 format */}
            <div
              ref={cardRef}
              className="rounded-2xl overflow-hidden"
              style={{
                animation: revealed ? "card-flip 0.6s ease-out forwards" : "none",
                opacity: revealed ? 1 : 0,
                aspectRatio: "9/16",
                background: `linear-gradient(160deg, #0a0a0f, ${color}22)`,
                border: `1px solid ${color}55`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "2rem 1.5rem",
              }}
            >
              {/* Header */}
              <div className="text-center w-full">
                <div
                  className="text-[10px] font-mono uppercase tracking-[0.4em] mb-1"
                  style={{ color: `${color}99` }}
                >
                  {draw.week} · {draw.is_reversed ? "Reversed" : "Upright"}
                </div>
                <div className="text-xs text-gray-600 font-mono">
                  {wallet.slice(0, 6)}...{wallet.slice(-4)}
                </div>
              </div>

              {/* Card symbol */}
              <div className="flex flex-col items-center gap-4">
                <div
                  className="text-8xl"
                  style={{
                    filter: draw.is_reversed ? "grayscale(0.5) brightness(0.6)" : "none",
                    transform: draw.is_reversed ? "rotate(180deg)" : "none",
                    transition: "all 0.5s ease",
                  }}
                >
                  {draw.card.symbol}
                </div>

                <div className="text-center">
                  <div
                    className="text-xl font-black mb-1"
                    style={{ color }}
                  >
                    {draw.card.name}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    Arcanum {draw.card.number}
                  </div>
                </div>
              </div>

              {/* Meaning */}
              <div className="text-center">
                <div
                  className="text-sm leading-relaxed italic"
                  style={{ color: draw.is_reversed ? "#aaa" : "#e2e8f0" }}
                >
                  &ldquo;{draw.meaning}&rdquo;
                </div>
              </div>

              {/* Footer */}
              <div className="text-center">
                <div className="text-[10px] text-gray-700 font-mono">
                  DegenBorn · Weekly Reading
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-4 flex-wrap">
              {/* X share — T1-06 */}
              <button
                onClick={() => {
                  const cardName = draw.card.name;
                  const reversed = draw.is_reversed ? " (Reversed)" : "";
                  const text = encodeURIComponent(
                    `My weekly degen tarot: ${cardName}${reversed}\n\n"${draw.meaning}"\n\n#DegenBorn #fourmeme`
                  );
                  const url = encodeURIComponent(`${window.location.origin}/tarot?wallet=${wallet}`);
                  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener");
                }}
                className="flex-1 py-2.5 font-black text-sm rounded-lg hover:brightness-110 transition-all"
                style={{ background: color, color: "#000" }}
              >
                𝕏 Share Reading
              </button>
              <button
                onClick={handleDownload}
                className="px-5 py-2.5 border font-bold text-sm rounded-lg hover:opacity-80 transition-all"
                style={{ borderColor: `${color}55`, color }}
              >
                ↓ Save
              </button>
              <Link
                href={`/monster?wallet=${wallet}`}
                className="px-5 py-2.5 border border-[var(--degen-border)] text-gray-400 font-bold text-sm rounded-lg hover:border-gray-400 hover:text-white transition-colors"
              >
                Soul Room →
              </Link>
            </div>

            {/* Reversed note */}
            {draw.is_reversed && (
              <div className="mt-4 text-xs text-gray-600 italic text-center">
                ⚠ Reversed card. Tread carefully this week.
              </div>
            )}

            {/* All 22 arcana list */}
            <div className="mt-8">
              <div className="text-xs text-gray-700 uppercase tracking-widest mb-3">The 22 Arcana</div>
              <div className="space-y-1">
                {Array.from({ length: 22 }, (_, i) => {
                  const { MAJOR_ARCANA } = require("@degenborn/shared") as typeof import("@degenborn/shared");
                  const c = MAJOR_ARCANA[i];
                  if (!c) return null;
                  const isActive = c.number === draw.card.number;
                  return (
                    <div
                      key={c.number}
                      className="flex items-center gap-2 text-xs py-0.5"
                      style={{ color: isActive ? color : "#4a4a5a" }}
                    >
                      <span className="w-6 text-right font-mono">{c.number}</span>
                      <span>{c.symbol}</span>
                      <span className={isActive ? "font-black" : ""}>{c.name}</span>
                      {isActive && <span className="ml-auto text-[10px]">← this week</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function TarotPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600 text-sm">Loading...</div>}>
      <TarotContent />
    </Suspense>
  );
}
