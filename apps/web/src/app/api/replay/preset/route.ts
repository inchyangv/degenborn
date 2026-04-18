import { NextResponse } from "next/server";
import path from "path";
import { DEMO_WALLETS, canonicalizeWallet } from "@/lib/demo-wallets";

export async function GET() {
  try {
    const fs = await import("fs/promises");
    const presetPath = path.join(process.cwd(), "../../fixtures/replay/demo_preset.json");
    const raw = await fs.readFile(presetPath, "utf-8");
    const preset = JSON.parse(raw) as typeof EMBEDDED_PRESET;
    return NextResponse.json({
      ...preset,
      wallet_address: canonicalizeWallet(preset.wallet_address),
    });
  } catch {
    // Return embedded preset if fixture file not accessible
    return NextResponse.json(EMBEDDED_PRESET);
  }
}

const EMBEDDED_PRESET = {
  preset_id: "hackathon_demo_v1",
  name: "DegenBorn Hackathon Demo",
  description: "Full story arc: Rug Necromancer — rugged, recovered, crowned",
  wallet_address: DEMO_WALLETS.rug_necromancer,
  initial_dna: { aggression: 55, conviction: 45, chaos: 82, luck: 41, survival: 91 },
  archetype: "rug_necromancer",
  steps: [
    { step: 1, label: "Connect Wallet", description: "0xrugN...0001 connected", action: "connect_wallet", delay_ms: 0 },
    { step: 2, label: "Awakening", description: "chaos 82, survival 91 detected", action: "show_dna", dna: { aggression: 55, conviction: 45, chaos: 82, luck: 41, survival: 91 }, archetype: "rug_necromancer", delay_ms: 0 },
    { step: 3, label: "Genesis Birth", description: "You are: Rug Necromancer", action: "show_genesis", delay_ms: 0 },
    { step: 4, label: "Win Streak ×3", description: "Crown acquired + euphoria", action: "state_event", state_changes: { crown_count: 1, mood: "euphoria", prestige: 10, level: 2, traits_added: ["crown"] }, caption: "Three in a row. The crown was always yours.", delay_ms: 0 },
    { step: 5, label: "Rug Exposure", description: "Corruption +40, zombie eyes", action: "state_event", state_changes: { corruption: 40, scar_count: 1, mood: "despair", traits_added: ["zombie_eyes", "bandage"] }, caption: "The rug found you. Again. The eyes never lie.", delay_ms: 0 },
    { step: 6, label: "Comeback", description: "Survival streak 3, revenge aura", action: "state_event", state_changes: { survival_streak: 3, mood: "revenge", traits_added: ["revenge_aura"] }, caption: "Down 1400. Back 1200. The necromancer returns.", delay_ms: 0 },
    { step: 7, label: "Mutation Diary", description: "3 entries logged", action: "show_diary", delay_ms: 0 },
    { step: 8, label: "Share Card", description: "Generate identity card", action: "show_share_card", delay_ms: 0 }
  ]
};
