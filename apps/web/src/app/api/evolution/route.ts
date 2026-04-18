import { NextRequest, NextResponse } from "next/server";
import type { CharacterState, PersonaDNA, ArchetypeId } from "@degenborn/shared";
import { checkEvolutionTrigger, attemptEvolution } from "@/lib/major-evolution";
import { createWalletClient, createPublicClient, http, keccak256, toBytes, isAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { bscTestnet } from "viem/chains";
import { canonicalizeWallet, isWalletInputSupported } from "@/lib/demo-wallets";

// Minimal SoulCore ABI — only updateState
const SOUL_CORE_ABI = [
  {
    name: "tokenOfWallet",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "wallet", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "updateState",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "newStateHash", type: "bytes32" },
      { name: "newTokenURI", type: "string" },
    ],
    outputs: [],
  },
] as const;

async function updateOnChain(
  wallet: string,
  state: CharacterState,
  metadataUri: string,
): Promise<string | null> {
  const pk = (process.env.PRIVATE_KEY ?? "").trim();
  const contractAddr = (process.env.SOUL_CORE_ADDRESS ?? "").trim();
  const rpcUrl = (process.env.BSC_TESTNET_RPC ?? "https://data-seed-prebsc-1-s1.binance.org:8545/").trim();

  if (!pk || !contractAddr) {
    console.warn("[evolution] PRIVATE_KEY or SOUL_CORE_ADDRESS not set — skipping on-chain update");
    return null;
  }

  const account = privateKeyToAccount((pk.startsWith("0x") ? pk : `0x${pk}`) as `0x${string}`);
  const address = contractAddr as `0x${string}`;
  const walletAddr = wallet.toLowerCase() as `0x${string}`;

  const publicClient = createPublicClient({ chain: bscTestnet, transport: http(rpcUrl) });
  const walletClient = createWalletClient({ account, chain: bscTestnet, transport: http(rpcUrl) });

  // Resolve tokenId
  const tokenId = await publicClient.readContract({
    address,
    abi: SOUL_CORE_ABI,
    functionName: "tokenOfWallet",
    args: [walletAddr],
  });

  if (tokenId === 0n) {
    console.warn(`[evolution] No Soul Core for ${wallet} — skipping on-chain update`);
    return null;
  }

  const newStateHash = keccak256(
    toBytes(JSON.stringify({
      level: state.level,
      mood: state.mood,
      corruption: Math.round(state.corruption),
      prestige: Math.round(state.prestige),
      scar_count: state.scar_count,
      crown_count: state.crown_count,
    }))
  );

  const txHash = await walletClient.writeContract({
    address,
    abi: SOUL_CORE_ABI,
    functionName: "updateState",
    args: [tokenId, newStateHash, metadataUri],
  });

  return txHash;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      wallet?: string;
      state_before: CharacterState;
      state_after: CharacterState;
      dna: PersonaDNA;
      archetype: ArchetypeId;
      current_image_url: string;
    };

    const { wallet, state_before, state_after, dna, archetype, current_image_url } = body;

    if (!state_before || !state_after || !dna || !archetype) {
      return NextResponse.json({ error: "state_before, state_after, dna, archetype required" }, { status: 400 });
    }

    const check = checkEvolutionTrigger(state_before, state_after);

    if (!check.should_rerender) {
      return NextResponse.json({ evolved: false, message: "No major milestone reached" });
    }

    const result = await attemptEvolution(
      archetype,
      dna,
      state_after,
      check.trigger!,
      current_image_url ?? `/archetypes/${archetype}_placeholder.svg`,
      check.evolved_seed!,
    );

    // Update on-chain if wallet address is provided and Soul Core is minted
    let txHash: string | null = null;
    if (wallet && isWalletInputSupported(wallet)) {
      const canonicalWallet = canonicalizeWallet(wallet);
      if (!isAddress(canonicalWallet)) {
        return NextResponse.json({ error: "invalid Ethereum address" }, { status: 400 });
      }

      const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").trim();
      const metadataUri = `${appUrl}/api/metadata/${canonicalWallet}`;
      try {
        txHash = await updateOnChain(canonicalWallet, state_after, metadataUri);
      } catch (err) {
        console.warn("[evolution] On-chain update failed (non-fatal):", err);
      }
    }

    return NextResponse.json({
      evolved: true,
      trigger: check.trigger,
      result,
      tx_hash: txHash,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[evolution]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
