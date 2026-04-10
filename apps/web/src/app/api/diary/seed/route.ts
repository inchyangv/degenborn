/**
 * Seed the diary with demo entries for a wallet.
 * Used by Replay Mode to pre-populate mutation diary.
 */
import { NextRequest, NextResponse } from "next/server";
import { seedDiaryFromReplay } from "@/lib/diary-store";
import type { MutationEvent } from "@degenborn/shared";

export async function POST(req: NextRequest) {
  try {
    const { wallet, entries } = await req.json() as {
      wallet: string;
      entries: MutationEvent[];
    };

    if (!wallet || !Array.isArray(entries)) {
      return NextResponse.json({ error: "wallet and entries required" }, { status: 400 });
    }

    seedDiaryFromReplay(wallet.toLowerCase(), entries);
    return NextResponse.json({ ok: true, seeded: entries.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
