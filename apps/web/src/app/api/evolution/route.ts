import { NextRequest, NextResponse } from "next/server";
import type { CharacterState, PersonaDNA, ArchetypeId } from "@degenborn/shared";
import { checkEvolutionTrigger, attemptEvolution } from "@/lib/major-evolution";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      state_before: CharacterState;
      state_after: CharacterState;
      dna: PersonaDNA;
      archetype: ArchetypeId;
      current_image_url: string;
    };

    const { state_before, state_after, dna, archetype, current_image_url } = body;

    if (!state_before || !state_after || !dna || !archetype) {
      return NextResponse.json({ error: "state_before, state_after, dna, archetype required" }, { status: 400 });
    }

    const check = checkEvolutionTrigger(state_before, state_after);

    if (!check.should_rerender) {
      return NextResponse.json({ evolved: false, message: "No major milestone reached" });
    }

    const result = await attemptEvolution(
      archetype,
      dna,
      state_after,
      check.trigger!,
      current_image_url ?? `/archetypes/${archetype}_placeholder.svg`,
      check.evolved_seed!,
    );

    return NextResponse.json({
      evolved: true,
      trigger: check.trigger,
      result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[evolution]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
