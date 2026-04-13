"use client";

import Link from "next/link";
import { ARCHETYPE_COLORS, ARCHETYPE_PROFILES } from "@degenborn/shared";
import type { ArchetypeId, PersonaDNA } from "@degenborn/shared";

interface Props {
  wallet: string;
  archetype: ArchetypeId | "unknown";
  dna: PersonaDNA | null;
}

const ARCHETYPE_EMOJI: Record<string, string> = {
  mad_gambler: "🎲",
  ice_whale: "🐋",
  rug_necromancer: "💀",
  diamond_cultist: "💎",
  sniper_jester: "🎯",
  ghost_bagholder: "👻",
};

export default function ChallengeClient({ wallet, archetype, dna }: Props) {
  const color = (ARCHETYPE_COLORS as Record<string, string>)[archetype] ?? "#9945ff";
  const profile = archetype !== "unknown" ? ARCHETYPE_PROFILES[archetype as ArchetypeId] : null;
  const short = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  const emoji = ARCHETYPE_EMOJI[archetype] ?? "⚔";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 pb-16"
      style={{ background: `radial-gradient(ellipse at 50% 30%, ${color}11, #050508 70%)` }}
    >
      <div className="max-w-md w-full text-center">
        {/* Header */}
        <div className="text-xs text-gray-600 font-mono uppercase tracking-widest mb-6">
          DegenBorn · Challenge
        </div>

        {/* Challenger card */}
        <div
          className="rounded-2xl p-8 mb-8 border"
          style={{ borderColor: `${color}44`, background: `${color}08` }}
        >
          {/* Emoji / archetype visual */}
          <div
            className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl"
            style={{
              background: `radial-gradient(circle, ${color}33, ${color}0a)`,
              border: `2px solid ${color}55`,
            }}
          >
            {emoji}
          </div>

          {/* Challenge header */}
          <div className="text-gray-500 text-sm mb-2 font-mono">{short}</div>

          {profile ? (
            <>
              <div className="text-xs text-gray-600 uppercase tracking-widest mb-2">is a</div>
              <div className="text-4xl font-black mb-2" style={{ color }}>
                {profile.name}
              </div>
              <div className="text-sm italic text-gray-400 mb-4">
                &ldquo;{profile.tagline}&rdquo;
              </div>
            </>
          ) : (
            <div className="text-2xl font-black text-gray-400 mb-4">Unknown Monster</div>
          )}

          {/* DNA mini bars (if available) */}
          {dna && (
            <div className="space-y-1.5 text-left mt-4">
              {([
                ["AGG", dna.aggression, "#FF4444"],
                ["CON", dna.conviction, "#4488FF"],
                ["CHA", dna.chaos, "#FF8800"],
                ["LCK", dna.luck, "#44FF88"],
                ["SRV", dna.survival, color],
              ] as [string, number, string][]).map(([label, val, c]) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-8 text-[10px] font-mono text-gray-600">{label}</div>
                  <div className="flex-1 h-1 bg-[var(--degen-muted)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${val}%`, background: c }} />
                  </div>
                  <div className="w-5 text-[10px] text-right font-mono" style={{ color: c }}>{val}</div>
                </div>
              ))}
            </div>
          )}

          {/* Challenge tagline */}
          <div
            className="mt-6 text-base font-black"
            style={{ color }}
          >
            Are you brave enough?
          </div>
        </div>

        {/* CTA — connect to accept */}
        <Link
          href={`/?from=${wallet}`}
          className="block w-full py-5 font-black text-lg rounded-2xl text-black hover:brightness-110 transition-all mb-4"
          style={{ background: color }}
        >
          ⚔ Connect Wallet to Accept
        </Link>

        <Link
          href="/quiz"
          className="block w-full py-3 font-bold text-sm rounded-xl border hover:opacity-80 transition-all text-gray-500"
          style={{ borderColor: `${color}33` }}
        >
          Not ready? Try the quiz first →
        </Link>

        <div className="mt-6 text-xs text-gray-700 font-mono">
          Challenge from {short} · DegenBorn × Four.meme
        </div>
      </div>
    </div>
  );
}
