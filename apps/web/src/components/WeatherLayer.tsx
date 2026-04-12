/**
 * T-ATM-01 — Monster Room Weather Layer.
 *
 * A CSS-only fixed background layer that reacts to mood.
 * 6 mood states → 6 distinct CSS animation backgrounds.
 * Transitions in 500ms on mood change.
 */
"use client";

import { useEffect, useState } from "react";
import type { Mood } from "@degenborn/shared";

const MOOD_CLASS: Record<Mood, string> = {
  neutral: "weather-neutral",
  euphoria: "weather-euphoria",
  despair: "weather-despair",
  revenge: "weather-revenge",
  greed: "weather-greed",
  ghost: "weather-ghost",
};

interface WeatherLayerProps {
  mood: Mood;
}

export default function WeatherLayer({ mood }: WeatherLayerProps) {
  const [activeMood, setActiveMood] = useState<Mood>(mood);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (mood === activeMood) return;
    // Fade out → switch → fade in
    setOpacity(0);
    const t = setTimeout(() => {
      setActiveMood(mood);
      setOpacity(1);
    }, 250);
    return () => clearTimeout(t);
  }, [mood, activeMood]);

  const moodClass = MOOD_CLASS[activeMood] ?? "weather-neutral";

  return (
    <div
      className={`weather-layer ${moodClass}`}
      style={{ opacity: opacity * 0.65, transition: "opacity 250ms ease" }}
      aria-hidden
    />
  );
}
