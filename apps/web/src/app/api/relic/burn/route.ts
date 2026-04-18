/**
 * POST /api/relic/burn
 *
 * 4.2: Burn-to-Boost — burn a Snapshot Relic to permanently boost Soul Core stat +5.
 *
 * Flow:
 * 1. Caller provides wallet + relic token_id + stat to boost
 * 2. API verifies relic ownership (on-chain or demo)
 * 3. Calls burn() on SnapshotRelic contract (destroys token)
 * 4. Applies permanent +5 to the chosen stat in CharacterState
 * 5. Returns updated state
 *
 * Request body: { wallet, token_id, boost_stat: "prestige" | "luck" | "survival" | "conviction" }
 * Response: { success, boosted_stat, new_value, tx_hash? }
 */
import { NextRequest, NextResponse } from "next/server";
import { isAddress, createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { bscTestnet } from "viem/chains";
import type { CharacterState } from "@degenborn/shared";
import { canonicalizeWallet, isDemoWallet, isWalletInputSupported } from "@/lib/demo-wallets";
import { getProfileStore, setCharacterState } from "@/lib/profile-store";
import { createInitialState } from "@/lib/state-machine";

const VALID_BOOST_STATS = ["prestige", "survival_streak", "crown_count"] as const;
type BoostStat = typeof VALID_BOOST_STATS[number];

const BURN_BOOST_AMOUNT = 5;

const SNAPSHOT_RELIC_ABI = [
  {
    name: "burn",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "ownerOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as {
      wallet: string;
      token_id: string;
      boost_stat: string;
    };

    const { wallet, token_id, boost_stat } = body;

    if (!wallet || !token_id || !boost_stat) {
      return NextResponse.json({ error: "wallet, token_id, boost_stat required" }, { status: 400 });
    }

    const walletAddr = canonicalizeWallet(wallet) as `0x${string}`;
    if (!isWalletInputSupported(walletAddr) || !isAddress(walletAddr)) {
      return NextResponse.json({ error: "invalid wallet address" }, { status: 400 });
    }

    if (!VALID_BOOST_STATS.includes(boost_stat as BoostStat)) {
      return NextResponse.json({ error: `boost_stat must be one of: ${VALID_BOOST_STATS.join(", ")}` }, { status: 400 });
    }

    const stat = boost_stat as BoostStat;
    const tokenId = BigInt(token_id);

    // Get current state
    const profile = getProfileStore(walletAddr);
    const archetype = (profile?.archetype ?? "rug_necromancer") as import("@degenborn/shared").ArchetypeId;
    const currentState: CharacterState = profile?.character_state
      ?? createInitialState(walletAddr, archetype);

    if (isDemoWallet(walletAddr)) {
      // Demo: simulate burn without on-chain call
      const newState: CharacterState = {
        ...currentState,
        [stat]: Math.min(100, (currentState[stat] ?? 0) + BURN_BOOST_AMOUNT),
        updated_at: Math.floor(Date.now() / 1000),
      };
      setCharacterState(walletAddr, newState);
      return NextResponse.json({
        success: true,
        demo_mode: true,
        boosted_stat: stat,
        old_value: currentState[stat] ?? 0,
        new_value: newState[stat],
        boost_amount: BURN_BOOST_AMOUNT,
        message: `${stat} permanently boosted +${BURN_BOOST_AMOUNT} (demo mode)`,
      });
    }

    // Real wallet: verify ownership and burn on-chain
    const pk = (process.env.PRIVATE_KEY ?? "").trim();
    const contractAddr = (process.env.SNAPSHOT_RELIC_ADDRESS ?? "").trim();
    const rpcUrl = (process.env.BSC_TESTNET_RPC ?? "https://data-seed-prebsc-1-s1.binance.org:8545/").trim();

    if (!pk || !contractAddr || !isAddress(contractAddr)) {
      return NextResponse.json({ error: "PRIVATE_KEY or SNAPSHOT_RELIC_ADDRESS not configured" }, { status: 500 });
    }

    const account = privateKeyToAccount((pk.startsWith("0x") ? pk : `0x${pk}`) as `0x${string}`);
    const publicClient = createPublicClient({ chain: bscTestnet, transport: http(rpcUrl) });
    const walletClient = createWalletClient({ account, chain: bscTestnet, transport: http(rpcUrl) });
    const address = contractAddr as `0x${string}`;

    // Verify ownership
    const owner = await publicClient.readContract({
      address, abi: SNAPSHOT_RELIC_ABI, functionName: "ownerOf", args: [tokenId],
    });

    if (owner.toLowerCase() !== walletAddr.toLowerCase()) {
      return NextResponse.json({ error: "wallet does not own this relic" }, { status: 403 });
    }

    // Burn
    const txHash = await walletClient.writeContract({
      address, abi: SNAPSHOT_RELIC_ABI, functionName: "burn", args: [tokenId],
    });
    await publicClient.waitForTransactionReceipt({ hash: txHash });

    // Apply boost to character state
    const newState: CharacterState = {
      ...currentState,
      [stat]: Math.min(100, (currentState[stat] ?? 0) + BURN_BOOST_AMOUNT),
      updated_at: Math.floor(Date.now() / 1000),
    };
    setCharacterState(walletAddr, newState);

    return NextResponse.json({
      success: true,
      tx_hash: txHash,
      boosted_stat: stat,
      old_value: currentState[stat] ?? 0,
      new_value: newState[stat],
      boost_amount: BURN_BOOST_AMOUNT,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[relic/burn]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
