/**
 * In-memory wallet profile store.
 * Caches the latest DNA + archetype for each analyzed wallet.
 * Persisted only for the lifetime of the process — use a DB in production.
 */

import type { PersonaDNA, ArchetypeResult } from "@degenborn/shared";

export interface WalletProfile {
  wallet_address: string;
  dna: PersonaDNA;
  archetype: string;
  archetype_confidence: number;
  last_scored_at: number;
}

const profileStore = new Map<string, WalletProfile>();

export function setProfile(wallet: string, dna: PersonaDNA, archetypeResult: ArchetypeResult): WalletProfile {
  const profile: WalletProfile = {
    wallet_address: wallet,
    dna,
    archetype: archetypeResult.archetype,
    archetype_confidence: archetypeResult.confidence,
    last_scored_at: Math.floor(Date.now() / 1000),
  };
  profileStore.set(wallet.toLowerCase(), profile);
  return profile;
}

export function getProfileStore(wallet: string): WalletProfile | undefined {
  return profileStore.get(wallet.toLowerCase());
}

export function listProfiles(): WalletProfile[] {
  return Array.from(profileStore.values());
}
