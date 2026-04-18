"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ARCHETYPE_COLORS } from "@degenborn/shared";

interface YearbookEntry {
  rank: number;
  wallet: string;
  wallet_short: string;
  archetype: string;
  archetype_name: string;
  yearbook_caption: string;
  monster_url: string;
}

interface YearbookData {
  season: number;
  title: string;
  subtitle: string;
  total_monsters: number;
  entries: YearbookEntry[];
}

export default function YearbookPage() {
  const [data, setData] = useState<YearbookData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/yearbook?season=1")
      .then((r) => r.json())
      .then((d) => setData(d as YearbookData))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--degen-bg)] text-white pb-16">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--degen-border)]">
        <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs">← Home</Link>
        <div className="text-center">
          <div className="text-[var(--neon-gold)] font-black text-base tracking-widest">📓 YEARBOOK</div>
          <div className="text-[10px] text-gray-600">class photo of every monster</div>
        </div>
        <div className="w-12" />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-600 text-sm">Loading class photo…</div>
        </div>
      )}

      {data && (
        <div className="max-w-2xl mx-auto px-4 pt-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="font-black text-2xl mb-1">{data.title}</div>
            <div className="text-gray-500 text-sm italic">{data.subtitle}</div>
            <div className="text-[10px] text-gray-600 mt-1">{data.total_monsters} monsters enrolled</div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {data.entries.map((entry) => {
              const color = ARCHETYPE_COLORS[entry.archetype as keyof typeof ARCHETYPE_COLORS] ?? "#888";
              return (
                <Link
                  key={entry.wallet}
                  href={entry.monster_url}
                  className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-xl p-3 hover:border-gray-500 transition-colors"
                >
                  {/* Avatar placeholder */}
                  <div
                    className="w-14 h-14 rounded-full mx-auto mb-2 flex items-center justify-center font-black text-2xl"
                    style={{ background: `${color}22`, border: `2px solid ${color}44` }}
                  >
                    {entry.archetype_name[0]}
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-black truncate" style={{ color }}>
                      {entry.archetype_name}
                    </div>
                    <div className="text-[9px] text-gray-600 font-mono">{entry.wallet_short}</div>
                    <div className="text-[9px] text-gray-500 italic mt-1 leading-relaxed">
                      &ldquo;{entry.yearbook_caption}&rdquo;
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {data.entries.length === 0 && (
            <div className="text-center text-gray-600 py-12">
              <div className="text-4xl mb-3">👻</div>
              <div className="text-sm">No monsters in the yearbook yet.</div>
              <div className="text-xs text-gray-700 mt-1">Analyze some wallets first to populate the class.</div>
              <Link href="/" className="mt-4 inline-block px-4 py-2 bg-[var(--neon-green)] text-black font-black text-xs rounded-lg">
                Go Analyze Wallets
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
