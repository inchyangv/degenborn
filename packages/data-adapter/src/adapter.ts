import type { ActivityEvent, TimeWindow, RawWalletActivity } from "@degenborn/shared";
import { normalizeEvents } from "./normalizer";

export interface AdapterConfig {
  source: "moralis" | "covalent" | "rpc" | "fixture";
  moralisApiKey?: string;
  covalentApiKey?: string;
  rpcUrl?: string;
  fixtureDir?: string;
}

/** Four.meme router address on BSC (checksum-lower) */
export const FOUR_MEME_ROUTER = "0x5c952063c7fc8610ffdb798152d69f0b9550762b";

/**
 * Main entry point for fetching wallet activity.
 * Dispatches to the appropriate source adapter.
 */
export async function fetchWalletActivity(
  walletAddress: string,
  window: TimeWindow,
  config: AdapterConfig,
): Promise<ActivityEvent[]> {
  const raw = await fetchRaw(walletAddress, window, config);
  return normalizeEvents(raw);
}

async function fetchRaw(
  walletAddress: string,
  window: TimeWindow,
  config: AdapterConfig,
): Promise<RawWalletActivity> {
  switch (config.source) {
    case "moralis":
      return fetchMoralis(walletAddress, window, config.moralisApiKey ?? "");
    case "covalent":
      return fetchCovalent(walletAddress, window, config.covalentApiKey ?? "");
    case "fixture":
      return loadFixture(walletAddress, config.fixtureDir ?? "./fixtures/wallets");
    case "rpc":
      return fetchRpc(walletAddress, window, config.rpcUrl ?? "https://bsc-dataseed.binance.org/");
    default:
      throw new Error(`Unknown source: ${(config as AdapterConfig).source}`);
  }
}

/**
 * Moralis v2.2 — fetch ERC-20 transfers + swaps for BSC.
 *
 * P1-01: was using /defi/summary (returns only totals, not individual events).
 * Now uses /erc20/transfers and a separate /swaps endpoint which return per-tx data
 * that can be scored as buy/sell events.
 */
async function fetchMoralis(
  wallet: string,
  window: TimeWindow,
  apiKey: string,
): Promise<RawWalletActivity> {
  if (!apiKey) throw new Error("MORALIS_API_KEY is required");

  const fromDate = windowToFromDate(window);
  const headers = { "X-API-Key": apiKey };

  // Fetch token transfers (ERC-20) — includes swap inputs/outputs
  const transfersUrl =
    `https://deep-index.moralis.io/api/v2.2/${wallet}/erc20/transfers` +
    `?chain=bsc&from_date=${fromDate}&limit=200`;

  // Fetch swap events — higher-level Moralis endpoint that includes method labels
  const swapsUrl =
    `https://deep-index.moralis.io/api/v2.2/${wallet}/swaps` +
    `?chain=bsc&from_date=${fromDate}&limit=200&order=DESC`;

  // Fetch both in parallel; ignore failures on individual endpoints
  const [transfersResp, swapsResp] = await Promise.allSettled([
    fetchWithTimeout(transfersUrl, { headers }),
    fetchWithTimeout(swapsUrl, { headers }),
  ]);

  const transactions: unknown[] = [];

  if (transfersResp.status === "fulfilled" && transfersResp.value.ok) {
    const data: unknown = await transfersResp.value.json();
    const result = (data as any)?.result ?? [];
    // Tag each transfer with its type for the normalizer
    for (const tx of result) {
      transactions.push({ ...tx, _moralis_type: "transfer" });
    }
  }

  if (swapsResp.status === "fulfilled" && swapsResp.value.ok) {
    const data: unknown = await swapsResp.value.json();
    const result = (data as any)?.result ?? [];
    for (const tx of result) {
      transactions.push({ ...tx, _moralis_type: "swap" });
    }
  }

  if (transactions.length === 0 && transfersResp.status === "rejected") {
    // Both failed — throw first error
    throw new Error(`Moralis error: ${(transfersResp as PromiseRejectedResult).reason}`);
  }

  return {
    wallet_address: wallet,
    fetched_at: Math.floor(Date.now() / 1000),
    source: "moralis",
    transactions,
  };
}

/** Covalent GoldRush API */
async function fetchCovalent(
  wallet: string,
  window: TimeWindow,
  apiKey: string,
): Promise<RawWalletActivity> {
  if (!apiKey) throw new Error("COVALENT_API_KEY is required");

  const chainName = "bsc-mainnet";
  const url =
    `https://api.covalenthq.com/v1/${chainName}/address/${wallet}/transactions_v3/` +
    `?key=${apiKey}&block-signed-at-asc=false&no-logs=false&page-size=200`;

  const resp = await fetchWithTimeout(url);
  if (!resp.ok) {
    throw new Error(`Covalent error ${resp.status}: ${await resp.text()}`);
  }

  const data: unknown = await resp.json();
  const items = (data as any)?.data?.items ?? [];
  return {
    wallet_address: wallet,
    fetched_at: Math.floor(Date.now() / 1000),
    source: "covalent",
    transactions: items,
  };
}

