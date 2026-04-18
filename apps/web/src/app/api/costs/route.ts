/**
 * GET /api/costs
 *
 * 5.5 (P2): Cost monitoring — per-user AI cost measurement.
 *
 * Tracks:
 * - Genesis image generation (DALL-E or Flux) cost per call
 * - Claude API caption/roast/narrative calls cost per call
 * - Estimated monthly cost at current usage rate
 *
 * In production: store cost events in DB, aggregate by day.
 * This endpoint returns in-memory stats for the current process lifetime.
 *
 * Response:
 * {
 *   genesis_calls: number,
 *   genesis_cost_usd: number,      // estimated
 *   llm_calls: number,
 *   llm_tokens_total: number,
 *   llm_cost_usd: number,
 *   total_cost_usd: number,
 *   cost_per_user_usd: number,     // total / unique_users
 *   unique_users: number,
 *   monthly_projection_usd: number,
 *   cap_strategy: string,
 * }
 */
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// In-memory cost ledger — survives same process instance
interface CostEntry {
  type: "genesis" | "llm_caption" | "llm_roast" | "llm_narrative";
  wallet: string;
  cost_usd: number;
  tokens?: number;
  timestamp: number;
}

const costLedger: CostEntry[] = [];

// Cost constants (approximate as of 2026-04)
const COST_PER_GENESIS_IMAGE = 0.04;     // DALL-E 3 standard
const COST_PER_1K_INPUT_TOKENS = 0.003;  // Claude Haiku
const COST_PER_1K_OUTPUT_TOKENS = 0.015; // Claude Haiku

export function recordGenesisCost(wallet: string): void {
  costLedger.push({ type: "genesis", wallet, cost_usd: COST_PER_GENESIS_IMAGE, timestamp: Date.now() });
}

export function recordLLMCost(wallet: string, type: CostEntry["type"], inputTokens: number, outputTokens: number): void {
  const cost = (inputTokens / 1000) * COST_PER_1K_INPUT_TOKENS + (outputTokens / 1000) * COST_PER_1K_OUTPUT_TOKENS;
  costLedger.push({ type, wallet, cost_usd: cost, tokens: inputTokens + outputTokens, timestamp: Date.now() });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const window = searchParams.get("window") ?? "all"; // "1d" | "7d" | "30d" | "all"

  const now = Date.now();
  const windowMs: Record<string, number> = {
    "1d": 86400 * 1000,
    "7d": 7 * 86400 * 1000,
    "30d": 30 * 86400 * 1000,
    "all": Infinity,
  };
  const cutoff = now - (windowMs[window] ?? Infinity);

  const entries = costLedger.filter((e) => e.timestamp >= cutoff);

  const genesisCalls = entries.filter((e) => e.type === "genesis");
  const llmCalls = entries.filter((e) => e.type !== "genesis");

  const genesisCost = genesisCalls.reduce((s, e) => s + e.cost_usd, 0);
  const llmCost = llmCalls.reduce((s, e) => s + e.cost_usd, 0);
  const llmTokens = llmCalls.reduce((s, e) => s + (e.tokens ?? 0), 0);
  const totalCost = genesisCost + llmCost;

  const uniqueUsers = new Set(entries.map((e) => e.wallet.toLowerCase())).size;
  const costPerUser = uniqueUsers > 0 ? totalCost / uniqueUsers : 0;

  // Monthly projection based on window
  const windowDays = window === "all" ? null : parseInt(window, 10);
  const monthlyProjection = windowDays ? (totalCost / windowDays) * 30 : null;

  return NextResponse.json({
    window,
    genesis_calls: genesisCalls.length,
    genesis_cost_usd: Math.round(genesisCost * 10000) / 10000,
    llm_calls: llmCalls.length,
    llm_tokens_total: llmTokens,
    llm_cost_usd: Math.round(llmCost * 10000) / 10000,
    total_cost_usd: Math.round(totalCost * 10000) / 10000,
    unique_users: uniqueUsers,
    cost_per_user_usd: Math.round(costPerUser * 10000) / 10000,
    monthly_projection_usd: monthlyProjection !== null ? Math.round(monthlyProjection * 100) / 100 : null,
    cap_strategy: "Free users: template caption fallback (0 LLM cost). Genesis: 1 AI image per wallet lifetime. Roast: Haiku model (~$0.001 each).",
    rates: {
      genesis_per_image_usd: COST_PER_GENESIS_IMAGE,
      llm_per_1k_input_usd: COST_PER_1K_INPUT_TOKENS,
      llm_per_1k_output_usd: COST_PER_1K_OUTPUT_TOKENS,
    },
    note: "In-process memory only — resets on server restart. Integrate with Postgres for persistent tracking.",
  });
}
