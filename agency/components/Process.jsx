"use client";

import { useRef, useState } from "react";
import SectionHead from "@/components/SectionHead";
import { processSteps } from "@/lib/content";
import { clampNum, useScrollFrame } from "@/lib/hooks";

// four heartbeats, one per step
const PULSE_D =
  "M0 100 H110 L135 100 L150 30 L170 150 L190 100 H410 L435 100 L450 20 L470 150 L490 100 H710 L735 100 L750 15 L770 150 L790 100 H1010 L1035 100 L1050 10 L1070 150 L1090 100 H1200";

export default function Process() {
  const sectionRef = useRef(null);
  const pathRef = useRef(null);
  const lengthRef = useRef(0);
  const [activeCount, setActiveCount] = useState(0);

  // the heartbeat line draws itself while the section scrolls through the viewport
  useScrollFrame(() => {
    const path = pathRef.current;
    if (!lengthRef.current) {
      lengthRef.current = path.getTotalLength();
      path.style.strokeDasharray = lengthRef.current;
    }

    const rect = sectionRef.current.getBoundingClientRect();
    const progress = clampNum((window.innerHeight * 0.85 - rect.top) / (rect.height * 0.9), 0, 1);

    path.style.strokeDashoffset = lengthRef.current * (1 - progress);
    setActiveCount(Math.floor(progress * processSteps.length + 0.5));
  });

  return (
    <section className="process panel" id="process" ref={sectionRef}>
      <SectionHead index="04" label="How we work" title="From spark to launch in four *beats.*" />

      <svg className="pulse-line" viewBox="0 0 1200 160" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="pulse-gradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#3ef0d8" />
            <stop offset="1" stopColor="#f2c14e" />
          </linearGradient>
        </defs>
        <path className="pulse-track" d={PULSE_D} />
        <path className="pulse-path" d={PULSE_D} ref={pathRef} />
      </svg>

      <ol className="process-list">
        {processSteps.map((item, i) => (
          <li className={`process-step ${i < activeCount ? "active" : ""}`} key={item.title}>
            <span className="step-num">0{i + 1}</span>
            <h3 className="h4">{item.title}</h3>
            <span className="process-time">{item.time}</span>
            <p>{item.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