/**
 * RPC fallback adapter — reads ERC-20 Transfer events directly from BSC node.
 *
 * Strategy:
 *  1. eth_getLogs for Transfer(from=wallet) — outbound = sells
 *  2. eth_getLogs for Transfer(to=wallet)   — inbound = buys
 *  3. Merge, deduplicate, and return as RawWalletActivity
 *
 * Limitation: no USD value without a price oracle. value_usd = 0 for all events.
 * The scoring engine tolerates this — it uses counts/ratios, not USD sums.
 */
async function fetchRpc(
  wallet: string,
  window: TimeWindow,
  rpcUrl: string,
): Promise<RawWalletActivity> {
  const fromBlock = await windowToFromBlock(window, rpcUrl);
  const walletTopic = `0x000000000000000000000000${wallet.slice(2).toLowerCase()}`;

  // ERC-20 Transfer event signature
  const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

  // Parallel: transfers out (sells) and transfers in (buys)
  const [outResult, inResult] = await Promise.allSettled([
    rpcLogs(rpcUrl, {
      fromBlock: `0x${fromBlock.toString(16)}`,
      toBlock: "latest",
      topics: [TRANSFER_TOPIC, walletTopic], // from=wallet
    }),
    rpcLogs(rpcUrl, {
      fromBlock: `0x${fromBlock.toString(16)}`,
      toBlock: "latest",
      topics: [TRANSFER_TOPIC, null, walletTopic], // to=wallet
    }),
  ]);

  const outLogs: RpcLog[] = outResult.status === "fulfilled" ? outResult.value : [];
  const inLogs: RpcLog[]  = inResult.status  === "fulfilled" ? inResult.value  : [];

  if (outLogs.length === 0 && inLogs.length === 0 && outResult.status === "rejected") {
    throw new Error(`RPC error: ${(outResult as PromiseRejectedResult).reason}`);
  }

  // Tag logs
  const transactions: unknown[] = [
    ...outLogs.map((l) => ({ ...l, _rpc_direction: "out" })),
    ...inLogs.map((l)  => ({ ...l, _rpc_direction: "in"  })),
  ];

  return {
    wallet_address: wallet,
    fetched_at: Math.floor(Date.now() / 1000),
    source: "rpc" as any,
    transactions,
  };
}

interface RpcLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  transactionHash: string;
  transactionIndex: string;
  blockHash: string;
  logIndex: string;
  removed: boolean;
}

async function rpcLogs(rpcUrl: string, filter: {
  fromBlock: string;
  toBlock: string;
  topics: (string | null)[];
}): Promise<RpcLog[]> {
  const resp = await fetchWithTimeout(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_getLogs",
      params: [filter],
    }),
  });

  if (!resp.ok) throw new Error(`RPC HTTP ${resp.status}`);

  const json = (await resp.json()) as { result?: RpcLog[]; error?: { message: string } };
  if (json.error) throw new Error(`RPC error: ${json.error.message}`);
  return json.result ?? [];
}

async function windowToFromBlock(window: TimeWindow, rpcUrl: string): Promise<number> {
  const days = { "7d": 7, "30d": 30, "180d": 180 }[window];
  // BSC produces ~3 second blocks → ~28800 blocks/day
  const BLOCKS_PER_DAY = 28800;
  const approxBlocks = days * BLOCKS_PER_DAY;

  try {
    const resp = await fetchWithTimeout(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_blockNumber",
        params: [],
      }),
    });
    const json = (await resp.json()) as { result?: string };
    const latest = parseInt(json.result ?? "0", 16);
    if (latest > 0) return Math.max(0, latest - approxBlocks);
  } catch {
    // Ignore — use a safe default
  }
  return 0;
}

/** Load fixture from disk */
async function loadFixture(wallet: string, fixtureDir: string): Promise<RawWalletActivity> {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const file = path.join(fixtureDir, `${wallet.toLowerCase()}.json`);
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as RawWalletActivity;
  } catch {
    throw new Error(`Fixture not found for wallet ${wallet}`);
  }
}

function windowToFromDate(window: TimeWindow): string {
  const days = { "7d": 7, "30d": 30, "180d": 180 }[window];
  const d = new Date(Date.now() - days * 86400_000);
  return d.toISOString().split("T")[0]!;
}

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
