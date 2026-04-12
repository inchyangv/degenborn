/**
 * DegenBorn Worker
 *
 * Polls for wallets that need re-scoring and updates their state.
 * In production: triggered by queue / cron.
 * For hackathon: run on demand via CLI.
 */

import { fetchWalletActivity } from "@degenborn/data-adapter";
import { scoreDNA } from "@degenborn/scoring";
import { classify } from "@degenborn/archetype";
import path from "path";
import { createServer } from "http";

function getWorkerDataSource(): "moralis" | "covalent" {
  const raw = (process.env.DATA_SOURCE ?? "").trim().toLowerCase();
  if (raw === "covalent") return "covalent";
  return "moralis";
}

async function processWallet(walletAddress: string): Promise<void> {
  console.log(`[worker] Processing ${walletAddress}`);

  const fixtureDir = path.join(__dirname, "../../../fixtures/wallets");

  // Fetch events (fixture → real API fallback)
  let events;
  try {
    events = await fetchWalletActivity(walletAddress, "30d", {
      source: "fixture",
      fixtureDir,
    });
    console.log(`[worker] Loaded ${events.length} events from fixture`);
  } catch {
    const source = getWorkerDataSource();
    events = await fetchWalletActivity(walletAddress, "30d", {
      source,
      moralisApiKey: process.env.MORALIS_API_KEY,
      covalentApiKey: process.env.COVALENT_API_KEY,
    });
    console.log(`[worker] Fetched ${events.length} events from ${source}`);
  }

  // Score
  const { dna } = scoreDNA(walletAddress, events);
  console.log(`[worker] DNA:`, dna);

  // Classify
  const archetypeResult = classify(dna);
  console.log(`[worker] Archetype: ${archetypeResult.archetype} (confidence: ${archetypeResult.confidence.toFixed(2)})`);

  // TODO: persist to DB and trigger image generation
  console.log(`[worker] Done: ${walletAddress}`);
}

async function runWalletBatch(wallets: string[]): Promise<void> {
  for (const w of wallets) {
    try {
      await processWallet(w.toLowerCase());
    } catch (err) {
      console.error(`[worker] Failed for ${w}:`, err);
    }
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
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          ok: true,
          mode: "service",
          configuredWallets: wallets.length,
          intervalMs,
          ts: new Date().toISOString(),
        }),
      );
      return;
    }

    res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    res.end("degenborn-worker running\n");
  }).listen(port, () => {
    console.log(`[worker] Service mode listening on :${port}`);
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
