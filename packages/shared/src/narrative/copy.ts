/**
 * Copy strings for i18n.
 * Default language is English. Korean translation keys map 1:1.
 * Usage: import { t } from "@degenborn/shared"; then t("hero.subtitle")
 */

export type CopyKey =
  | "hero.tagline"
  | "hero.subtitle"
  | "hero.cta_connect"
  | "hero.cta_awaken"
  | "hero.cta_connecting"
  | "hero.cta_awakening"
  | "steps.connect.title"
  | "steps.connect.desc"
  | "steps.awaken.title"
  | "steps.awaken.desc"
  | "steps.evolve.title"
  | "steps.evolve.desc"
  | "birth.scanning"
  | "birth.window_label"
  | "birth.window_hint_7d"
  | "birth.window_hint_30d"
  | "birth.window_hint_180d"
  | "birth.awaken_cta"
  | "mint.soulbound_label"
  | "mint.simulated_badge"
  | "mint.born_title"
  | "mint.enter_room"
  | "monster.mutations_counter"
  | "monster.view_publicly"
  | "share.copy_caption"
  | "share.copied"
  | "share.download";

export const EN_COPY: Record<CopyKey, string> = {
  "hero.tagline": "Your wallet tells a story. We make it a monster.",
  "hero.subtitle": "Four.meme × AI Identity Engine",
  "hero.cta_connect": "CONNECT WALLET",
  "hero.cta_awaken": "AWAKEN MY MONSTER",
  "hero.cta_connecting": "CONNECTING...",
  "hero.cta_awakening": "AWAKENING...",
  "steps.connect.title": "Connect",
  "steps.connect.desc": "Link your wallet. We read your Four.meme activity.",
  "steps.awaken.title": "Awaken",
  "steps.awaken.desc": "5 DNA axes are computed. Your archetype is revealed.",
  "steps.evolve.title": "Evolve",
  "steps.evolve.desc": "Every trade shapes your monster. Traits. Scars. Crowns.",
  "birth.scanning": "Scanning wallet history...",
  "birth.window_label": "Analyze window",
  "birth.window_hint_7d": "Short window — captures recent aggression & spikes",
  "birth.window_hint_30d": "Standard window — balanced DNA profile",
  "birth.window_hint_180d": "Long window — reveals deep conviction & survival",
  "birth.awaken_cta": "Awaken →",
  "mint.soulbound_label": "Soulbound NFT",
  "mint.simulated_badge": "Demo mode — mint is simulated",
  "mint.born_title": "✓ SOUL CORE BORN",
  "mint.enter_room": "Enter Monster Room →",
  "monster.mutations_counter": "mutations so far",
  "monster.view_publicly": "🔗 View publicly →",
  "share.copy_caption": "Copy caption",
  "share.copied": "Copied!",
  "share.download": "Download card",
};

export const KO_COPY: Record<CopyKey, string> = {
  "hero.tagline": "지갑이 이야기를 담고 있다. 우리가 그걸 몬스터로 만든다.",
  "hero.subtitle": "Four.meme × AI 정체성 엔진",
  "hero.cta_connect": "지갑 연결",
  "hero.cta_awaken": "내 몬스터 각성",
  "hero.cta_connecting": "연결 중...",
  "hero.cta_awakening": "각성 중...",
  "steps.connect.title": "연결",
  "steps.connect.desc": "지갑을 연결하세요. Four.meme 활동을 읽어냅니다.",
  "steps.awaken.title": "각성",
  "steps.awaken.desc": "DNA 5축이 계산됩니다. 아키타입이 드러납니다.",
  "steps.evolve.title": "진화",
  "steps.evolve.desc": "모든 거래가 몬스터를 형성합니다. 특성. 흉터. 왕관.",
  "birth.scanning": "지갑 히스토리 스캔 중...",
  "birth.window_label": "분석 기간",
  "birth.window_hint_7d": "단기 — 최근 공격성과 급등 포착",
  "birth.window_hint_30d": "표준 — 균형잡힌 DNA 프로필",
  "birth.window_hint_180d": "장기 — 깊은 확신과 생존력 분석",
  "birth.awaken_cta": "각성 →",
  "mint.soulbound_label": "소울바운드 NFT",
  "mint.simulated_badge": "데모 모드 — 민팅 시뮬레이션",
  "mint.born_title": "✓ 소울 코어 탄생",
  "mint.enter_room": "몬스터 룸 입장 →",
  "monster.mutations_counter": "번의 변이",
  "monster.view_publicly": "🔗 공개 링크 보기 →",
  "share.copy_caption": "캡션 복사",
  "share.copied": "복사됨!",
  "share.download": "카드 다운로드",
};

export type SupportedLocale = "en" | "ko";

/** Simple translate function. Falls back to English if key not in locale. */
export function createTranslator(locale: SupportedLocale) {
  const dict = locale === "ko" ? KO_COPY : EN_COPY;
  return (key: CopyKey): string => dict[key] ?? EN_COPY[key] ?? key;
}
