/**
 * T-EULO-01 — Flatline detection logic
 *
 * A wallet is "flatlined" when it has no activity events in the last 30 days.
 * "Resurrected" means the wallet was flatlined but then came back.
 */

/** Seconds in 30 days */
const FLATLINE_THRESHOLD_SECONDS = 30 * 24 * 60 * 60;

/**
 * Derive flatline status from last activity timestamp.
 *
 * @param lastActiveAt - unix seconds of last known activity event (0 = never)
 * @param nowSeconds   - current time in unix seconds (defaults to Date.now()/1000)
 */
export function deriveFlatlineStatus(
  lastActiveAt: number,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): boolean {
  if (lastActiveAt === 0) return false; // no recorded activity → not flatlined (never born)
  return nowSeconds - lastActiveAt > FLATLINE_THRESHOLD_SECONDS;
}

/**
 * Determine if a wallet was previously flatlined but is now active again.
 *
 * @param prevLastActiveAt  - last active timestamp at time of eulogy creation
 * @param currentLastActiveAt - latest timestamp from fresh data fetch
 */
export function deriveResurrectionStatus(
  prevLastActiveAt: number,
  currentLastActiveAt: number,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): boolean {
  const wasFlatlined = deriveFlatlineStatus(prevLastActiveAt, nowSeconds);
  const isNowActive = !deriveFlatlineStatus(currentLastActiveAt, nowSeconds);
  return wasFlatlined && isNowActive;
}

/** Format a unix seconds timestamp as "Month DD, YYYY" */
export function formatDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Calculate days alive between two timestamps */
export function daysAlive(birthSeconds: number, deathSeconds: number): number {
  return Math.max(0, Math.round((deathSeconds - birthSeconds) / 86400));
}
