import { getAppUrl } from "@/lib/runtime-env";

/**
 * T-INV-01 — Challenge link utilities.
 *
 * Builds `?from=<wallet>` links so visitors know who challenged them.
 * The `from` param is always the sender's own wallet address.
 */

const APP_URL = getAppUrl();

/**
 * Build a challenge/share link for a wallet.
 * Opens the landing page with summoning banner when visitor has no soul yet.
 * Opens the monster room with a "challenged by X" note for existing users.
 *
 * @param fromWallet - The sender's wallet address (self)
 * @param targetWallet - Optional: link to a specific monster room (defaults to landing)
 */
export function buildChallengeLink(fromWallet: string, targetWallet?: string): string {
  if (targetWallet) {
    return `${APP_URL}/m/${targetWallet.toLowerCase()}?from=${fromWallet.toLowerCase()}`;
  }
  return `${APP_URL}/?from=${fromWallet.toLowerCase()}`;
}

/**
 * Build a soul share link (for the share card).
 * Points to the sender's own Monster Room with ?from=self so referral is tracked.
 */
export function buildSoulShareLink(wallet: string): string {
  return `${APP_URL}/m/${wallet.toLowerCase()}?from=${wallet.toLowerCase()}`;
}
