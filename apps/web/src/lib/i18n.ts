/**
 * 3.8: Localization — Korean/Chinese degen slang copy.
 *
 * NOT a generic translation. Each locale uses its own degen vernacular:
 * - Korean (ko): 코인판 slang (코인충, 존버, 떡상, 물타기, 존망, ...)
 * - Chinese (zh): 币圈 slang (梭哈, 归零, 割肉, 韭菜, 钻石手, ...)
 * - English (en): original (default)
 */

export type Locale = "en" | "ko" | "zh";

export type CopyKey =
  | "landing_headline"
  | "landing_sub"
  | "cta_connect"
  | "cta_analyze"
  | "archetype_mad_gambler_tag"
  | "archetype_ice_whale_tag"
  | "archetype_rug_necromancer_tag"
  | "archetype_diamond_cultist_tag"
  | "archetype_sniper_jester_tag"
  | "archetype_ghost_bagholder_tag"
  | "dna_label_aggression"
  | "dna_label_conviction"
  | "dna_label_chaos"
  | "dna_label_luck"
  | "dna_label_survival"
  | "share_card_caption";

const COPY: Record<Locale, Record<CopyKey, string>> = {
  en: {
    landing_headline: "Connect your wallet. See what kind of trader you really are.",
    landing_sub: "Four.meme is where meme tokens are born. DegenBorn is where meme traders are born.",
    cta_connect: "Connect Wallet",
    cta_analyze: "Reveal My Monster",
    archetype_mad_gambler_tag: "Apes in. Apes out. Repeat until zero.",
    archetype_ice_whale_tag: "Holds forever. Wins eventually.",
    archetype_rug_necromancer_tag: "still here. somehow.",
    archetype_diamond_cultist_tag: "never selling. ever.",
    archetype_sniper_jester_tag: "exits perfectly by accident.",
    archetype_ghost_bagholder_tag: "haunting a dead token near you.",
    dna_label_aggression: "Aggression",
    dna_label_conviction: "Conviction",
    dna_label_chaos: "Chaos",
    dna_label_luck: "Luck",
    dna_label_survival: "Survival",
    share_card_caption: "My wallet has a personality disorder.",
  },
  ko: {
    landing_headline: "지갑 연결하면 당신이 어떤 코인충인지 보여드림.",
    landing_sub: "Four.meme은 밈코인이 태어나는 곳. DegenBorn는 밈 트레이더가 태어나는 곳.",
    cta_connect: "지갑 연결",
    cta_analyze: "내 괴물 소환",
    archetype_mad_gambler_tag: "존버도 없고 손절도 없음. 그냥 박음.",
    archetype_ice_whale_tag: "존버로 버팀. 언젠간 떡상함.",
    archetype_rug_necromancer_tag: "러그 3번 맞았는데 아직 살아있음.",
    archetype_diamond_cultist_tag: "팔기 싫음. 평생 안 팔 것임.",
    archetype_sniper_jester_tag: "얼떨결에 고점 탈출 성공.",
    archetype_ghost_bagholder_tag: "죽은 코인 옆에서 유령처럼 존버 중.",
    dna_label_aggression: "공격성",
    dna_label_conviction: "신념",
    dna_label_chaos: "카오스",
    dna_label_luck: "운",
    dna_label_survival: "생존력",
    share_card_caption: "내 지갑이 성격 이상 진단받음.",
  },
  zh: {
    landing_headline: "连接钱包，看看你到底是哪种韭菜。",
    landing_sub: "Four.meme 是 meme 代币诞生的地方。DegenBorn 是 meme 交易员诞生的地方。",
    cta_connect: "连接钱包",
    cta_analyze: "召唤我的怪物",
    archetype_mad_gambler_tag: "梭哈，再梭哈，直到归零。",
    archetype_ice_whale_tag: "钻石手持币，总有一天暴涨。",
    archetype_rug_necromancer_tag: "被割三次了还没死，命硬。",
    archetype_diamond_cultist_tag: "不割肉。永远不。",
    archetype_sniper_jester_tag: "误打误撞高点跑路，笑死。",
    archetype_ghost_bagholder_tag: "守着归零的代币当鬼魂。",
    dna_label_aggression: "攻击性",
    dna_label_conviction: "信念",
    dna_label_chaos: "混沌",
    dna_label_luck: "运气",
    dna_label_survival: "生存力",
    share_card_caption: "我的钱包被诊断为人格障碍。",
  },
};

export function t(locale: Locale, key: CopyKey): string {
  return COPY[locale]?.[key] ?? COPY.en[key] ?? key;
}

export function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language?.toLowerCase() ?? "";
  if (lang.startsWith("ko")) return "ko";
  if (lang.startsWith("zh")) return "zh";
  return "en";
}

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  ko: "한국어",
  zh: "中文",
};
