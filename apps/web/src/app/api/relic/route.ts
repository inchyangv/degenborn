/**
 * POST /api/relic
 *
 * Mints a Snapshot Relic NFT for a wallet that has reached a milestone.
 * SnapshotRelic.mint() is onlyOwner — deployer signs on behalf of wallet.
 *
 * Request body: { wallet, milestone_type, state, archetype }
 * Response: { tx_hash, token_id, milestone }
 *
 * Milestone types (match SnapshotRelic.MilestoneType enum):
 *   0 = FIRST_CROWNED_WIN
 *   1 = RUG_SURVIVOR
 *   2 = SEVEN_DAY_RESURRECTION
 *   3 = CHAOS_ASCENSION
 *   4 = DIAMOND_HANDS
 *   5 = GHOST_AWAKENING
 */
import { NextRequest, NextResponse } from "next/server";
import { isAddress, createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { bscTestnet } from "viem/chains";
import type { CharacterState, ArchetypeResult } from "@degenborn/shared";
import { getAppUrl } from "@/lib/runtime-env";
import { MILESTONE_NAMES } from "@/lib/relic-milestones";

const SNAPSHOT_RELIC_ABI = [
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "milestone", type: "uint8" },
      { name: "tokenURI_", type: "string" },
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  {
    name: "walletMilestoneCount",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "wallet", type: "address" },
      { name: "milestone", type: "uint8" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      wallet: string;
      milestone_type: number;
      state?: CharacterState;
      archetype?: ArchetypeResult;
    };

    const { wallet, milestone_type } = body;

    if (!wallet || milestone_type === undefined || milestone_type === null) {
      return NextResponse.json({ error: "wallet and milestone_type required" }, { status: 400 });
    }

    const walletAddr = wallet.toLowerCase() as `0x${string}`;
    if (!isAddress(walletAddr)) {
      return NextResponse.json({ error: "invalid Ethereum address" }, { status: 400 });
    }

    const milestoneIndex = Number(milestone_type);
    if (milestoneIndex < 0 || milestoneIndex > 5) {
      return NextResponse.json({ error: "milestone_type must be 0–5" }, { status: 400 });
    }

    const pk = (process.env.PRIVATE_KEY ?? "").trim();
    const contractAddr = (process.env.SNAPSHOT_RELIC_ADDRESS ?? "").trim();
    const rpcUrl = (process.env.BSC_TESTNET_RPC ?? "https://data-seed-prebsc-1-s1.binance.org:8545/").trim();

    if (!pk || !contractAddr) {
      return NextResponse.json({ error: "PRIVATE_KEY or SNAPSHOT_RELIC_ADDRESS not configured" }, { status: 500 });
    }

    const account = privateKeyToAccount((pk.startsWith("0x") ? pk : `0x${pk}`) as `0x${string}`);
    const address = contractAddr as `0x${string}`;

    const publicClient = createPublicClient({ chain: bscTestnet, transport: http(rpcUrl) });
    const walletClient = createWalletClient({ account, chain: bscTestnet, transport: http(rpcUrl) });

    // Check if already minted for this milestone
    const existingCount = await publicClient.readContract({
      address,
      abi: SNAPSHOT_RELIC_ABI,
      functionName: "walletMilestoneCount",
      args: [walletAddr, milestoneIndex],
    });

    if (existingCount > 0n) {
      return NextResponse.json({
        already_minted: true,
        milestone: MILESTONE_NAMES[milestoneIndex],
        milestone_type: milestoneIndex,
      });
    }

    // Build tokenURI
    const appUrl = getAppUrl();
    const tokenUri = `${appUrl}/api/metadata/${walletAddr}?milestone=${milestoneIndex}`;

    // Mint
    const txHash = await walletClient.writeContract({
      address,
      abi: SNAPSHOT_RELIC_ABI,
      functionName: "mint",
      args: [walletAddr, milestoneIndex, tokenUri],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    // Parse token ID from logs
    let tokenId: string | null = null;
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() === address.toLowerCase() && log.topics[2]) {
        tokenId = BigInt(log.topics[2]).toString();
        break;
      }
    }

    return NextResponse.json({
      tx_hash: txHash,
      token_id: tokenId,
      milestone: MILESTONE_NAMES[milestoneIndex],
      milestone_type: milestoneIndex,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[relic]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
