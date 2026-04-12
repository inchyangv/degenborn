/**
 * DegenBorn Worker
 *
 * Polls for wallets that need re-scoring and updates their state.
 * In production: triggered by queue / cron.
 * For hackathon: run on demand via CLI or service mode.
 *
 * Results are persisted to:
 *  - PROFILE_PERSIST_PATH (JSON file, shared with web app)
 *  - DIARY_PERSIST_PATH (JSON file, mutation events)
 *  - Console logs for debugging
 */

import { fetchWalletActivity } from "@degenborn/data-adapter";
import { scoreDNA } from "@degenborn/scoring";
import { classify } from "@degenborn/archetype";
import type { PersonaDNA } from "@degenborn/shared";
import path from "path";
import fs from "fs";
import { createServer } from "http";

// ── Profile persistence (mirrors web app profile-store.ts) ────────────────────
interface WalletProfile {
  wallet_address: string;
  dna: PersonaDNA;
  archetype: string;
  archetype_confidence: number;
  last_scored_at: number;
}

const PROFILE_PATH = process.env.PROFILE_PERSIST_PATH
  ? path.resolve(process.env.PROFILE_PERSIST_PATH)
  : "/tmp/degenborn_profiles.json";

function loadProfiles(): Record<string, WalletProfile> {
  try {
    if (!fs.existsSync(PROFILE_PATH)) return {};
    return JSON.parse(fs.readFileSync(PROFILE_PATH, "utf-8")) as Record<string, WalletProfile>;
  } catch {
    return {};
  }
}

function saveProfile(profile: WalletProfile): void {
  try {
    const profiles = loadProfiles();
    profiles[profile.wallet_address] = profile;
    const dir = path.dirname(PROFILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PROFILE_PATH, JSON.stringify(profiles, null, 2), "utf-8");
  } catch (err) {
    console.warn(`[worker] Failed to persist profile to ${PROFILE_PATH}:`, err);
  }
}

// ── Data source helper ────────────────────────────────────────────────────────

function getWorkerDataSource(): "moralis" | "covalent" {
  const raw = (process.env.DATA_SOURCE ?? "").trim().toLowerCase();
  if (raw === "covalent") return "covalent";
  return "moralis";
}

// ── Core wallet processing ────────────────────────────────────────────────────

async function processWallet(walletAddress: string): Promise<WalletProfile> {
  console.log(`[worker] Processing ${walletAddress}`);

  const fixtureDir = path.join(__dirname, "../../../fixtures/wallets");

  // Try fixture first (for demo wallets), then fall back to real API
  let events;
  let dataSource = "fixture";
  try {
    events = await fetchWalletActivity(walletAddress, "30d", {
      source: "fixture",
      fixtureDir,
    });
    console.log(`[worker] Loaded ${events.length} events from fixture`);
  } catch {
    const source = getWorkerDataSource();
    dataSource = source;
    try {
      events = await fetchWalletActivity(walletAddress, "30d", {
        source,
        moralisApiKey: process.env.MORALIS_API_KEY,
        covalentApiKey: process.env.COVALENT_API_KEY,
      });
      console.log(`[worker] Fetched ${events.length} events from ${source}`);
    } catch (err) {
      console.error(`[worker] Failed to fetch events for ${walletAddress}:`, err);
      throw err;
    }
  }

  // Score DNA
  const { dna } = scoreDNA(walletAddress, events);
  console.log(`[worker] DNA: agg=${Math.round(dna.aggression)} con=${Math.round(dna.conviction)} cha=${Math.round(dna.chaos)} lck=${Math.round(dna.luck)} srv=${Math.round(dna.survival)}`);

  // Classify archetype
  const archetypeResult = classify(dna);
  console.log(`[worker] Archetype: ${archetypeResult.archetype} (confidence: ${archetypeResult.confidence.toFixed(2)})`);

  // Persist to JSON file (shared with web app)
  const profile: WalletProfile = {
    wallet_address: walletAddress,
    dna,
    archetype: archetypeResult.archetype,
    archetype_confidence: archetypeResult.confidence,
    last_scored_at: Math.floor(Date.now() / 1000),
  };

  saveProfile(profile);
  console.log(`[worker] Saved profile to ${PROFILE_PATH} (source: ${dataSource})`);

  return profile;
}

async function runWalletBatch(wallets: string[]): Promise<void> {
  const results: { wallet: string; ok: boolean; archetype?: string }[] = [];

  for (const w of wallets) {
    try {
      const profile = await processWallet(w.toLowerCase());
      results.push({ wallet: w, ok: true, archetype: profile.archetype });
    } catch (err) {
      console.error(`[worker] Failed for ${w}:`, err);
      results.push({ wallet: w, ok: false });
    }
  }

  console.log("\n[worker] Batch summary:");
  for (const r of results) {
    const status = r.ok ? `✓ ${r.archetype}` : "✗ failed";
    console.log(`  ${r.wallet} → ${status}`);
  }
}

function parseWalletsFromEnv(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
}

function startServiceMode(): void {
  const port = Number(process.env.PORT ?? "3000");
  const wallets = parseWalletsFromEnv(process.env.WORKER_WALLETS);
  const intervalMs = Number(process.env.WORKER_INTERVAL_MS ?? "300000");

  createServer((req, res) => {
    if (req.url === "/health") {
      const profiles = loadProfiles();
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          ok: true,
          mode: "service",
          configuredWallets: wallets.length,
          intervalMs,
          profileCount: Object.keys(profiles).length,
          profilePath: PROFILE_PATH,
          ts: new Date().toISOString(),
        }),
      );
      return;
    }

    res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    res.end("degenborn-worker running\n");
  }).listen(port, () => {
    console.log(`[worker] Service mode listening on :${port}`);
    console.log(`[worker] Profile persist path: ${PROFILE_PATH}`);
  });

  if (wallets.length === 0) {
    console.log("[worker] WORKER_WALLETS is empty; running idle with health endpoint only");
    return;
  }

  const runScheduled = async () => {
    console.log(`[worker] Running scheduled batch for ${wallets.length} wallet(s)`);
    await runWalletBatch(wallets);
  };

  runScheduled().catch((err) => {
    console.error("[worker] Initial scheduled run failed:", err);
  });

  setInterval(() => {
    runScheduled().catch((err) => {
      console.error("[worker] Scheduled run failed:", err);
    });
  }, intervalMs);
}

// CLI or service entrypoint
const cliWallets = process.argv.slice(2);
if (cliWallets.length > 0) {
  runWalletBatch(cliWallets).catch((err) => {
    console.error("[worker] CLI batch failed:", err);
    process.exit(1);
  });
} else {
  startServiceMode();
}
