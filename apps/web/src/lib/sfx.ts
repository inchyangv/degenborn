/**
 * Sound effect stubs for hackathon demo.
 * Actual .mp3 files would go in /public/sfx/
 * Using Web Audio API to synthesize a short synth sting without external files.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

/** Short synth sting for Genesis Birth reveal (~0.8s) */
export function playSynthSting() {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "square";
  osc.frequency.setValueAtTime(220, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
  osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.6);
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.8);
}

/** Short tick for UI mutation events */
export function playMutationTick() {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(660, ctx.currentTime);
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.12);
}

/** Global mute state — persisted in localStorage */
export function isMuted(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("sfx_muted") === "true";
}

export function toggleMute(): boolean {
  const next = !isMuted();
  localStorage.setItem("sfx_muted", String(next));
  return next;
}

export function playIfUnmuted(fn: () => void) {
  if (!isMuted()) fn();
}
