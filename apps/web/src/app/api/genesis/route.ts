import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import type { PersonaDNA, ArchetypeId, CharacterState } from "@degenborn/shared";
import { generateGenesisImage } from "@/lib/image-pipeline";
import { setImageUrl } from "@/lib/profile-store";
import { persistImageUrl } from "@/lib/image-store";
import { canonicalizeWallet, isWalletInputSupported } from "@/lib/demo-wallets";

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
    const canonicalWallet = canonicalizeWallet(wallet);
    if (!isWalletInputSupported(canonicalWallet) || !isAddress(canonicalWallet)) {
      return NextResponse.json({ error: "invalid Ethereum address" }, { status: 400 });
    }

    const result = await generateGenesisImage(canonicalWallet, dna, archetype, state);
    // T3-02 + T5-02: persist image URL so Monster Room and share card can use it
    if (!result.is_placeholder) {
      // T5-02: copy to Vercel Blob for permanent storage (no-op if BLOB_READ_WRITE_TOKEN absent)
      const stableUrl = await persistImageUrl(result.url, `genesis/${canonicalWallet}.png`);
      const finalUrl = stableUrl !== result.url ? stableUrl : result.url;
      setImageUrl(canonicalWallet, finalUrl);
      return NextResponse.json({ ...result, url: finalUrl });
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
