import { isAddress } from "viem";

export const DEMO_WALLETS = {
  rug_necromancer: "0x1111111111111111111111111111111111111111",
  rug_necromancer_alt: "0x1111111111111111111111111111111111111112",
  ice_whale: "0x2222222222222222222222222222222222222222",
  mad_gambler: "0x3333333333333333333333333333333333333331",
  mad_gambler_alt: "0x3333333333333333333333333333333333333332",
  sniper_jester: "0x4444444444444444444444444444444444444444",
  ghost_bagholder: "0x5555555555555555555555555555555555555551",
  diamond_cultist: "0x6666666666666666666666666666666666666661",
  diamond_cultist_alt: "0x6666666666666666666666666666666666666662",
  flatline_1: "0x7777777777777777777777777777777777777701",
  flatline_2: "0x7777777777777777777777777777777777777702",
  flatline_3: "0x7777777777777777777777777777777777777703",
  flatline_4: "0x7777777777777777777777777777777777777704",
  flatline_5: "0x7777777777777777777777777777777777777705",
  flatline_6: "0x7777777777777777777777777777777777777706",
  flatline_7: "0x7777777777777777777777777777777777777707",
  flatline_8: "0x7777777777777777777777777777777777777708",
} as const;

export const LEGACY_DEMO_WALLET_ALIASES: Record<string, string> = {
  "0xrugnecromancer000000000000000000000000001": DEMO_WALLETS.rug_necromancer,
  "0xrugnecromancer000000000000000000000000002": DEMO_WALLETS.rug_necromancer_alt,
  "0xrug_necromancer000000000000000000000001": DEMO_WALLETS.rug_necromancer,
  "0xicewhale000000000000000000000000000000001": DEMO_WALLETS.ice_whale,
  "0xice_whale0000000000000000000000000000001": DEMO_WALLETS.ice_whale,
  "0xmadgambler0000000000000000000000000000001": DEMO_WALLETS.mad_gambler,
  "0xmadgambler0000000000000000000000000000002": DEMO_WALLETS.mad_gambler_alt,
  "0xmad_gambler0000000000000000000000000001": DEMO_WALLETS.mad_gambler,
  "0xsniperjester000000000000000000000000001": DEMO_WALLETS.sniper_jester,
  "0xsniper_jester000000000000000000000001": DEMO_WALLETS.sniper_jester,
  "0xghostbagholder00000000000000000000000001": DEMO_WALLETS.ghost_bagholder,
  "0xghost_bagholder00000000000000000000001": DEMO_WALLETS.ghost_bagholder,
  "0xghost000000000000000000000000000000000001": DEMO_WALLETS.ghost_bagholder,
  "0xdiamondcultist000000000000000000000001": DEMO_WALLETS.diamond_cultist,
  "0xdiamond0cultist00000000000000000000000001": DEMO_WALLETS.diamond_cultist,
  "0xdiamond0cultist00000000000000000000000002": DEMO_WALLETS.diamond_cultist_alt,
  "0xdiamond_cultist00000000000000000000001": DEMO_WALLETS.diamond_cultist,
  "0xdiamond0000000000000000000000000000000001": DEMO_WALLETS.diamond_cultist,
  "0xflatlineddemo00000000000000000000000001": DEMO_WALLETS.flatline_1,
  "0xflatlineddemo00000000000000000000000002": DEMO_WALLETS.flatline_2,
  "0xflatlineddemo00000000000000000000000003": DEMO_WALLETS.flatline_3,
  "0xflatlineddemo00000000000000000000000004": DEMO_WALLETS.flatline_4,
  "0xflatlineddemo00000000000000000000000005": DEMO_WALLETS.flatline_5,
  "0xflatlineddemo00000000000000000000000006": DEMO_WALLETS.flatline_6,
  "0xflatlineddemo00000000000000000000000007": DEMO_WALLETS.flatline_7,
  "0xflatlineddemo00000000000000000000000008": DEMO_WALLETS.flatline_8,
} as const;

const DEMO_WALLET_VALUES = new Set<string>([
  ...Object.values(DEMO_WALLETS),
  ...Object.values(LEGACY_DEMO_WALLET_ALIASES),
].map((wallet) => wallet.toLowerCase()));

export function canonicalizeWallet(wallet: string): string {
  const normalized = wallet.trim().toLowerCase();
  return LEGACY_DEMO_WALLET_ALIASES[normalized] ?? normalized;
}

export function isDemoWallet(wallet: string): boolean {
  return DEMO_WALLET_VALUES.has(canonicalizeWallet(wallet));
}

export function isWalletInputSupported(wallet: string): boolean {
  return isAddress(canonicalizeWallet(wallet) as `0x${string}`);
}

export function shortWallet(wallet: string): string {
  const canonical = canonicalizeWallet(wallet);
  return `${canonical.slice(0, 6)}...${canonical.slice(-4)}`;
}
