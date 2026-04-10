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

// Convenience wrappers for the 5 core events
export const analytics = {
  walletConnected: (address: string) => track("wallet_connected", { wallet: address.slice(0, 8) }),
  analysisStarted: (wallet: string, window_: string) => track("analysis_started", { wallet: wallet.slice(0, 8), window: window_ }),
  analysisCompleted: (archetype: string) => track("analysis_completed", { archetype }),
  mintClicked: (archetype: string) => track("mint_clicked", { archetype }),
  shareClicked: (archetype: string) => track("share_clicked", { archetype }),
};
