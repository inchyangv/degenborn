"use client";

import { useRouter } from "next/navigation";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useState } from "react";
import Link from "next/link";
import CharacterDisplay from "@/components/CharacterDisplay";
import type { CharacterState, ArchetypeId } from "@degenborn/shared";
import { ARCHETYPE_PROFILES } from "@degenborn/shared";

const ARCHETYPE_NAMES = [
  "Mad Gambler",
  "Ice Whale",
  "Rug Necromancer",
  "Diamond Cultist",
  "Sniper Jester",
  "Ghost Bagholder",
];

const SAMPLE_MONSTERS: Array<{
  archetype: ArchetypeId;
  wallet: string;
  wallet_short: string;
  state: CharacterState;
}> = [
  {
    archetype: "rug_necromancer",
    wallet: "0xrugnecromancer000000000000000000000000001",
    wallet_short: "0xrugN...0001",
    state: {
      wallet_address: "0xrugnecromancer000000000000000000000000001",
      archetype: "rug_necromancer",
      level: 5,
      mood: "revenge",
      corruption: 40,
      prestige: 15,
      scar_count: 2,
      crown_count: 1,
      survival_streak: 3,
      active_traits: ["zombie_eyes", "crown", "revenge_aura", "bandage"],
    },
  },
  {
    archetype: "ice_whale",
    wallet: "0xicewhale000000000000000000000000000000001",
    wallet_short: "0xiceW...0001",
    state: {
      wallet_address: "0xicewhale000000000000000000000000000000001",
      archetype: "ice_whale",
      level: 7,
      mood: "neutral",
      corruption: 0,
      prestige: 75,
      scar_count: 0,
      crown_count: 3,
      survival_streak: 2,
      active_traits: ["crown", "gold_chain", "royal_cloak", "gold_tooth"],
    },
  },
  {
    archetype: "mad_gambler",
    wallet: "0xmadgambler0000000000000000000000000000001",
    wallet_short: "0xmadG...0001",
    state: {
      wallet_address: "0xmadgambler0000000000000000000000000000001",
      archetype: "mad_gambler",
      level: 3,
      mood: "greed",
      corruption: 0,
      prestige: 10,
      scar_count: 1,
      crown_count: 1,
      survival_streak: 0,
      active_traits: ["crown", "torn_clothes"],
    },
  },
];

const STEPS = [
  {
    icon: "🔗",
    title: "Connect",
    desc: "Link your wallet. We read your Four.meme activity.",
  },
  {
    icon: "🧬",
    title: "Awaken",
    desc: "5 DNA axes are computed. Your archetype is revealed.",
  },
  {
    icon: "⚡",
    title: "Evolve",
    desc: "Every trade shapes your monster. Traits. Scars. Crowns.",
  },
];

const ARCHETYPE_COLORS: Record<string, string> = {
  mad_gambler: "#ff3d3d",
  ice_whale: "#00d4ff",
  rug_necromancer: "#9945ff",
  diamond_cultist: "#88ccff",
  sniper_jester: "#ffd700",
  ghost_bagholder: "#aaaaaa",
};

export default function LandingPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [analyzeLoading, setAnalyzeLoading] = useState(false);

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  const handleAnalyze = () => {
    if (!address) return;
    setAnalyzeLoading(true);
    router.push(`/birth?wallet=${address}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16 relative">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="text-xs tracking-[0.4em] text-[var(--neon-purple)] mb-4 uppercase">
          Four.meme × AI Identity Engine
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-4 glitch-text" data-text="DEGENBORN">
          DEGEN<span className="text-[var(--neon-green)]">BORN</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Your wallet tells a story. We make it a monster.
        </p>
      </div>

      {/* Archetype ticker */}
      <div className="mb-8 flex flex-wrap gap-2 justify-center max-w-lg">
        {ARCHETYPE_NAMES.map((name) => (
          <span
            key={name}
            className="px-3 py-1 text-xs border border-[var(--border)] text-gray-500 rounded-full"
          >
            {name}
          </span>
        ))}
      </div>

      {/* CTA */}
      {!isConnected ? (
        <button
          onClick={handleConnect}
          disabled={isPending}
          className="px-10 py-4 bg-[var(--neon-green)] text-black font-black text-lg rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
        >
          {isPending ? "CONNECTING..." : "CONNECT WALLET"}
        </button>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="text-sm text-[var(--neon-green)] font-mono">
            {address?.slice(0, 6)}...{address?.slice(-4)} ✓
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzeLoading}
            className="px-10 py-4 bg-[var(--neon-purple)] text-white font-black text-lg rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
          >
            {analyzeLoading ? "AWAKENING..." : "AWAKEN MY MONSTER"}
          </button>
          <button
            onClick={() => disconnect()}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            disconnect
          </button>
        </div>
      )}

      {/* 3-step explainer */}
      <div className="mt-16 w-full max-w-2xl">
        <div className="text-xs text-gray-600 uppercase tracking-widest text-center mb-6">How it works</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl p-5 text-center"
            >
              <div className="text-3xl mb-3">{step.icon}</div>
              <div className="font-black text-white mb-1">{step.title}</div>
              <div className="text-xs text-gray-500">{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sample monsters */}
      <div className="mt-16 w-full max-w-3xl">
        <div className="text-xs text-gray-600 uppercase tracking-widest text-center mb-6">Sample monsters</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLE_MONSTERS.map((m) => {
            const profile = ARCHETYPE_PROFILES[m.archetype];
            const color = ARCHETYPE_COLORS[m.archetype] ?? "#9945ff";
            return (
              <div
                key={m.wallet}
                className="bg-[var(--degen-card)] border rounded-2xl overflow-hidden hover:scale-[1.02] transition-all"
                style={{ borderColor: `${color}44` }}
              >
                <div
                  className="flex items-center justify-center py-5"
                  style={{ background: `radial-gradient(circle at 50% 60%, ${color}22, #0a0a0f)` }}
                >
                  <CharacterDisplay
                    archetype={m.archetype}
                    state={m.state}
                    wallet={m.wallet}
                    size={150}
                  />
                </div>
                <div className="p-4 text-center">
                  <div className="text-xs font-mono text-gray-600 mb-0.5">{m.wallet_short}</div>
                  <div className="font-black text-white text-base">{profile.name}</div>
                  <div className="text-xs font-mono mb-3" style={{ color }}>"{profile.tagline}"</div>
                  <Link
                    href={`/monster?wallet=${m.wallet}`}
                    className="block text-center py-1.5 text-xs border rounded-lg transition-colors"
                    style={{ borderColor: `${color}44`, color }}
                  >
                    View Monster →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Demo / Replay / Gallery links */}
      <div className="mt-12 text-center flex flex-col gap-2">
        <Link
          href="/replay"
          className="text-sm text-gray-600 hover:text-[var(--neon-purple)] transition-colors"
        >
          → Watch the demo (Replay Mode)
        </Link>
        <Link
          href="/gallery"
          className="text-sm text-gray-600 hover:text-[var(--neon-green)] transition-colors"
        >
          → Monster Gallery (compare archetypes)
        </Link>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center text-xs text-gray-700 space-y-1">
        <div>Built for Four.meme Hackathon · Chain: BNB Smart Chain</div>
        <div className="flex justify-center gap-4 mt-2">
          <span className="text-gray-800">What is Soul Core?</span>
          <span className="text-gray-800">·</span>
          <Link
            href="https://four.meme"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-500 transition-colors"
          >
            What is Four.meme?
          </Link>
          <span className="text-gray-800">·</span>
          <span className="text-gray-800">How is DNA calculated?</span>
        </div>
      </div>
    </main>
  );
}
