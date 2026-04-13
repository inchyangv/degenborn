/**
 * Wallet profile store.
 *
 * Storage strategy (two-tier, matches diary-store pattern):
 *  1. In-memory Map (fast, always available)
 *  2. JSON file at PROFILE_PERSIST_PATH (optional, survives process restart)
 *
 * Set PROFILE_PERSIST_PATH=/tmp/degenborn_profiles.json for local demo.
 *
 * T2-01: CharacterState is now persisted alongside DNA/archetype so that
 * repeated visits accumulate level/mood/traits rather than resetting to L1.
 */

import type { PersonaDNA, ArchetypeResult, CharacterState } from "@degenborn/shared";
import fs from "fs";
import path from "path";

export interface WalletProfile {
  wallet_address: string;
  dna: PersonaDNA;
  archetype: string;
  archetype_confidence: number;
  last_scored_at: number;
  /** Persisted character state — saves level/mood/traits across visits */
  character_state?: CharacterState;
  /** DALL-E / Flux genesis image URL (T3-02) */
  image_url?: string;
}

const profileStore = new Map<string, WalletProfile>();

const PERSIST_PATH = process.env.PROFILE_PERSIST_PATH
  ? path.resolve(process.env.PROFILE_PERSIST_PATH)
  : null;

function loadFromDisk(): void {
  if (!PERSIST_PATH) return;
  try {
    if (!fs.existsSync(PERSIST_PATH)) return;
    const raw = fs.readFileSync(PERSIST_PATH, "utf-8");
    const data = JSON.parse(raw) as Record<string, WalletProfile>;
    for (const [wallet, profile] of Object.entries(data)) {
      profileStore.set(wallet, profile);
    }
  } catch {
    console.warn("[profile-store] Failed to load persisted profiles:", PERSIST_PATH);
  }
}

function flushToDisk(): void {
  if (!PERSIST_PATH) return;
  try {
    const data: Record<string, WalletProfile> = {};
    profileStore.forEach((p, w) => { data[w] = p; });
    const dir = path.dirname(PERSIST_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PERSIST_PATH, JSON.stringify(data), "utf-8");
  } catch {
    console.warn("[profile-store] Failed to persist profiles to disk:", PERSIST_PATH);
  }
}

// Load from disk on startup (best-effort)
loadFromDisk();

export function setProfile(wallet: string, dna: PersonaDNA, archetypeResult: ArchetypeResult): WalletProfile {
  const existing = profileStore.get(wallet.toLowerCase());
  const profile: WalletProfile = {
    wallet_address: wallet,
    dna,
    archetype: archetypeResult.archetype,
    archetype_confidence: archetypeResult.confidence,
    last_scored_at: Math.floor(Date.now() / 1000),
    // Carry forward previously saved character_state if archetype hasn't changed
    character_state:
      existing?.archetype === archetypeResult.archetype
        ? existing.character_state
        : undefined,
  };
  profileStore.set(wallet.toLowerCase(), profile);
  flushToDisk();
  return profile;
}

/** Persist an updated CharacterState for a wallet (T2-01). */
export function setCharacterState(wallet: string, state: CharacterState): void {
  const existing = profileStore.get(wallet.toLowerCase());
  if (!existing) return; // profile must exist first
  existing.character_state = state;
  profileStore.set(wallet.toLowerCase(), existing);
  flushToDisk();
}

/** Persist a genesis image URL for a wallet (T3-02). */
export function setImageUrl(wallet: string, imageUrl: string): void {
  const existing = profileStore.get(wallet.toLowerCase());
  if (!existing) return;
  existing.image_url = imageUrl;
  profileStore.set(wallet.toLowerCase(), existing);
  flushToDisk();
}

export function getProfileStore(wallet: string): WalletProfile | undefined {
  return profileStore.get(wallet.toLowerCase());
}

export function listProfiles(): WalletProfile[] {
  return Array.from(profileStore.values()).sort((a, b) => b.last_scored_at - a.last_scored_at);
}

export const isPersisted = PERSIST_PATH !== null;
