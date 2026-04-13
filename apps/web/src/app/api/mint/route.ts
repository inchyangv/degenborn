import { NextRequest, NextResponse } from "next/server";
import { keccak256, toBytes, isAddress, createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { bscTestnet } from "viem/chains";
import type { PersonaDNA, ArchetypeResult } from "@degenborn/shared";
import { generateNarrative } from "@/lib/narrative";
import { getAppUrl } from "@/lib/runtime-env";

// Minimal ABI — only the functions we call
const SOUL_CORE_ABI = [
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "archetype", type: "string" },
      { name: "dnaHash", type: "bytes32" },
      { name: "stateHash", type: "bytes32" },
      { name: "tokenURI_", type: "string" },
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  {
    name: "hasSoulCore",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "wallet", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "tokenOfWallet",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "wallet", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

function getBscRpc(): string {
  return (process.env.BSC_TESTNET_RPC ?? "https://data-seed-prebsc-1-s1.binance.org:8545/").trim();
}

function getContractAddress(): `0x${string}` {
  const addr = (process.env.SOUL_CORE_ADDRESS ?? "").trim();
  if (!addr) throw new Error("SOUL_CORE_ADDRESS not set");
  return addr as `0x${string}`;
}

function getDeployerAccount() {
  const pk = (process.env.PRIVATE_KEY ?? "").trim();
  if (!pk) throw new Error("PRIVATE_KEY (deployer) not set in environment");
  const key = pk.startsWith("0x") ? pk : `0x${pk}`;
  return privateKeyToAccount(key as `0x${string}`);
}

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

    const walletAddr = wallet.toLowerCase() as `0x${string}`;
    if (!isAddress(walletAddr)) {
      return NextResponse.json({ error: "invalid Ethereum address" }, { status: 400 });
    }

    // Generate deterministic hashes
    const dnaHash = keccak256(
      toBytes(JSON.stringify({
        aggression: dna.aggression,
        conviction: dna.conviction,
        chaos: dna.chaos,
        luck: dna.luck,
        survival: dna.survival,
      }))
    );
    const stateHash = keccak256(
      toBytes(JSON.stringify({ level: 1, mood: "neutral", corruption: 0 }))
    );

    // Build metadata URI
    const appUrl = getAppUrl();
    const metadataUri = `${appUrl}/api/metadata/${walletAddr}`;

    // Generate narrative (used for metadata + response)
    const narrative = await generateNarrative(dna, archetype);

    // ── On-chain mint (deployer signs on behalf of user) ──────────────────────
    const account = getDeployerAccount();
    const rpcUrl = getBscRpc();
    const contractAddress = getContractAddress();

    const publicClient = createPublicClient({
      chain: bscTestnet,
      transport: http(rpcUrl),
    });

    // Check if wallet already has a Soul Core
    const alreadyMinted = await publicClient.readContract({
      address: contractAddress,
      abi: SOUL_CORE_ABI,
      functionName: "hasSoulCore",
      args: [walletAddr],
    });

    if (alreadyMinted) {
      const existingTokenId = await publicClient.readContract({
        address: contractAddress,
        abi: SOUL_CORE_ABI,
        functionName: "tokenOfWallet",
        args: [walletAddr],
      });
      return NextResponse.json({
        already_minted: true,
        token_id: existingTokenId.toString(),
        metadata_uri: metadataUri,
        dna_hash: dnaHash,
        state_hash: stateHash,
        archetype: archetype.archetype,
        narrative,
      });
    }

    // Send mint transaction
    const walletClient = createWalletClient({
      account,
      chain: bscTestnet,
      transport: http(rpcUrl),
    });

    const txHash = await walletClient.writeContract({
      address: contractAddress,
      abi: SOUL_CORE_ABI,
      functionName: "mint",
      args: [walletAddr, archetype.archetype, dnaHash, stateHash, metadataUri],
    });

    // Wait for receipt to get token ID
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    // Parse SoulCoreCreated event: event SoulCoreCreated(address indexed wallet, uint256 indexed tokenId, string archetype)
    // topic[0] = keccak256("SoulCoreCreated(address,uint256,string)") = 0x2ccfd4f03485dc5bfff35b2cf48eb1df7354e8f6679e496c61f3e27975cefdd0
    const SOUL_CORE_CREATED_TOPIC = "0x2ccfd4f03485dc5bfff35b2cf48eb1df7354e8f6679e496c61f3e27975cefdd0";
    let tokenId: string | null = null;
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() === contractAddress.toLowerCase() &&
          log.topics[0] === SOUL_CORE_CREATED_TOPIC) {
        if (log.topics[2]) {
          tokenId = BigInt(log.topics[2]).toString();
        }
        break;
      }
    }

    return NextResponse.json({
      tx_hash: txHash,
      token_id: tokenId,
      metadata_uri: metadataUri,
      dna_hash: dnaHash,
      state_hash: stateHash,
      archetype: archetype.archetype,
      narrative,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[mint]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
