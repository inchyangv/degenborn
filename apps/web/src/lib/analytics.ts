/**
 * Lightweight analytics — fires events to PostHog if NEXT_PUBLIC_POSTHOG_KEY is set.
 * Falls back to console.info in dev so the app works without configuration.
 */

const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com";
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

function getDistinctId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem("degenborn_anon_id");
  if (!id) {
    id = `anon_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("degenborn_anon_id", id);
  }
  return id;
}

export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;

  if (!POSTHOG_KEY) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[analytics]", event, props);
    }
    return;
  }

  const payload = {
    api_key: POSTHOG_KEY,
    event,
    distinct_id: getDistinctId(),
    properties: {
      $current_url: window.location.href,
      ...props,
    },
    timestamp: new Date().toISOString(),
  };

  // Fire-and-forget: don't block UX
  fetch(`${POSTHOG_HOST}/capture/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => { /* silent */ });
}

/**
 * Funnel events — 5 core conversion checkpoints (TODO 5.1).
 *
 *  Step 1: landing_arrived     — user hits the landing page
 *  Step 2: wallet_entered      — wallet address connected or pasted
 *  Step 3: archetype_revealed  — archetype + DNA shown to user
 *  Step 4: share_card_viewed   — user sees the share card section
 *  Step 5: share_clicked       — user clicks any share button
 */

// Convenience wrappers for the 5 core funnel steps
export const analytics = {
  // FUNNEL STEP 1: user arrived at landing
  landingArrived: (props?: { from?: string; ab_variant?: string }) =>
    track("funnel_01_landing_arrived", { from: props?.from ?? "direct", ab_variant: props?.ab_variant ?? "A" }),

  // FUNNEL STEP 2a: wallet connected via metamask/injected
  walletConnected: (address: string) =>
    track("funnel_02_wallet_connected", { method: "connect", wallet_prefix: address.slice(0, 8) }),

  // FUNNEL STEP 2b: wallet pasted (no-wallet mode)
  walletPasted: (address: string) =>
    track("funnel_02_wallet_pasted", { method: "paste", wallet_prefix: address.slice(0, 8) }),

  // FUNNEL STEP 2c: demo wallet selected
  demoSelected: (archetype: string) =>
    track("funnel_02_demo_selected", { method: "demo", archetype }),

  // FUNNEL STEP 3: archetype revealed (analysis complete)
  archetypeRevealed: (archetype: string, data_source: string) =>
    track("funnel_03_archetype_revealed", { archetype, data_source }),

  // FUNNEL STEP 4: share card section viewed
  shareCardViewed: (archetype: string, mode: string) =>
    track("funnel_04_share_card_viewed", { archetype, mode }),

  // FUNNEL STEP 5: share button clicked
  shareClicked: (archetype: string, channel: string) =>
    track("funnel_05_share_clicked", { archetype, channel }),

  // Non-funnel supplementary events
  analysisStarted: (wallet: string, window_: string) =>
    track("analysis_started", { wallet_prefix: wallet.slice(0, 8), window: window_ }),
  analysisCompleted: (archetype: string) =>
    track("analysis_completed", { archetype }),
  mintClicked: (archetype: string) =>
    track("mint_clicked", { archetype }),
  memeStudioOpened: (archetype: string) =>
    track("meme_studio_opened", { archetype }),
  tokenWidgetViewed: (token_address: string) =>
    track("token_widget_viewed", { token_prefix: token_address.slice(0, 10) }),
};
