/**
 * GET /api/integration
 *
 * 2.10: Four.meme Official Integration Proposal Package.
 *
 * Returns a machine-readable summary of all DegenBorn integration points
 * that Four.meme could officially adopt. Designed as a demo dashboard
 * showing the value proposition: "user buys token → monster changes → trades again"
 *
 * Response:
 * {
 *   value_proposition: string,
 *   retention_loop: string[],       // step-by-step loop description
 *   integration_endpoints: Array<{
 *     endpoint: string,
 *     method: string,
 *     description: string,
 *     four_meme_use_case: string,
 *   }>,
 *   demo_metrics: {
 *     analyzed_wallets: number,
 *     monsters_created: number,
 *     tokens_tracked: number,
 *     packs_formed: number,
 *   },
 *   contact: string,
 * }
 */
import { NextResponse } from "next/server";
import { listProfilesAsync } from "@/lib/profile-store";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  const profiles = await listProfilesAsync(1000);

  return NextResponse.json({
    value_proposition: "DegenBorn turns every Four.meme trade into a character evolution event. Users return to check their monster — which means they return to Four.meme.",
    retention_loop: [
      "1. User trades on Four.meme",
      "2. DegenBorn webhook receives trade event in <1 minute",
      "3. Monster state updates: scar, crown, corruption, survival",
      "4. User gets push notification: 'Your monster just changed'",
      "5. User opens DegenBorn, sees evolution",
      "6. User shares monster card → new users discover Four.meme",
      "7. New user goes to Four.meme to get their own monster",
      "→ Loop complete. Four.meme trading volume ↑",
    ],
    integration_endpoints: [
      {
        endpoint: "/api/webhook/trade",
        method: "POST",
        description: "Receives Moralis Streams / BNB node trade events, instantly mutates monster state",
        four_meme_use_case: "Hook into Four.meme router contract events → real-time monster evolution",
      },
      {
        endpoint: "/api/widget/token/[address]",
        method: "GET",
        description: "Returns HTML embed showing top-10 holder monsters for any token",
        four_meme_use_case: "Embed on Four.meme token pages to show which monsters hold this token",
      },
      {
        endpoint: "/api/patron/[token]",
        method: "GET",
        description: "Returns the Patron Saint (top holder monster) for a token",
        four_meme_use_case: "Display on token page: 'Patron Saint: [Monster] — largest holder'",
      },
      {
        endpoint: "/api/pack",
        method: "GET",
        description: "Returns Pack of monsters sharing a token, with avg DNA and mood",
        four_meme_use_case: "Show community stats on token page: 'Pack of $TOKEN: 147 monsters, mood: revenge'",
      },
      {
        endpoint: "/api/gif/genesis",
        method: "GET",
        description: "Animated GIF of monster genesis reveal",
        four_meme_use_case: "Auto-generate shareable GIF for Four.meme token launch announcements",
      },
      {
        endpoint: "/api/og/[wallet]",
        method: "GET",
        description: "OG image for wallet monster card",
        four_meme_use_case: "When Four.meme user shares a trade, auto-attach monster card OG image",
      },
    ],
    demo_metrics: {
      analyzed_wallets: profiles.length,
      monsters_created: profiles.length,
      tokens_tracked: profiles.reduce((acc, p) => acc + (p.dna.event_count > 0 ? 1 : 0), 0),
      packs_formed: Math.ceil(profiles.length / 3),
    },
    tech_stack: {
      webhook: "Moralis Streams compatible (POST /api/webhook/trade)",
      embed: "iframe 1-liner, no SDK required",
      bot: "Telegram webhook (@DegenBornBot)",
      chain: "BNB Chain (BSC) — same as Four.meme",
    },
    contact: "DegenBorn team — built for Four.meme DoraHacks Hackathon 2026",
    generated_at: new Date().toISOString(),
  });
}
