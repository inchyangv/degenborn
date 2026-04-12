import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { scoreDNA } from "@degenborn/scoring";
import { classify } from "@degenborn/archetype";
import { fetchWalletActivity } from "@degenborn/data-adapter";
import type { ActivityEvent, TimeWindow } from "@degenborn/shared";
import { setProfile } from "@/lib/profile-store";
import { getDataSource } from "@/lib/runtime-env";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet, window: timeWindow = "30d", useFixture = false } = body as {
      wallet: string;
      window?: TimeWindow;
      useFixture?: boolean;
    };

    if (!wallet || typeof wallet !== "string") {
      return NextResponse.json({ error: "wallet address required" }, { status: 400 });
    }

    const walletLower = wallet.toLowerCase();

    if (!isAddress(walletLower)) {
      return NextResponse.json({ error: "invalid Ethereum address" }, { status: 400 });
    }
    let events: ActivityEvent[];

    if (useFixture) {
      // Demo/replay mode: load from fixture file, fall back to deterministic demo events
      try {
        const fixtureDir = path.join(process.cwd(), "../../fixtures/wallets");
        events = await fetchWalletActivity(walletLower, timeWindow, {
          source: "fixture",
          fixtureDir,
        });
      } catch {
        // No fixture for this wallet — generate deterministic demo events
        events = generateDemoEvents(walletLower);
      }
    } else {
      // Real wallet: fetch live data from Moralis/Covalent, fall back to demo on error
      const source = getDataSource("moralis");
      try {
        events = await fetchWalletActivity(walletLower, timeWindow, {
          source,
          moralisApiKey: process.env.MORALIS_API_KEY,
          covalentApiKey: process.env.COVALENT_API_KEY,
        });
      } catch {
        // Live data unavailable — keep flow alive with demo data
        console.warn("[analyze] live data fetch failed, falling back to demo events");
        events = generateDemoEvents(walletLower);
      }
    }

    const { dna } = scoreDNA(walletLower, events);
    const archetypeResult = classify(dna);

    // Persist to profile store for metadata endpoint cache hits
    setProfile(walletLower, dna, archetypeResult);

    return NextResponse.json({ dna, archetype: archetypeResult, event_count: events.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[analyze]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Generate deterministic demo events when no real data / fixture is available */
function generateDemoEvents(wallet: string): ActivityEvent[] {
  const seed = wallet.slice(2, 10);
  const hash = parseInt(seed, 16) || 1234;
  const base = 1712000000;

  const events: ActivityEvent[] = [];
  for (let i = 0; i < 20; i++) {
    const isRug = (hash * (i + 1)) % 7 === 0;
    const isSell = i % 2 !== 0;
    const pnl = isRug ? -800 : isSell ? ((hash * i) % 1000) - 200 : 0;
    events.push({
      id: `demo_${i}`,
      wallet_address: wallet,
      event_type: isRug ? "rug" : isSell ? "sell" : "buy",
      token_address: `0xtoken${(hash * i) % 5}`,
      value_usd: 100 + ((hash * i) % 500),
      pnl_delta: pnl,
      hold_duration_seconds: isRug ? 0 : 1800 + (i * 3600),
      timestamp: base + i * 3600,
      chain_id: 56,
    });
  }
  return events;
}
