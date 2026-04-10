"use client";

import type { PersonaDNA, ArchetypeResult } from "@degenborn/shared";
import { ARCHETYPE_COLORS } from "@degenborn/shared";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CharacterDisplay from "@/components/CharacterDisplay";

interface Props {
  wallet: string;
  dna: PersonaDNA;
  archetype: ArchetypeResult;
}

interface MintResponse {
  dna_hash: string;
  state_hash: string;
  metadata_uri: string;
  narrative: { tagline: string; caption: string };
}

export default function MintButton({ wallet, dna, archetype }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "preparing" | "minting" | "born" | "done" | "cancelled" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [mintData, setMintData] = useState<MintResponse | null>(null);
  const [bornVisible, setBornVisible] = useState(false);

  const handleMint = async () => {
    setStatus("preparing");
    setError(null);

    try {
      // Step 1: prepare metadata
      const resp = await fetch("/api/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet, dna, archetype }),
      });

      if (!resp.ok) {
        const err = await resp.json() as { error: string };
        throw new Error(err.error ?? "Mint preparation failed");
      }

      const data = await resp.json() as MintResponse;
      setMintData(data);
      setStatus("minting");

      // Step 2: For demo — simulate on-chain mint or call real contract
      // In production: use wagmi's writeContract with SoulCore ABI
      await simulateMint();

      setStatus("born");
      setTimeout(() => setBornVisible(true), 80);
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes("cancel")) {
        setStatus("cancelled");
      } else {
        setError(e instanceof Error ? e.message : "Unknown error");
        setStatus("error");
      }
    }
  };

  // Simulate mint for demo
  async function simulateMint() {
    await new Promise((r) => setTimeout(r, 1500));
  }

  if (status === "born" || status === "done") {
    const glowColor = ARCHETYPE_COLORS[archetype.archetype as keyof typeof ARCHETYPE_COLORS] ?? "#9945ff";
    return (
      <div
        className={`flex flex-col items-center gap-6 transition-all duration-700 ${bornVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      >
        <div
          className="relative p-2 rounded-2xl"
          style={{ boxShadow: `0 0 40px ${glowColor}66` }}
        >
          <CharacterDisplay
            archetype={archetype.archetype as any}
            state={{
              wallet_address: wallet,
              archetype: archetype.archetype as any,
              level: 1,
              mood: "neutral",
              corruption: 0,
              prestige: 0,
              scar_count: 0,
              crown_count: 0,
              survival_streak: 0,
              active_traits: [],
            }}
            wallet={wallet}
            size={200}
          />
        </div>
        <div className="text-center">
          <div className="text-[var(--neon-green)] text-xl font-black mb-1">✓ SOUL CORE BORN</div>
          <div className="text-gray-400 text-sm mb-1">"{archetype.profile.tagline}"</div>
          <div className="text-xs text-gray-600 font-mono">Soulbound · Non-transferable · Yours alone</div>
        </div>
        <button
          onClick={() => router.push(`/monster?wallet=${wallet}`)}
          className="px-10 py-3 bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-green)] text-black font-black rounded-xl hover:brightness-110 transition-all"
        >
          Enter Monster Room →
        </button>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="text-center">
        <div className="text-yellow-500 text-sm mb-4">Transaction cancelled</div>
        <button
          onClick={() => setStatus("idle")}
          className="px-6 py-2 border border-[var(--border)] text-gray-400 rounded hover:border-gray-400 transition-colors text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      {/* Demo mode notice */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full bg-yellow-900/30 border border-yellow-600/40 text-yellow-400 text-xs font-mono">
        ⚠ Demo mode — mint is simulated
      </div>

      {status === "error" && (
        <div className="text-red-500 text-sm mb-4">{error}</div>
      )}

      {mintData?.narrative && (
        <div className="text-[var(--neon-gold)] text-sm font-mono italic mb-4 px-4">
          "{mintData.narrative.tagline}"
        </div>
      )}

      <button
        onClick={handleMint}
        disabled={status === "preparing" || status === "minting"}
        className="px-12 py-4 bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-green)] text-black font-black text-lg rounded-xl hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "preparing"
          ? "PREPARING..."
          : status === "minting"
          ? "MINTING (SIMULATED)..."
          : "MINT SOUL CORE"}
      </button>

      <div className="mt-3 text-xs text-gray-600">
        Soulbound NFT · 1 per wallet · Non-transferable
      </div>

      <div className="mt-4">
        <button
          onClick={() => router.push(`/monster?wallet=${wallet}`)}
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          Skip mint → Enter Monster Room
        </button>
      </div>
    </div>
  );
}
