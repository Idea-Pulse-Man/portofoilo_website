"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import { stats } from "@/lib/content";
import { useReducedMotion } from "@/lib/hooks";

function Counter({ value }) {
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

export default function Stats() {
  return (
    <section className="stats" id="stats">
      <ul className="stats-list">
        {stats.map((item) => (
          <Reveal as="li" key={item.label}>
            <a href={item.href} className="stats-card">
              <div className="card-icon">
                <Icon name={item.icon} />
              </div>

              <h2 className="h2 card-title">
                <Counter value={item.value} />+ <strong>{item.label}</strong>
              </h2>

              <Icon name="chevron" className="chevron" />
            </a>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
