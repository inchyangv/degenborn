/** Raw event type from on-chain activity */
export type EventType = "buy" | "sell" | "hold" | "rug" | "recovery" | "transfer_in" | "transfer_out" | "token_created";

/** Normalized activity event — source-agnostic */
export interface ActivityEvent {
  id: string;
  wallet_address: string;
  event_type: EventType;
  token_address: string;
  token_symbol?: string;
  value_usd: number;
  pnl_delta: number;          // positive = profit, negative = loss
  hold_duration_seconds?: number;
  timestamp: number;          // unix seconds
  raw_payload?: unknown;
  chain_id?: number;
}

/** Time window for data fetch */
export type TimeWindow = "7d" | "30d" | "180d";

/** Raw response from a data adapter before normalization */
export interface RawWalletActivity {
  wallet_address: string;
  fetched_at: number;
  source: "moralis" | "covalent" | "rpc" | "fixture";
  transactions: unknown[];
}
