/**
 * GET /api/relic/eligible?wallet=0x...
 *
 * Returns which Snapshot Relic milestones the wallet has reached
 * and whether each has already been minted (on-chain check when contract is configured).
 *
 * Response:
 * {
 *   wallet: string,
 *   eligible: Array<{
 *     milestone_type: number,
 *     name: string,
 *     minted: boolean,
 *     is_transferable: true,   // Snapshot Relics are always transferable (ERC-721)
 *   }>,
 *   any_new: boolean,          // true if at least one eligible + unminted milestone
 * }
 */
import { NextRequest, NextResponse } from "next/server";
import { isAddress, createPublicClient, http } from "viem";
import { bscTestnet } from "viem/chains";
import type { CharacterState } from "@degenborn/shared";
import { getEligibleMilestones, MILESTONE_NAMES } from "@/lib/relic-milestones";
import { canonicalizeWallet, isDemoWallet, isWalletInputSupported } from "@/lib/demo-wallets";
import { getProfileStore } from "@/lib/profile-store";

const SNAPSHOT_RELIC_ABI = [
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

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const rawWallet = searchParams.get("wallet") ?? "";
  const wallet = canonicalizeWallet(rawWallet) as `0x${string}`;

  if (!isWalletInputSupported(wallet) || !isAddress(wallet)) {
    return NextResponse.json({ error: "invalid wallet address" }, { status: 400 });
  }

  // Load current character state for milestone evaluation
  const profile = getProfileStore(wallet);
  const state = profile?.character_state ?? ({
    wallet_address: wallet,
    archetype: profile?.archetype ?? "rug_necromancer",
    level: 1, mood: "neutral" as const, corruption: 0, prestige: 0,
    scar_count: 0, crown_count: 0, survival_streak: 0,
    active_traits: [], updated_at: 0,
  } as CharacterState);

  const eligibleIndices = getEligibleMilestones(state);

  // For demo wallets: mark as unminted (always mintable for demo)
  if (isDemoWallet(wallet)) {
    const eligible = eligibleIndices.map((idx) => ({
      milestone_type: idx,
      name: MILESTONE_NAMES[idx],
      description: getMilestoneDescription(idx),
      minted: false,
      is_transferable: true,
    }));
    return NextResponse.json({
      wallet, eligible, any_new: eligible.length > 0,
      note: "Demo mode — minting simulated",
    });
  }

  // For real wallets: check on-chain if configured
  const contractAddr = (process.env.SNAPSHOT_RELIC_ADDRESS ?? "").trim();
  const rpcUrl = (process.env.BSC_TESTNET_RPC ?? "https://data-seed-prebsc-1-s1.binance.org:8545/").trim();

  let mintedSet = new Set<number>();
  if (contractAddr && isAddress(contractAddr)) {
    try {
      const publicClient = createPublicClient({ chain: bscTestnet, transport: http(rpcUrl) });
      const counts = await Promise.all(
        eligibleIndices.map((idx) =>
          publicClient.readContract({
            address: contractAddr as `0x${string}`,
            abi: SNAPSHOT_RELIC_ABI,
            functionName: "walletMilestoneCount",
            args: [wallet, idx],
          }),
        ),
      );
      counts.forEach((count, i) => {
        if (count > 0n) mintedSet.add(eligibleIndices[i]);
      });
    } catch {
      // On-chain check failed — treat all as unminted so user can still try
    }
  }

  const eligible = eligibleIndices.map((idx) => ({
    milestone_type: idx,
    name: MILESTONE_NAMES[idx],
    description: getMilestoneDescription(idx),
    minted: mintedSet.has(idx),
    is_transferable: true,
  }));

  return NextResponse.json({
    wallet,
    eligible,
    any_new: eligible.some((e) => !e.minted),
  });
}

function getMilestoneDescription(idx: number): string {
  const descriptions: Record<number, string> = {
    0: "Achieved your first crowned win. still here. somehow.",
    1: "Survived 3+ rugs and lived to trade again. certified undead.",
    2: "Climbed back from the grave — survival streak unlocked.",
    3: "80%+ corruption. fully zombified. chaos ascended.",
    4: "50+ prestige. diamond hands, stone cold conviction.",
    5: "Ghost mode activated. haunting the markets from beyond.",
  };
  return descriptions[idx] ?? "Rare milestone reached.";
}
