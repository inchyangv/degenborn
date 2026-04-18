/**
 * 1.4 (P1): Signature Sound / Short Voice Lines — archetype-specific audio identity.
 *
 * ElevenLabs integration config + fallback text-to-speech via Web Speech API.
 * Each archetype gets a 12-second voice line in character.
 *
 * Production: pre-generate MP3s via ElevenLabs at build time → store in /public/sfx/
 * Demo: use Web Speech API (browser built-in TTS) with archetype-appropriate pitch/rate.
 */

export interface VoiceConfig {
  pitch: number;   // 0.1–2.0 (default 1.0)
  rate: number;    // 0.1–10.0 (default 1.0)
  volume: number;  // 0.0–1.0
  voice_name_hint?: string; // hints for voice selection (browser-dependent)
}

export interface ArchetypeVoiceLine {
  archetype: string;
  line_en: string;
  line_ko: string;
  line_zh: string;
  voice_config: VoiceConfig;
  elevenlabs_voice_id?: string; // prod: set when ElevenLabs voices are assigned
  sfx_url?: string;             // prod: /public/sfx/{archetype}.mp3
}

export const ARCHETYPE_VOICE_LINES: ArchetypeVoiceLine[] = [
  {
    archetype: "mad_gambler",
    line_en: "I don't have a strategy. I have a vibe. The charts are speaking to me. All in.",
    line_ko: "전략 없음. 그냥 감. 차트가 나한테 말하고 있음. 풀매수.",
    line_zh: "我没有策略，我有感觉。K线在对我说话。梭哈。",
    voice_config: { pitch: 1.3, rate: 1.2, volume: 0.9 },
    sfx_url: "/sfx/mad_gambler.mp3",
  },
  {
    archetype: "ice_whale",
    line_en: "I have been holding since 2021. The others have come and gone. I remain.",
    line_ko: "나는 2021년부터 존버 중. 다들 왔다 갔다. 나는 아직 여기 있음.",
    line_zh: "我从2021年就开始持有了。其他人来了又去。我还在。",
    voice_config: { pitch: 0.7, rate: 0.75, volume: 0.8 },
    sfx_url: "/sfx/ice_whale.mp3",
  },
  {
    archetype: "rug_necromancer",
    line_en: "You called it a rug. I call it a tutorial. I am still here. I will always be here.",
    line_ko: "넌 러그라고 했지. 나는 튜토리얼이라고 함. 나는 아직 여기 있음. 영원히 있을 것임.",
    line_zh: "你叫它割韭菜，我叫它入门教程。我还在这里。我会一直在这里。",
    voice_config: { pitch: 0.8, rate: 0.9, volume: 1.0 },
    sfx_url: "/sfx/rug_necromancer.mp3",
  },
  {
    archetype: "diamond_cultist",
    line_en: "Selling is for people who don't believe. I believe. The number will go up. Eventually.",
    line_ko: "파는 건 믿음 없는 사람들이 하는 거임. 나는 믿음. 언젠가 오를 거임.",
    line_zh: "卖出是不信仰者的行为。我信仰。迟早会涨的。",
    voice_config: { pitch: 0.9, rate: 0.85, volume: 0.9 },
    sfx_url: "/sfx/diamond_cultist.mp3",
  },
  {
    archetype: "sniper_jester",
    line_en: "Nobody actually knows when to sell. I just press buttons really fast and hope for the best.",
    line_ko: "아무도 진짜로 언제 팔아야 하는지 모름. 나는 그냥 빠르게 버튼 누르고 운 믿음.",
    line_zh: "没人真的知道什么时候卖。我只是手速快然后靠运气。",
    voice_config: { pitch: 1.2, rate: 1.4, volume: 0.95 },
    sfx_url: "/sfx/sniper_jester.mp3",
  },
  {
    archetype: "ghost_bagholder",
    line_en: "I am not holding bags. I am... curating a portfolio of opportunities. That have not matured yet.",
    line_ko: "나는 잡코인 들고 있는 게 아님. 그냥... 아직 때가 안 된 포트폴리오를 큐레이팅 중.",
    line_zh: "我不是在抱着死币。我在...策划一个还未成熟的机会组合。",
    voice_config: { pitch: 0.85, rate: 0.8, volume: 0.7 },
    sfx_url: "/sfx/ghost_bagholder.mp3",
  },
];

export function getVoiceLine(archetype: string, locale: "en" | "ko" | "zh" = "en"): string {
  const config = ARCHETYPE_VOICE_LINES.find((v) => v.archetype === archetype);
  if (!config) return "I am a degen. This is my wallet.";
  return locale === "ko" ? config.line_ko : locale === "zh" ? config.line_zh : config.line_en;
}

/** Play voice line using Web Speech API (browser TTS — no external service) */
export function playVoiceLine(archetype: string, locale: "en" | "ko" | "zh" = "en"): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  const config = ARCHETYPE_VOICE_LINES.find((v) => v.archetype === archetype);
  if (!config) return;

  const text = getVoiceLine(archetype, locale);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = config.voice_config.pitch;
  utterance.rate = config.voice_config.rate;
  utterance.volume = config.voice_config.volume;
  utterance.lang = locale === "ko" ? "ko-KR" : locale === "zh" ? "zh-CN" : "en-US";

  window.speechSynthesis.cancel(); // Stop any ongoing speech
  window.speechSynthesis.speak(utterance);
}
