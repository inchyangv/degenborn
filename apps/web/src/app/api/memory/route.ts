import { NextRequest, NextResponse } from "next/server";
import { writeMutationToMemory, writeMilestoneToMemory, checkUnibаseHealth } from "@/lib/unibase-adapter";
import type { MutationEvent, CharacterState } from "@degenborn/shared";

/** Write a mutation or milestone to Unibase memory */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      type: "mutation" | "milestone";
      mutation?: MutationEvent;
      state?: CharacterState;
      wallet?: string;
      archetype?: string;
      milestone?: string;
      trigger?: string;
      timestamp?: number;
    };

    if (body.type === "mutation") {
      if (!body.mutation || !body.state) {
        return NextResponse.json({ error: "mutation and state required" }, { status: 400 });
      }
      const ok = await writeMutationToMemory(body.mutation, body.state);
      return NextResponse.json({ written: ok, type: "mutation" });
    }

    if (body.type === "milestone") {
      if (!body.wallet || !body.archetype || !body.milestone || !body.trigger) {
        return NextResponse.json({ error: "wallet, archetype, milestone, trigger required" }, { status: 400 });
      }
      const ok = await writeMilestoneToMemory(
        body.wallet,
        body.archetype,
        body.milestone,
        body.trigger,
        body.timestamp ?? Math.floor(Date.now() / 1000),
      );
      return NextResponse.json({ written: ok, type: "milestone" });
    }

    return NextResponse.json({ error: "type must be mutation or milestone" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    // Never block on memory write failure
    console.warn("[memory] write failed:", message);
    return NextResponse.json({ written: false, error: message });
  }
}

/** Health check for Unibase integration */
export async function GET() {
  const health = await checkUnibаseHealth();
  return NextResponse.json(health);
}
