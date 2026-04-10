import type { ActivityEvent, TimeWindow, RawWalletActivity } from "@degenborn/shared";
import { normalizeEvents } from "./normalizer";

export interface AdapterConfig {
  source: "moralis" | "covalent" | "rpc" | "fixture";
  moralisApiKey?: string;
  covalentApiKey?: string;
  rpcUrl?: string;
  fixtureDir?: string;
}

const FOUR_MEME_ROUTER = "0x5c952063c7fc8610ffdb798152d69f0b9550762b"; // BSC
const BSC_CHAIN_ID = 56;

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
      throw new Error("RPC adapter not implemented — use moralis or fixture");
    default:
      throw new Error(`Unknown source: ${(config as AdapterConfig).source}`);
  }
}

/** Moralis v2.2 token transfers + swaps */
async function fetchMoralis(
  wallet: string,
  window: TimeWindow,
  apiKey: string,
): Promise<RawWalletActivity> {
  if (!apiKey) throw new Error("MORALIS_API_KEY is required");

  const fromDate = windowToFromDate(window);
  const url =
    `https://deep-index.moralis.io/api/v2.2/${wallet}/defi/summary` +
    `?chain=bsc&from_date=${fromDate}`;

  const resp = await fetchWithTimeout(url, {
    headers: { "X-API-Key": apiKey },
  });

  if (!resp.ok) {
    throw new Error(`Moralis error ${resp.status}: ${await resp.text()}`);
  }

  const data: unknown = await resp.json();
  return {
    wallet_address: wallet,
    fetched_at: Math.floor(Date.now() / 1000),
    source: "moralis",
    transactions: Array.isArray((data as any).result) ? (data as any).result : [],
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

/** Load fixture from disk */
async function loadFixture(wallet: string, fixtureDir: string): Promise<RawWalletActivity> {
  // In Node.js environment
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
