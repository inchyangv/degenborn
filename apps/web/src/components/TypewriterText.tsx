/**
 * T-ATM-03 — Typing Effect on Dialogue.
 *
 * Renders text character by character at 50ms/char.
 * Respects prefers-reduced-motion (shows full text immediately).
 */
"use client";

import { useEffect, useState, useRef } from "react";

interface TypewriterTextProps {
  text: string;
  /** ms per character (default 50) */
  speed?: number;
  /** CSS class to apply to the container */
  className?: string;
  /** Called when typing is complete */
  onComplete?: () => void;
  /** If true, skip animation and show immediately */
  instant?: boolean;
}

export default function TypewriterText({
  text,
  speed = 50,
  className,
  onComplete,
  instant = false,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState(instant ? text : "");
  const [done, setDone] = useState(instant);
  const prevTextRef = useRef(text);

  useEffect(() => {
    // Check for reduced motion preference
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (instant || reduced) {
      setDisplayed(text);
      setDone(true);
      onComplete?.();
      return;
    }

    // Reset when text changes
    if (prevTextRef.current !== text) {
      prevTextRef.current = text;
      setDisplayed("");
      setDone(false);
    }

    let i = displayed.length;
    if (i >= text.length) {
      setDone(true);
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, instant]);

  return (
    <span className={className}>
      {displayed}
      {!done && (
        <span
          aria-hidden
          className="inline-block w-0.5 h-[1em] bg-current align-middle ml-0.5 animate-pulse"
          style={{ animationDuration: "0.6s" }}
        />
      )}
    </span>
  );
}
