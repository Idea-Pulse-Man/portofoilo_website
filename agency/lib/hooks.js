"use client";

import { useEffect, useEffectEvent, useState } from "react";

/** true while the media query matches (false during server render) */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/** respects the visitor's "reduce motion" setting */
export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

/**
 * Calls `update` once, then on every scroll and resize (at most once per frame).
 * Pass `deps` to run it again when they change.
 */
export function useScrollFrame(update, deps = []) {
  const onFrame = useEffectEvent(update);

  useEffect(() => {
    let frame = null;

    const run = () => {
      frame = null;
      onFrame();
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(run);
    };

    run();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export const clampNum = (v, min, max) => Math.min(max, Math.max(min, v));
