import { NextRequest, NextResponse } from "next/server";
import { keccak256, toBytes } from "viem";
import type { PersonaDNA, ArchetypeResult } from "@degenborn/shared";
import { generateNarrative } from "@/lib/narrative";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet, dna, archetype } = body as {
      wallet: string;
      dna: PersonaDNA;
      archetype: ArchetypeResult;
    };

    if (!wallet || !dna || !archetype) {
      return NextResponse.json({ error: "wallet, dna, archetype required" }, { status: 400 });
    }

    // Generate deterministic DNA hash (viem keccak256 — Node.js crypto doesn't support keccak256 digest)
    const dnaHash = keccak256(
      toBytes(JSON.stringify({ aggression: dna.aggression, conviction: dna.conviction, chaos: dna.chaos, luck: dna.luck, survival: dna.survival }))
    ).slice(2); // strip 0x prefix for storage

    // Build metadata
    const narrative = await generateNarrative(dna, archetype);
    const metadata = {
      name: `DegenBorn Soul Core — ${archetype.profile.name}`,
      description: narrative.long_description,
      image: `/api/genesis-image/${wallet.toLowerCase()}`,
      external_url: `${process.env.NEXT_PUBLIC_APP_URL}/monster?wallet=${wallet}`,
      attributes: [
        { trait_type: "Archetype", value: archetype.profile.name },
        { trait_type: "Aggression", value: dna.aggression, display_type: "number" },
        { trait_type: "Conviction", value: dna.conviction, display_type: "number" },
        { trait_type: "Chaos", value: dna.chaos, display_type: "number" },
        { trait_type: "Luck", value: dna.luck, display_type: "number" },
        { trait_type: "Survival", value: dna.survival, display_type: "number" },
      ],
    };

    // For demo: return the metadata and the hash needed for on-chain mint
    // In production: upload metadata to IPFS and return CID
    const metadataUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/metadata/${wallet.toLowerCase()}`;
    const stateHash = keccak256(
      toBytes(JSON.stringify({ level: 1, mood: "neutral", corruption: 0 }))
    ).slice(2);

    return NextResponse.json({
      metadata,
      metadata_uri: metadataUri,
      dna_hash: `0x${dnaHash}`,
      state_hash: `0x${stateHash}`,
      archetype: archetype.archetype,
      narrative,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[mint]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
