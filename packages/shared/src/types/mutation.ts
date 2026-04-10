import type { CharacterState } from "./state";
import type { TraitId } from "./trait";

/** One entry in the mutation diary */
export interface MutationEvent {
  id: string;
  wallet_address: string;
  reason: string;            // human-readable cause
  trait_delta: {
    added: TraitId[];
    removed: TraitId[];
  };
  state_before: CharacterState;
  state_after: CharacterState;
  generated_caption: string; // short meme-tone line
  asset_url?: string;        // snapshot image for this moment
  timestamp: number;
}

/** Paginated diary response */
export interface DiaryPage {
  wallet_address: string;
  entries: MutationEvent[];
  total: number;
  has_more: boolean;
}
