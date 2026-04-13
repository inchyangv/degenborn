/**
 * T5-01: Postgres database adapter.
 *
 * Strategy: conditional two-tier storage.
 *  - When DATABASE_URL is set → use Postgres (pg pool)
 *  - When not set → no-op (existing JSON-file stores handle persistence)
 *
 * Tables managed here:
 *  - wallet_profile   (wallet_address, dna, archetype, character_state, image_url, last_scored_at)
 *  - mutation_event   (id, wallet_address, reason, trait_delta, state_before, state_after, generated_caption, timestamp)
 *
 * The profile-store and diary-store remain the primary in-memory tier; this module
 * adds an async durable backend that survives across serverless invocations.
 *
 * Usage:
 *   import { upsertWalletProfile, loadWalletProfile, appendMutationEvent, loadMutationDiary } from "@/lib/db";
 *   // All functions are no-ops when DATABASE_URL is absent.
 */

import type { PersonaDNA, ArchetypeResult, CharacterState, MutationEvent } from "@degenborn/shared";

// ── Pool initialization ────────────────────────────────────────────────────────

let _pool: import("pg").Pool | null = null;

function getPool(): import("pg").Pool | null {
  if (!process.env.DATABASE_URL) return null;
  if (_pool) return _pool;

  // Lazy import — pg is a CommonJS module; dynamic import avoids bundler issues
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Pool } = require("pg") as typeof import("pg");
  _pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
    max: 3, // conservative — Vercel serverless has cold starts
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
  });

  _pool.on("error", (err) => {
    console.error("[db] Pool error:", err.message);
  });

  return _pool;
}

// ── Schema bootstrap ───────────────────────────────────────────────────────────

let _schemaBootstrapped = false;

