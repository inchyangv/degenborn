"use client";

/**
 * T-INV-01 — Summoning Banner.
 *
 * Shown on landing when visitor arrives via `?from=0x...` challenge link.
 * Displays the inviting soul's name + archetype and a strong Connect CTA.
 */

import { useEffect, useState } from "react";
import type { ArchetypeResult, PersonaDNA } from "@degenborn/shared";
import { ARCHETYPE_COLORS, ARCHETYPE_PROFILES } from "@degenborn/shared";
import { generateCharacterName } from "@degenborn/archetype";

interface SummonerInfo {
  archetype: ArchetypeResult;
  dna: PersonaDNA;
  name: string;
  title: string;
  full: string;
}

interface Props {
  fromWallet: string;
  onConnect?: () => void;
}

export default function SummoningBanner({ fromWallet, onConnect }: Props) {
  const [summoner, setSummoner] = useState<SummonerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!fromWallet) return;
    const load = async () => {
      try {
        const resp = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: fromWallet, useFixture: true }),
        });
        if (!resp.ok) return;
        const { dna, archetype } = (await resp.json()) as { dna: PersonaDNA; archetype: ArchetypeResult };
        const charName = generateCharacterName(fromWallet, archetype.archetype);
        setSummoner({
          archetype,
          dna,
          name: charName.name,
          title: charName.title,
          full: charName.full,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fromWallet]);

  if (loading) {
    return (
      <div className="w-full py-3 px-4 text-xs text-center opacity-40 animate-pulse">
        Loading summoner...
      </div>
    );
  }

  if (!summoner) return null;

  const color = ARCHETYPE_COLORS[summoner.archetype.archetype] ?? "#9945ff";
  const profile = ARCHETYPE_PROFILES[summoner.archetype.archetype];
  const shortWallet = `${fromWallet.slice(0, 6)}...${fromWallet.slice(-4)}`;

  return (
    <div
      className="w-full rounded-lg border p-4 space-y-3 text-center"
      style={{ borderColor: color, background: `${color}10` }}
    >
      {/* Summoning header */}
      <div className="space-y-0.5">
        <div className="text-xs tracking-widest uppercase opacity-50" style={{ color }}>
          You have been summoned
        </div>
        <div className="text-xl font-bold" style={{ color }}>
          {summoner.full}
        </div>
        <div className="text-sm opacity-60">
          the {profile.name} · {shortWallet}
        </div>
      </div>

      {/* Archetype tagline */}
      <div
        className="text-xs italic opacity-70 px-4 py-2 rounded"
        style={{ background: `${color}18` }}
      >
        &ldquo;{profile.tagline}&rdquo;
      </div>

      {/* CTA */}
      <div className="space-y-2">
        <div className="text-sm opacity-80">
          <strong>{summoner.name}</strong> has challenged you to reveal your soul.
        </div>
        {onConnect && (
          <button
            onClick={onConnect}
            className="w-full py-3 text-sm font-bold rounded-lg tracking-widest uppercase transition-all"
            style={{
              background: color,
              color: "#000",
              boxShadow: `0 0 20px ${color}66`,
            }}
          >
            Reveal Your Soul →
          </button>
        )}
        <a
          href={`/m/${fromWallet}`}
          className="block text-xs opacity-40 hover:opacity-70 transition-opacity underline"
        >
          View {summoner.name}&apos;s Monster Room instead
        </a>
      </div>
    </div>
  );
}
