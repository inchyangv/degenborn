"use client";

import { useRouter } from "next/navigation";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useState } from "react";
import Link from "next/link";

const ARCHETYPE_NAMES = [
  "Mad Gambler",
  "Ice Whale",
  "Rug Necromancer",
  "Diamond Cultist",
  "Sniper Jester",
  "Ghost Bagholder",
];

export default function LandingPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [analyzeLoading, setAnalyzeLoading] = useState(false);

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  const handleAnalyze = async () => {
    if (!address) return;
    setAnalyzeLoading(true);
    router.push(`/birth?wallet=${address}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="text-xs tracking-[0.4em] text-[var(--neon-purple)] mb-4 uppercase">
          Four.meme × AI Identity Engine
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-4">
          DEGEN
          <span className="text-[var(--neon-green)]">BORN</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Your wallet tells a story. We make it a monster.
        </p>
      </div>

      {/* Archetype ticker */}
      <div className="mb-10 flex flex-wrap gap-2 justify-center max-w-lg">
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
          className="px-10 py-4 bg-[var(--neon-green)] text-black font-black text-lg rounded-lg hover:brightness-110 transition-all animate-pulse-glow disabled:opacity-50"
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

      {/* Demo / Replay link */}
      <div className="mt-12 text-center">
        <Link
          href="/replay"
          className="text-sm text-gray-600 hover:text-[var(--neon-purple)] transition-colors"
        >
          → Watch the demo (Replay Mode)
        </Link>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-gray-700">
        Built for Four.meme Hackathon · Chain: BNB Smart Chain
      </div>
    </main>
  );
}
