import { NextRequest, NextResponse } from "next/server";
import { getMutationDiary } from "@/lib/diary-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");
  const limitStr = searchParams.get("limit") ?? "10";
  const limit = Math.min(50, Math.max(1, parseInt(limitStr, 10) || 10));

  if (!wallet) {
    return NextResponse.json({ error: "wallet required" }, { status: 400 });
  }

  const diary = getMutationDiary(wallet.toLowerCase(), limit);
  return NextResponse.json(diary);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { wallet?: string; event?: unknown };
    const { wallet, event } = body;

    if (!wallet || !event) {
      return NextResponse.json({ error: "wallet and event required" }, { status: 400 });
    }

    // In production this would write to Postgres
    // For demo: use in-memory store
    const { addMutationEntry } = await import("@/lib/diary-store");
    addMutationEntry(wallet.toLowerCase(), event);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
