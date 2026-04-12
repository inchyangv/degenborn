/**
 * T-VC-01 — Character dialogue system.
 *
 * 1st-person, event-triggered dialogue lines.
 * Each archetype has a distinct speech tone:
 *   mad_gambler      → impulsive, raw, loud
 *   ice_whale        → slow, cold, commanding
 *   rug_necromancer  → transcendent, poetic, dark
 *   diamond_cultist  → religious, unwavering
 *   sniper_jester    → taunting, gleeful, fast
 *   ghost_bagholder  → resigned, dry, haunted
 *
 * Lines are ≤ 30 chars in English and Korean.
 * Picked deterministically from (archetype, eventType, seed).
 */
import type { ArchetypeId } from "../types/archetype";
import type { CharacterState } from "../types/state";

export type DialogueEventType =
  | "first_win"
  | "big_loss"
  | "rug_event"
  | "recovery"
  | "level_up"
  | "idle";

export interface DialogueLine {
  en: string;
  ko: string;
}

/** All dialogue banks keyed by archetype × event type */
export const DIALOGUE_BANK: Record<ArchetypeId, Record<DialogueEventType, DialogueLine[]>> = {
  mad_gambler: {
    first_win: [
      { en: "We're so back.", ko: "우린 돌아왔다." },
      { en: "Money in, money out.", ko: "들어온다, 나간다." },
      { en: "NGMI? I just did.", ko: "NGMI? 방금 했다." },
      { en: "First blood. Mine.", ko: "첫 피. 내 거." },
    ],
    big_loss: [
      { en: "Rekt. Again. Fine.", ko: "렉트. 또. 괜찮아." },
      { en: "Send it. I'm already gone.", ko: "보내. 이미 갔어." },
      { en: "The rug speaks first.", ko: "러그가 먼저 말한다." },
      { en: "Cope? I run toward it.", ko: "코프? 난 달려간다." },
    ],
    rug_event: [
      { en: "Rugged. Loading next.", ko: "러그됐다. 다음 로딩." },
      { en: "Dev rugged. I ape again.", ko: "개발자 러그. 다시 에이프." },
      { en: "Charts lie. I live.", ko: "차트가 거짓말. 나는 산다." },
      { en: "Pain? That's the fee.", ko: "고통? 그게 수수료." },
    ],
    recovery: [
      { en: "Back from the dead.", ko: "죽음에서 돌아왔다." },
      { en: "Who said I was done?", ko: "누가 내가 끝났다 했어?" },
      { en: "The arc continues.", ko: "아크는 계속된다." },
      { en: "Revenge trade incoming.", ko: "복수 매매 온다." },
    ],
    level_up: [
      { en: "Leveled. Still not stopping.", ko: "레벨업. 아직 안 멈춰." },
      { en: "New level, same chaos.", ko: "새 레벨, 같은 카오스." },
      { en: "The grind never sleeps.", ko: "그라인드는 안 잔다." },
      { en: "Higher. Faster. More.", ko: "더 높이. 빠르게. 더." },
    ],
    idle: [
      { en: "Why is it quiet.", ko: "왜 조용하지." },
      { en: "No trade? Feels wrong.", ko: "매매 없어? 이상해." },
      { en: "Waiting is losing.", ko: "기다림은 지는 것." },
      { en: "I need a position.", ko: "포지션이 필요해." },
    ],
  },

  ice_whale: {
    first_win: [
      { en: "As expected.", ko: "예상대로였다." },
      { en: "Patience paid. Again.", ko: "인내가 보상됐다. 또." },
      { en: "The floor held.", ko: "플로어가 버텼다." },
      { en: "I knew. I waited.", ko: "알고 있었다. 기다렸다." },
    ],
    big_loss: [
      { en: "This was priced in.", ko: "이건 가격에 반영됐다." },
      { en: "The position breathes.", ko: "포지션이 숨쉰다." },
      { en: "I do not move.", ko: "나는 움직이지 않는다." },
      { en: "Patience is the answer.", ko: "인내가 답이다." },
    ],
    rug_event: [
      { en: "Even this was studied.", ko: "이것도 연구됐다." },
      { en: "They couldn't outlast me.", ko: "그들은 나보다 못 버텼다." },
      { en: "Another scar. Another day.", ko: "또 흉터. 또 하루." },
      { en: "The depth absorbs all.", ko: "심연은 모든 것을 흡수한다." },
    ],
    recovery: [
      { en: "The ice does not crack.", ko: "얼음은 균열이 없다." },
      { en: "I came back. Slowly.", ko: "돌아왔다. 천천히." },
      { en: "Conviction outlasts loss.", ko: "확신이 손실을 이긴다." },
      { en: "This was always the plan.", ko: "이게 항상 계획이었다." },
    ],
    level_up: [
      { en: "The whale grows deeper.", ko: "고래는 더 깊어진다." },
      { en: "One more floor unlocked.", ko: "하나 더 잠금 해제됐다." },
      { en: "Ascending. Without noise.", ko: "올라간다. 소음 없이." },
      { en: "Power accumulates silently.", ko: "힘은 조용히 쌓인다." },
    ],
    idle: [
      { en: "The market will come to me.", ko: "시장이 내게 올 것이다." },
      { en: "I am the floor.", ko: "내가 플로어다." },
      { en: "Still watching.", ko: "아직 보고 있다." },
      { en: "Time is the position.", ko: "시간이 포지션이다." },
    ],
  },

  rug_necromancer: {
    first_win: [
      { en: "The dead can profit.", ko: "죽은 자도 수익낼 수 있다." },
      { en: "I told you. I return.", ko: "말했잖아. 돌아온다고." },
      { en: "Another crown for the corpse.", ko: "시체를 위한 또 하나의 왕관." },
      { en: "Even ruin blooms.", ko: "폐허도 꽃을 피운다." },
    ],
    big_loss: [
      { en: "I've died before.", ko: "전에도 죽었다." },
      { en: "This scar is a trophy.", ko: "이 흉터는 트로피다." },
      { en: "Death is just a dip.", ko: "죽음은 그냥 딥이다." },
      { en: "The rug named me.", ko: "러그가 나를 명명했다." },
    ],
    rug_event: [
      { en: "Again. Same as before.", ko: "또. 전과 같다." },
      { en: "The ritual completes.", ko: "의식이 완료된다." },
      { en: "I was built for this.", ko: "이를 위해 태어났다." },
      { en: "Corruption is just XP.", ko: "부패는 그냥 경험치다." },
    ],
    recovery: [
      { en: "The necromancer rises.", ko: "네크로맨서가 일어난다." },
      { en: "Death is a checkpoint.", ko: "죽음은 체크포인트다." },
      { en: "I never fully left.", ko: "완전히 떠난 적 없었다." },
      { en: "Resurrection. Again.", ko: "부활. 또." },
    ],
    level_up: [
      { en: "A new stage of undeath.", ko: "불사의 새 단계." },
      { en: "The curse deepens.", ko: "저주가 깊어진다." },
      { en: "More rugs, more power.", ko: "러그 많을수록 힘도." },
      { en: "Evolved beyond rekt.", ko: "렉트를 넘어 진화했다." },
    ],
    idle: [
      { en: "The void watches back.", ko: "허공도 나를 본다." },
      { en: "Between rugs, I breathe.", ko: "러그 사이, 나는 숨쉰다." },
      { en: "Waiting for the next rug.", ko: "다음 러그를 기다린다." },
      { en: "Calm before the collapse.", ko: "붕괴 전의 고요함." },
    ],
  },

  diamond_cultist: {
    first_win: [
      { en: "The faith rewarded.", ko: "믿음이 보상됐다." },
      { en: "Still here. Still right.", ko: "아직 여기. 아직 맞다." },
      { en: "Diamond hands deliver.", ko: "다이아몬드 손이 전달한다." },
      { en: "Conviction wins today.", ko: "오늘은 확신이 이겼다." },
    ],
    big_loss: [
      { en: "The belief does not waver.", ko: "믿음은 흔들리지 않는다." },
      { en: "Red candles are tests.", ko: "붉은 캔들은 시험이다." },
      { en: "I average down. Always.", ko: "항상 평단 낮춘다." },
      { en: "The bag is the altar.", ko: "백이 제단이다." },
    ],
    rug_event: [
      { en: "The project shall return.", ko: "프로젝트는 돌아올 것이다." },
      { en: "Rugged in faith.", ko: "믿음으로 러그됐다." },
      { en: "They abandoned. I didn't.", ko: "그들은 떠났다. 난 안 했다." },
      { en: "The cult remains.", ko: "컬트는 남는다." },
    ],
    recovery: [
      { en: "See? Faith works.", ko: "봐? 믿음이 작동한다." },
      { en: "The wait was the way.", ko: "기다림이 길이었다." },
      { en: "Vindicated. As always.", ko: "입증됐다. 항상 그렇듯." },
      { en: "Diamond. Not coal.", ko: "다이아몬드. 석탄이 아니다." },
    ],
    level_up: [
      { en: "The cult ascends.", ko: "컬트가 올라간다." },
      { en: "New tier. Same bags.", ko: "새 티어. 같은 백." },
      { en: "Conviction compound.", ko: "확신이 복리로 쌓인다." },
      { en: "The diamond has facets.", ko: "다이아몬드에 면이 있다." },
    ],
    idle: [
      { en: "Still holding.", ko: "아직 보유 중." },
      { en: "The bags don't move.", ko: "백은 움직이지 않는다." },
      { en: "I am the floor.", ko: "내가 플로어다." },
      { en: "Patience is conviction.", ko: "인내가 확신이다." },
    ],
  },

  sniper_jester: {
    first_win: [
      { en: "Called it. Cashed it.", ko: "예상했다. 현금화했다." },
      { en: "In and out. Count it.", ko: "들어갔다 나왔다. 세어봐." },
      { en: "Ez. Next.", ko: "쉬웠다. 다음." },
      { en: "Snipe complete. Lol.", ko: "스나이프 완료. ㅋㅋ" },
    ],
    big_loss: [
      { en: "Heh. Missed one.", ko: "ㅎㅎ. 하나 놓쳤다." },
      { en: "Speedrun to rekt. PB.", ko: "렉트 스피드런. 개인 최고." },
      { en: "Oops. Lol. Moving on.", ko: "이런. ㅋ. 그냥 감." },
      { en: "Even jesters fall.", ko: "조커도 넘어진다." },
    ],
    rug_event: [
      { en: "Bruh. Rugged. Lmao.", ko: "ㅋㅋ. 러그됐다. 어이없다." },
      { en: "Dev exit. GG no re.", ko: "개발자 탈출. GG no re." },
      { en: "The joke's on me.", ko: "농담이 나한테 왔네." },
      { en: "Took the L. Funny.", ko: "L 받았다. 웃기다." },
    ],
    recovery: [
      { en: "Back again. Lol.", ko: "또 왔다. ㅋㅋ" },
      { en: "Didn't even blink.", ko: "눈도 안 깜짝했다." },
      { en: "Sniper reloaded.", ko: "스나이퍼 재장전됐다." },
      { en: "Comeback arc, speedrun.", ko: "컴백 아크, 스피드런." },
    ],
    level_up: [
      { en: "New tier unlocked. EZ.", ko: "새 티어 잠금 해제. 쉬웠다." },
      { en: "Still faster than you.", ko: "아직 너보다 빠르다." },
      { en: "Leveled up. Barely tried.", ko: "레벨업. 거의 노력도 안 했다." },
      { en: "The jester ascends.", ko: "조커가 올라간다." },
    ],
    idle: [
      { en: "Nothing to snipe? Weird.", ko: "스나이프할 게 없다? 이상해." },
      { en: "Bored. Scanning charts.", ko: "지루하다. 차트 스캔 중." },
      { en: "Trigger finger is itchy.", ko: "방아쇠 손가락이 간지럽다." },
      { en: "Hurry up, market.", ko: "서둘러, 시장아." },
    ],
  },

  ghost_bagholder: {
    first_win: [
      { en: "Oh. It worked.", ko: "오. 됐네." },
      { en: "Did not expect that.", ko: "그럴 줄 몰랐다." },
      { en: "Still here. Somehow.", ko: "아직 여기. 어쩌다." },
      { en: "The bag finally moved.", ko: "백이 드디어 움직였다." },
    ],
    big_loss: [
      { en: "Expected, honestly.", ko: "솔직히 예상했다." },
      { en: "The ghost takes damage.", ko: "유령이 피해를 입는다." },
      { en: "I've forgotten the price.", ko: "가격은 잊었다." },
      { en: "The bag is heavier now.", ko: "백이 더 무거워졌다." },
    ],
    rug_event: [
      { en: "Rugged. I remain.", ko: "러그됐다. 나는 남는다." },
      { en: "Another ghost token.", ko: "또 하나의 유령 토큰." },
      { en: "The devs always leave.", ko: "개발자들은 항상 떠난다." },
      { en: "Sad. But not surprised.", ko: "슬프다. 하지만 놀랍지 않다." },
    ],
    recovery: [
      { en: "Still here. It worked.", ko: "아직 여기. 됐다." },
      { en: "Slowly. Very slowly.", ko: "천천히. 아주 천천히." },
      { en: "The ghost remembers.", ko: "유령은 기억한다." },
      { en: "Survived. Again.", ko: "살아남았다. 또." },
    ],
    level_up: [
      { en: "Leveled up. In ghost mode.", ko: "레벨업. 유령 모드로." },
      { en: "Even ghosts grow.", ko: "유령도 성장한다." },
      { en: "Another floor. Still here.", ko: "또 하나의 층. 아직 여기." },
      { en: "Slowly ascending.", ko: "천천히 올라간다." },
    ],
    idle: [
      { en: "I don't check anymore.", ko: "더 이상 확인 안 한다." },
      { en: "The bag just sits.", ko: "백은 그냥 있다." },
      { en: "Somewhere between here and gone.", ko: "여기와 저기 사이." },
      { en: "Still waiting. As always.", ko: "아직 기다리는 중. 항상 그렇듯." },
    ],
  },
};

