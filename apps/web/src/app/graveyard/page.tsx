"use client";

/**
 * T-EULO-01 — Graveyard page: /graveyard
 *
 * Displays a grid of flatlined wallets.
 * In production, this would be populated from a DB query.
 * For hackathon demo, uses a static fixture list.
 */
import Link from "next/link";
import { ARCHETYPE_COLORS, ARCHETYPE_PROFILES } from "@degenborn/shared";
import type { ArchetypeId } from "@degenborn/shared";
import { formatDate } from "@/lib/flatline";

interface FlatlinedSoul {
  wallet: string;
  archetype: ArchetypeId;
  name: string;
  title: string;
  lastActiveAt: number;
  level: number;
  scar_count: number;
}

const now = Math.floor(Date.now() / 1000);

// Static fixture list — in production, replace with DB query
const FLATLINED_SOULS: FlatlinedSoul[] = [
  {
    wallet: "0xflatlineddemo00000000000000000000000001",
    archetype: "ghost_bagholder",
    name: "Wraith",
    title: "the Still-Holding",
    lastActiveAt: now - 45 * 86400,
    level: 3,
    scar_count: 4,
  },
  {
    wallet: "0xflatlineddemo00000000000000000000000002",
    archetype: "diamond_cultist",
    name: "Krag",
    title: "the Unflinching",
    lastActiveAt: now - 62 * 86400,
    level: 5,
    scar_count: 6,
  },
  {
    wallet: "0xflatlineddemo00000000000000000000000003",
    archetype: "mad_gambler",
    name: "Vex",
    title: "the All-In",
    lastActiveAt: now - 38 * 86400,
    level: 2,
    scar_count: 2,
  },
  {
    wallet: "0xflatlineddemo00000000000000000000000004",
    archetype: "rug_necromancer",
    name: "Drex",
    title: "the Thrice-Rugged",
    lastActiveAt: now - 91 * 86400,
    level: 7,
    scar_count: 8,
  },
  {
    wallet: "0xflatlineddemo00000000000000000000000005",
    archetype: "sniper_jester",
    name: "Mox",
    title: "the Missed Exit",
    lastActiveAt: now - 33 * 86400,
    level: 4,
    scar_count: 3,
  },
  {
    wallet: "0xflatlineddemo00000000000000000000000006",
    archetype: "ice_whale",
    name: "Seryn",
    title: "the Frozen",
    lastActiveAt: now - 120 * 86400,
    level: 9,
    scar_count: 1,
  },
];

function daysSinceFlatline(lastActiveAt: number): number {
  return Math.round((Math.floor(Date.now() / 1000) - lastActiveAt) / 86400);
}

export default function GraveyardPage() {
  return (
    <div className="min-h-screen pb-12">
      {/* Nav */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--degen-border)]">
        <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">← Home</Link>
        <div className="text-xs text-gray-600 font-mono uppercase tracking-widest">The Graveyard</div>
        <Link href="/gallery" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Gallery →</Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">⚰️</div>
          <h1 className="text-2xl font-black text-white mb-2">The Graveyard</h1>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Wallets that have gone dark. 30+ days of silence. Their story lives on.
          </p>
          <div className="mt-3 text-xs text-gray-700 font-mono">
            {FLATLINED_SOULS.length} souls flatlined · updated daily
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FLATLINED_SOULS.map((soul) => {
            const color = ARCHETYPE_COLORS[soul.archetype] ?? "#9945ff";
            const profile = ARCHETYPE_PROFILES[soul.archetype];
            const daysSince = daysSinceFlatline(soul.lastActiveAt);

            return (
              <Link
                key={soul.wallet}
                href={`/eulogy/${soul.wallet}`}
                className="block group"
              >
                <div
                  className="rounded-2xl p-4 border transition-all group-hover:scale-[1.02] group-hover:border-opacity-60"
                  style={{
                    background: `linear-gradient(160deg, ${color}0a 0%, #0a0a0f 100%)`,
                    borderColor: `${color}33`,
                  }}
                >
                  {/* Skull + days counter */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-2xl">💀</div>
                    <div className="text-right">
                      <div className="text-[10px] text-gray-600 font-mono">
                        {daysSince}d ago
                      </div>
                      <div className="text-[10px]" style={{ color: `${color}99` }}>
                        Lv.{soul.level}
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="mb-2">
                    <div className="text-sm font-black text-white leading-tight">
                      {soul.name}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono">{soul.title}</div>
                  </div>

                  {/* Archetype */}
                  <div className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color }}>
                    {profile.name}
                  </div>

                  {/* Stats */}
                  <div className="flex gap-3 text-[10px] text-gray-600 font-mono">
                    <span>⚔️ {soul.scar_count} scars</span>
                    <span>flatlined {formatDate(soul.lastActiveAt).replace(", 20", ", '")}</span>
                  </div>

                  {/* View eulogy CTA */}
                  <div
                    className="mt-3 text-[10px] font-mono transition-colors"
                    style={{ color: `${color}66` }}
                  >
                    View eulogy →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-12 text-center text-xs text-gray-700 space-y-1">
          <div>Flatline is declared after 30 days of inactivity.</div>
          <div>
            Activity detected?{" "}
            <span className="text-[var(--neon-green)]">Resurrection stamp will appear.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
