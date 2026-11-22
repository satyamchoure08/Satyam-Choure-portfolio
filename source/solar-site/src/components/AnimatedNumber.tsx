"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  format?: (value: number) => string;
  /** Tween length in ms. */
  duration?: number;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const defaultFormat = (n: number) => n.toLocaleString("en-IN");

/**
 * Rolls smoothly from the previous value to the new one.
 * Screen readers get only the final value (the rolling digits are aria-hidden),
 * so live regions don't announce every in-between number.
 */
export default function AnimatedNumber({ value, format = defaultFormat, duration = 550 }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const shown = useRef(value);

  useEffect(() => {
    const from = shown.current;
    if (from === value) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      shown.current = value;
      setDisplay(value);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const next = from + (value - from) * easeOutCubic(progress);
      shown.current = next;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return (
    <>
      <span aria-hidden="true">{format(Math.round(display))}</span>
      <span className="sr-only">{format(value)}</span>
    </>
  );
}
