"use client";

/**
 * T-HORO-01 — Daily Soul Horoscope component.
 *
 * Collapsible banner for Monster Room + standalone share view.
 * Fully deterministic — no LLM. Seed = djb2(wallet + YYYY-MM-DD).
 */

import { useState, useRef } from "react";
import { getDailyHoroscope, ARCHETYPE_COLORS, ARCHETYPE_PROFILES } from "@degenborn/shared";
import type { ArchetypeId } from "@degenborn/shared";

interface Props {
  wallet: string;
  archetype: ArchetypeId;
  /** ISO date "YYYY-MM-DD" — defaults to today UTC when omitted */
  date?: string;
  /** When true renders the full standalone card instead of the collapsible banner */
  standalone?: boolean;
}

export default function DailyHoroscope({ wallet, archetype, date, standalone = false }: Props) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const horoscope = getDailyHoroscope(wallet, archetype, date);
  const color = ARCHETYPE_COLORS[archetype] ?? "#9945ff";
  const profile = ARCHETYPE_PROFILES[archetype];

  const moodEmoji: Record<string, string> = {
    neutral: "·",
    euphoria: "✨",
    despair: "💀",
    revenge: "🔥",
    greed: "💰",
    ghost: "👻",
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0a0a0f",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      const short = wallet.slice(0, 6);
      link.download = `degenborn_${short}_horoscope_${horoscope.date}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const cardContent = (
    <div
      ref={cardRef}
      style={{
        background: "#0a0a0f",
        border: `1px solid ${color}44`,
        fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
      }}
      className="rounded-lg p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs tracking-widest uppercase opacity-50">DegenBorn · Daily Reading</div>
          <div className="text-sm font-bold mt-0.5" style={{ color }}>
            {profile.name} · {horoscope.date}
          </div>
        </div>
        <div className="text-2xl">{moodEmoji[horoscope.mood] ?? "·"}</div>
      </div>

      {/* Rule */}
      <div className="border-t opacity-20" style={{ borderColor: color }} />

      {/* Fields */}
      <div className="space-y-3 text-sm">
        <HoroRow label="MOOD" value={horoscope.moodLabel} color={color} />
        <HoroRow label="LUCKY" value={horoscope.luckyTrait} color={color} />
        <HoroRow label="AVOID" value={horoscope.avoid} color="#ff3d3d" muted />
        <HoroRow label="EMBRACE" value={horoscope.embrace} color="#00ff88" />
        <div className="border-t opacity-20 pt-3" style={{ borderColor: color }}>
          <div className="text-xs opacity-50 uppercase tracking-widest mb-1">FORTUNE</div>
          <div className="italic opacity-90 leading-snug">
            &ldquo;{horoscope.fortune}&rdquo;
          </div>
        </div>
      </div>

      {/* Wallet stamp */}
      <div className="text-xs opacity-30 tracking-wider text-right">
        {wallet.slice(0, 6)}...{wallet.slice(-4)}
      </div>
    </div>
  );

  if (standalone) {
    return (
      <div className="max-w-sm mx-auto space-y-4">
        {cardContent}
        <button
          onClick={downloadCard}
          disabled={downloading}
          className="w-full py-2 text-sm rounded border opacity-70 hover:opacity-100 transition-opacity"
          style={{ borderColor: color, color }}
        >
          {downloading ? "Saving..." : "Download PNG"}
        </button>
      </div>
    );
  }

  // Collapsible banner for Monster Room
  return (
    <div className="w-full">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs rounded-t border transition-colors"
        style={{
          borderColor: `${color}44`,
          background: `${color}10`,
          color,
        }}
      >
        <span className="tracking-widest uppercase">
          {moodEmoji[horoscope.mood]} Today&apos;s Reading
        </span>
        <span className="opacity-60">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-x border-b rounded-b" style={{ borderColor: `${color}44` }}>
          <div className="p-4">{cardContent}</div>
          <div className="px-4 pb-3 flex gap-2">
            <button
              onClick={downloadCard}
              disabled={downloading}
              className="text-xs py-1 px-3 rounded border opacity-60 hover:opacity-90 transition-opacity"
              style={{ borderColor: color, color }}
            >
              {downloading ? "..." : "Save PNG"}
            </button>
            <a
              href={`/horoscope?wallet=${wallet}&archetype=${archetype}`}
              className="text-xs py-1 px-3 rounded border opacity-60 hover:opacity-90 transition-opacity"
              style={{ borderColor: color, color }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Share →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function HoroRow({
  label,
  value,
  color,
  muted,
}: {
  label: string;
  value: string;
  color: string;
  muted?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div
        className="text-xs tracking-widest uppercase shrink-0 w-16 pt-0.5"
        style={{ color, opacity: 0.6 }}
      >
        {label}
      </div>
      <div className={`leading-snug ${muted ? "opacity-70" : ""}`}>{value}</div>
    </div>
  );
}