/**
 * Pick a dialogue line deterministically.
 *
 * @param archetype - One of 6 archetype IDs
 * @param eventType - What triggered the dialogue
 * @param seed - Numeric seed (e.g. state.crown_count + state.scar_count)
 * @returns DialogueLine with .en and .ko
 */
export function pickDialogue(
  archetype: ArchetypeId,
  eventType: DialogueEventType,
  seed: number,
): DialogueLine {
  const lines = DIALOGUE_BANK[archetype]?.[eventType];
  if (!lines || lines.length === 0) return { en: "...", ko: "..." };
  return lines[Math.abs(seed) % lines.length]!;
}

/**
 * Derive the most relevant event type from a CharacterState.
 * Used for the Monster Room speech bubble ("what is my character saying right now?").
 */
export function deriveDialogueEvent(state: CharacterState): DialogueEventType {
  if (state.mood === "revenge") return "recovery";
  if (state.mood === "euphoria") return "first_win";
  if (state.mood === "despair") return "big_loss";
  if (state.mood === "ghost") return "rug_event";
  if (state.level >= 5) return "level_up";
  return "idle";
}

/**
 * Get the current speech bubble line for a character state.
 * Deterministic — same state → same line.
 */
export function getCharacterDialogue(state: CharacterState): DialogueLine {
  const event = deriveDialogueEvent(state);
  const seed = state.crown_count + state.scar_count + state.level;
  return pickDialogue(state.archetype, event, seed);
}