async function ensureSchema(pool: import("pg").Pool): Promise<void> {
  if (_schemaBootstrapped) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS wallet_profile (
      wallet_address  TEXT PRIMARY KEY,
      dna             JSONB NOT NULL,
      archetype       TEXT NOT NULL,
      archetype_confidence FLOAT NOT NULL DEFAULT 0,
      character_state JSONB,
      image_url       TEXT,
      last_scored_at  BIGINT NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS mutation_event (
      id              TEXT PRIMARY KEY,
      wallet_address  TEXT NOT NULL,
      reason          TEXT NOT NULL,
      trait_delta     JSONB NOT NULL,
      state_before    JSONB NOT NULL,
      state_after     JSONB NOT NULL,
      generated_caption TEXT NOT NULL DEFAULT '',
      asset_url       TEXT,
      timestamp       BIGINT NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS mutation_event_wallet_idx ON mutation_event (wallet_address, timestamp DESC);
  `);

  _schemaBootstrapped = true;
}

// ── wallet_profile ─────────────────────────────────────────────────────────────

export interface DBWalletProfile {
  wallet_address: string;
  dna: PersonaDNA;
  archetype: string;
  archetype_confidence: number;
  character_state: CharacterState | null;
  image_url: string | null;
  last_scored_at: number;
}

/**
 * Upsert a wallet profile into Postgres.
 * No-op when DATABASE_URL is not configured.
 */
export async function upsertWalletProfile(
  wallet: string,
  dna: PersonaDNA,
  archetype: ArchetypeResult,
  characterState?: CharacterState,
  imageUrl?: string,
): Promise<void> {
  const pool = getPool();
  if (!pool) return;

  try {
    await ensureSchema(pool);
    await pool.query(
      `INSERT INTO wallet_profile
         (wallet_address, dna, archetype, archetype_confidence, character_state, image_url, last_scored_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (wallet_address) DO UPDATE SET
         dna = EXCLUDED.dna,
         archetype = EXCLUDED.archetype,
         archetype_confidence = EXCLUDED.archetype_confidence,
         character_state = COALESCE(EXCLUDED.character_state, wallet_profile.character_state),
         image_url = COALESCE(EXCLUDED.image_url, wallet_profile.image_url),
         last_scored_at = EXCLUDED.last_scored_at`,
      [
        wallet.toLowerCase(),
        JSON.stringify(dna),
        archetype.archetype,
        archetype.confidence,
        characterState ? JSON.stringify(characterState) : null,
        imageUrl ?? null,
        Math.floor(Date.now() / 1000),
      ],
    );
  } catch (err) {
    console.error("[db] upsertWalletProfile error:", (err as Error).message);
  }
}

/**
 * Update only the character state for a wallet.
 * No-op when DATABASE_URL is not configured.
 */
export async function updateCharacterState(wallet: string, state: CharacterState): Promise<void> {
  const pool = getPool();
  if (!pool) return;

  try {
    await ensureSchema(pool);
    await pool.query(
      `UPDATE wallet_profile SET character_state = $1 WHERE wallet_address = $2`,
      [JSON.stringify(state), wallet.toLowerCase()],
    );
  } catch (err) {
    console.error("[db] updateCharacterState error:", (err as Error).message);
  }
}

/**
 * Update only the image_url for a wallet.
 * No-op when DATABASE_URL is not configured.
 */
export async function updateImageUrl(wallet: string, url: string): Promise<void> {
  const pool = getPool();
  if (!pool) return;

  try {
    await ensureSchema(pool);
    await pool.query(
      `UPDATE wallet_profile SET image_url = $1 WHERE wallet_address = $2`,
      [url, wallet.toLowerCase()],
    );
  } catch (err) {
    console.error("[db] updateImageUrl error:", (err as Error).message);
  }
}

/**
 * Load a wallet profile from Postgres.
 * Returns null if not found or DATABASE_URL not configured.
 */
export async function loadWalletProfile(wallet: string): Promise<DBWalletProfile | null> {
  const pool = getPool();
  if (!pool) return null;

  try {
    await ensureSchema(pool);
    const result = await pool.query<DBWalletProfile>(
      `SELECT wallet_address, dna, archetype, archetype_confidence,
              character_state, image_url, last_scored_at
       FROM wallet_profile WHERE wallet_address = $1`,
      [wallet.toLowerCase()],
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0]!;
    return {
      ...row,
      dna: typeof row.dna === "string" ? JSON.parse(row.dna) : row.dna,
      character_state: row.character_state
        ? (typeof row.character_state === "string" ? JSON.parse(row.character_state) : row.character_state)
        : null,
    };
  } catch (err) {
    console.error("[db] loadWalletProfile error:", (err as Error).message);
    return null;
  }
}

/**
 * List all wallet profiles, most-recently-scored first.
 * Returns empty array when DATABASE_URL is not configured.
 */
export async function listWalletProfiles(limit = 100): Promise<DBWalletProfile[]> {
  const pool = getPool();
  if (!pool) return [];

  try {
    await ensureSchema(pool);
    const result = await pool.query<DBWalletProfile>(
      `SELECT wallet_address, dna, archetype, archetype_confidence,
              character_state, image_url, last_scored_at
       FROM wallet_profile ORDER BY last_scored_at DESC LIMIT $1`,
      [limit],
    );
    return result.rows.map((row) => ({
      ...row,
      dna: typeof row.dna === "string" ? JSON.parse(row.dna) : row.dna,
      character_state: row.character_state
        ? (typeof row.character_state === "string" ? JSON.parse(row.character_state) : row.character_state)
        : null,
    }));
  } catch (err) {
    console.error("[db] listWalletProfiles error:", (err as Error).message);
    return [];
  }
}

// ── mutation_event ─────────────────────────────────────────────────────────────

/**
 * Append a mutation event to Postgres.
 * No-op when DATABASE_URL is not configured.
 */
export async function appendMutationEvent(event: MutationEvent): Promise<void> {
  const pool = getPool();
  if (!pool) return;

  try {
    await ensureSchema(pool);
    await pool.query(
      `INSERT INTO mutation_event
         (id, wallet_address, reason, trait_delta, state_before, state_after, generated_caption, asset_url, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO NOTHING`,
      [
        event.id,
        event.wallet_address.toLowerCase(),
        event.reason,
        JSON.stringify(event.trait_delta),
        JSON.stringify(event.state_before),
        JSON.stringify(event.state_after),
        event.generated_caption,
        event.asset_url ?? null,
        event.timestamp,
      ],
    );
  } catch (err) {
    console.error("[db] appendMutationEvent error:", (err as Error).message);
  }
}

/**
 * Load mutation events for a wallet from Postgres, newest first.
 * Returns empty array when DATABASE_URL is not configured.
 */
export async function loadMutationDiary(wallet: string, limit = 50): Promise<MutationEvent[]> {
  const pool = getPool();
  if (!pool) return [];

  try {
    await ensureSchema(pool);
    const result = await pool.query<MutationEvent>(
      `SELECT id, wallet_address, reason, trait_delta, state_before, state_after,
              generated_caption, asset_url, timestamp
       FROM mutation_event WHERE wallet_address = $1
       ORDER BY timestamp DESC LIMIT $2`,
      [wallet.toLowerCase(), limit],
    );
    return result.rows.map((row) => ({
      ...row,
      trait_delta: typeof row.trait_delta === "string" ? JSON.parse(row.trait_delta) : row.trait_delta,
      state_before: typeof row.state_before === "string" ? JSON.parse(row.state_before) : row.state_before,
      state_after: typeof row.state_after === "string" ? JSON.parse(row.state_after) : row.state_after,
    }));
  } catch (err) {
    console.error("[db] loadMutationDiary error:", (err as Error).message);
    return [];
  }
}

/** Returns true when a Postgres DATABASE_URL is configured. */
export function isDbEnabled(): boolean {
  return !!process.env.DATABASE_URL;
}
