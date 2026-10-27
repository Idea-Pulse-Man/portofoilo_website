"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks";

/** Counts up from 0 to `value` the first time it scrolls into view */
export default function Counter({ value }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let frame = null;

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();

      if (reduced) {
        setCurrent(value);
        return;
      }

      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / 1600);
        setCurrent(Math.round(value * (1 - Math.pow(1 - t, 3))));
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    });

    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value, reduced]);

  return <span ref={ref}>{current}</span>;
}
