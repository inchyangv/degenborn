import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import type { PersonaDNA, ArchetypeId, CharacterState } from "@degenborn/shared";
import { generateGenesisImage } from "@/lib/image-pipeline";
import { setImageUrl } from "@/lib/profile-store";

interface GenesisRequest {
  wallet: string;
  dna: PersonaDNA;
  archetype: ArchetypeId;
  state?: Partial<CharacterState>;
}

/**
 * POST /api/genesis
 * Generates (or returns cached) genesis image metadata.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenesisRequest;
    const { wallet, dna, archetype, state } = body;

    if (!wallet || !dna || !archetype) {
      return NextResponse.json({ error: "wallet, dna, archetype required" }, { status: 400 });
    }
    if (!isAddress(wallet.toLowerCase())) {
      return NextResponse.json({ error: "invalid Ethereum address" }, { status: 400 });
    }

    const result = await generateGenesisImage(wallet, dna, archetype, state);
    // T3-02: persist image URL so Monster Room and share card can use it
    if (!result.is_placeholder) {
      setImageUrl(wallet.toLowerCase(), result.url);
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

