/**
 * GET /api/curate
 *
 * 5.3: Auto Curation Bot — daily pick of the most interesting monster.
 *
 * Selects based on:
 * 1. Biggest mutation since yesterday
 * 2. Most extreme recovery
 * 3. Most corrupted (zombie-iest)
 *
 * Returns:
 * {
 *   picked_wallet: string,
 *   pick_reason: string,
 *   tweet_draft: string,     // ready to post, ≤280 chars, needs 1-tap approval
 *   archetype_name: string,
 *   monster_url: string,
 *   share_url: string,       // Twitter intent URL
 *   generated_at: string,
 * }
 *
 * This respects PROJECT.md section 4.7: "사람이 1탭 승인" — auto-posts are BANNED,
 * but a human can approve this draft with one tap.
 */
import { NextRequest, NextResponse } from "next/server";
import { ARCHETYPE_PROFILES } from "@degenborn/shared";
import { listProfilesAsync, getProfileStore } from "@/lib/profile-store";
import type { WalletProfile } from "@/lib/profile-store";

export const runtime = "nodejs";

interface CurationPick {
  wallet: string;
  reason: "biggest_mutation" | "extreme_recovery" | "most_corrupted" | "chaos_king";
  score: number;
  profile: WalletProfile;
}

function scoreMutation(p: WalletProfile): number {
  const state = p.character_state;
  if (!state) return 0;
  return state.scar_count * 15 + state.crown_count * 20 + state.survival_streak * 25 + state.prestige * 0.5;
}

function scoreRecovery(p: WalletProfile): number {
  const state = p.character_state;
  if (!state) return 0;
  const revengeMod = state.mood === "revenge" ? 30 : 0;
  return state.survival_streak * 30 + state.scar_count * 10 + revengeMod;
}

function scoreCorruption(p: WalletProfile): number {
  const state = p.character_state;
  if (!state) return 0;
  return (state.corruption ?? 0) + (state.mood === "ghost" ? 20 : 0);
}

function scoreChaos(p: WalletProfile): number {
  return p.dna.chaos * 0.7 + p.dna.aggression * 0.3;
}

function buildTweetDraft(pick: CurationPick, archetypeName: string): string {
  const wallet = pick.wallet;
  const short = `${wallet.slice(0, 6)}…${wallet.slice(-4)}`;
  const state = pick.profile.character_state;

  const lines: Record<CurationPick["reason"], string> = {
    biggest_mutation: `🧬 today's monster highlight: ${short}\n\nthis ${archetypeName} has ${state?.scar_count ?? 0} scars, ${state?.crown_count ?? 0} crowns, and ${state?.survival_streak ?? 0} survival streaks.\n\nstill here. somehow. #DegenBorn #FourMeme`,
    extreme_recovery: `💀→🚀 recovery of the day: ${short}\n\n${archetypeName} took L after L and came back. survival streak: ${state?.survival_streak ?? 0}. mood: ${state?.mood ?? "??"}.\n\nnot dead yet. #DegenBorn #FourMeme`,
    most_corrupted: `🧟 most corrupted monster today: ${short}\n\n${archetypeName} is ${state?.corruption ?? 0}% zombie. ${state?.active_traits?.includes("zombie_eyes") ? "eyes are gone." : "barely holding on."}\n\nrug life chose them. #DegenBorn #FourMeme`,
    chaos_king: `⚡ chaos incarnate: ${short}\n\n${archetypeName}. aggression ${pick.profile.dna.aggression}/100, chaos ${pick.profile.dna.chaos}/100.\n\nthey ape first. they think never. #DegenBorn #FourMeme`,
  };

  const draft = lines[pick.reason];
  return draft.length > 280 ? draft.slice(0, 277) + "…" : draft;
}

export async function GET(_req: NextRequest): Promise<NextResponse> {
  const profiles = await listProfilesAsync(100);

  if (profiles.length === 0) {
    return NextResponse.json({
      error: "No analyzed profiles yet. Run some wallet analyses first.",
    }, { status: 404 });
  }

  // Score each profile across 4 dimensions
  const candidates: CurationPick[] = [
    ...profiles.map((p) => ({ wallet: p.wallet_address, reason: "biggest_mutation" as const, score: scoreMutation(p), profile: p })),
    ...profiles.map((p) => ({ wallet: p.wallet_address, reason: "extreme_recovery" as const, score: scoreRecovery(p), profile: p })),
    ...profiles.map((p) => ({ wallet: p.wallet_address, reason: "most_corrupted" as const, score: scoreCorruption(p), profile: p })),
    ...profiles.map((p) => ({ wallet: p.wallet_address, reason: "chaos_king" as const, score: scoreChaos(p), profile: p })),
  ].filter((c) => c.score > 0);

  if (candidates.length === 0) {
    // No state data — pick random
    const random = profiles[Math.floor(Math.random() * profiles.length)];
    const archetypeName = ARCHETYPE_PROFILES[random.archetype as keyof typeof ARCHETYPE_PROFILES]?.name ?? random.archetype;
    const pick: CurationPick = { wallet: random.wallet_address, reason: "chaos_king", score: 1, profile: random };
    const draft = buildTweetDraft(pick, archetypeName);
    return buildResponse(pick, archetypeName, draft);
  }

  // Pick highest scoring candidate, breaking ties by reason priority
  const REASON_PRIORITY: Record<CurationPick["reason"], number> = {
    biggest_mutation: 3, extreme_recovery: 4, most_corrupted: 2, chaos_king: 1,
  };

  const winner = candidates.reduce((best, c) =>
    c.score > best.score || (c.score === best.score && REASON_PRIORITY[c.reason] > REASON_PRIORITY[best.reason])
      ? c : best,
  );

  const archetypeName = ARCHETYPE_PROFILES[winner.profile.archetype as keyof typeof ARCHETYPE_PROFILES]?.name ?? winner.profile.archetype;
  const draft = buildTweetDraft(winner, archetypeName);
  return buildResponse(winner, archetypeName, draft);
}

function buildResponse(pick: CurationPick, archetypeName: string, tweetDraft: string): NextResponse {
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetDraft)}`;
  return NextResponse.json({
    picked_wallet: pick.wallet,
    pick_reason: pick.reason,
    pick_score: pick.score,
    archetype: pick.profile.archetype,
    archetype_name: archetypeName,
    monster_url: `/monster?wallet=${pick.wallet}`,
    tweet_draft: tweetDraft,
    share_url: shareUrl,
    generated_at: new Date().toISOString(),
    note: "Human 1-tap approval required before posting. Auto-posting is disabled by design.",
  });
}
