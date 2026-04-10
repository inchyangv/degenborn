/** Persona DNA — all scores 0–100 */
export interface PersonaDNA {
  wallet_address: string;
  aggression: number;   // 0–100: trading frequency / speed
  conviction: number;   // 0–100: hold duration / token concentration
  chaos: number;        // 0–100: volatility / rug exposure
  luck: number;         // 0–100: profit-taking accuracy
  survival: number;     // 0–100: recovery rate after losses
  computed_at: number;  // unix seconds
  event_count: number;  // number of events used
}

/** Input summary fed to scoring engine */
export interface ScoringInput {
  wallet_address: string;
  events: import("./activity").ActivityEvent[];
}
