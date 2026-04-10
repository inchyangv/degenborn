import type { ArchetypeId } from "./archetype";
import type { TraitId } from "./trait";

export type AssetType = "genesis" | "overlay" | "share_card" | "relic";

export interface GeneratedAsset {
  id: string;
  wallet_address: string;
  asset_type: AssetType;
  prompt?: string;
  seed?: number;
  url: string;
  width: number;
  height: number;
  archetype?: ArchetypeId;
  traits?: TraitId[];
  created_at: number;
}

/** Metadata structure for Soul Core NFT tokenURI */
export interface SoulCoreMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: MetadataAttribute[];
}

export interface MetadataAttribute {
  trait_type: string;
  value: string | number;
  display_type?: "number" | "boost_number" | "boost_percentage" | "date";
}
