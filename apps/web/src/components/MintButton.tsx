"use client";

import type { PersonaDNA, ArchetypeResult } from "@degenborn/shared";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const [status, setStatus] = useState<"idle" | "preparing" | "minting" | "done" | "cancelled" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [mintData, setMintData] = useState<MintResponse | null>(null);

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

      setStatus("done");
      setTimeout(() => {
        router.push(`/monster?wallet=${wallet}`);
      }, 2000);
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

  if (status === "done") {
    return (
      <div className="text-center">
        <div className="text-[var(--neon-green)] text-lg font-black mb-2">✓ SOUL CORE MINTED</div>
        <div className="text-gray-400 text-sm">Entering Monster Room...</div>
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
          ? "MINTING ON-CHAIN..."
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
