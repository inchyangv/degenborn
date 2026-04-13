import type { ArchetypeId } from "./archetype";
import type { TraitId } from "./trait";
import type { BadgeId } from "../badges";

export type Mood = "neutral" | "euphoria" | "despair" | "revenge" | "greed" | "ghost";

/** Full character state stored per wallet */
export interface CharacterState {
  wallet_address: string;
  archetype: ArchetypeId;
  level: number;           // 1–10
  mood: Mood;
  corruption: number;      // 0–100 (rug exposure)
  prestige: number;        // 0–100 (sustained profit)
  scar_count: number;
  crown_count: number;
  survival_streak: number;
  active_traits: TraitId[];
  updated_at: number;
  // TF-05: Creator fields (optional — absent in pre-TF-05 states, treated as 0/false)
  tokens_created?: number;         // total tokens launched on Four.meme
  creator_badge?: boolean;         // first launch unlocked
  kingmaker_tokens?: number;       // successful (high-volume) launches
  fallen_creator_tokens?: number;  // failed launches (went to zero)
}

/** Event types that trigger state transitions */
export type StateEventType =
  | "win_streak_3"       // 3 consecutive profits → crown
  | "big_loss"           // large single loss → scar + despair
  | "loss_recovery"      // profit after big loss → survival streak + revenge
  | "rug_exposure"       // rug event → corruption + zombie
  | "sustained_profit"   // high profit rate maintained → prestige + royal
  | "mega_win"           // top 1% single trade → euphoria
  | "long_hold"          // conviction hold > 7d → prestige
  | "multi_rug"          // 3+ rug events → ghost mood
  | "comeback"           // drawdown recovery → survival streak
  | "token_created"      // TF-05: launched first token on Four.meme → creator_badge
  | "creator_success"    // TF-05: launched token achieved high volume → kingmaker trait
  | "creator_failure";   // TF-05: launched token went to zero → fallen_creator scar

export interface StateEvent {
  type: StateEventType;
  wallet_address: string;
  timestamp: number;
  payload?: Record<string, unknown>;
}

export interface StateTransition {
  event: StateEvent;
  state_before: CharacterState;
  state_after: CharacterState;
  traits_added: TraitId[];
  traits_removed: TraitId[];
  /** Badges newly earned by this transition (not present in state_before) */
  badges_earned: BadgeId[];
}
