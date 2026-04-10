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
    const source = (process.env.DATA_SOURCE as "moralis" | "covalent") ?? "moralis";
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

// CLI entrypoint
const wallets = process.argv.slice(2);
if (wallets.length === 0) {
  console.log("Usage: ts-node src/index.ts <wallet_address> [<wallet_address>...]");
  console.log("Example: ts-node src/index.ts 0xrugnecromancer000000000000000000000000001");
  process.exit(0);
}

(async () => {
  for (const w of wallets) {
    try {
      await processWallet(w.toLowerCase());
    } catch (err) {
      console.error(`[worker] Failed for ${w}:`, err);
    }
  }
})();
