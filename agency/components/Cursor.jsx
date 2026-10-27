"use client";

import { useEffect, useRef, useState } from "react";

const FIELD = "input, textarea, select, [contenteditable]";
const LINK = "a, button, label, summary, [role='tab']";

// Mouse only: a dot plus a trailing ring that grows over links and shows a label over [data-cursor] elements.
// It also drives [data-magnetic] elements, which lean toward the pointer.
// Hidden by CSS until <html> gets .has-cursor.
export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [mode, setMode] = useState("hidden"); // hidden | default | link | label | field
  const [label, setLabel] = useState("");
  const [down, setDown] = useState(false);

  useEffect(() => {
    const query = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
    if (!window.matchMedia(query).matches) return;

    const html = document.documentElement;
    const pos = { x: 0, y: 0, rx: 0, ry: 0 };
    let frame = null;
    let hidden = true;
    let magnet = null;
    let magnetRect = null;

    html.classList.add("has-cursor");

    // the ring eases after the dot; the loop stops once it has caught up
    const follow = () => {
      pos.rx += (pos.x - pos.rx) * 0.2;
      pos.ry += (pos.y - pos.ry) * 0.2;
      ringRef.current.style.transform = `translate3d(${pos.rx}px, ${pos.ry}px, 0)`;
      const settled = Math.abs(pos.x - pos.rx) < 0.1 && Math.abs(pos.y - pos.ry) < 0.1;
      frame = settled ? null : requestAnimationFrame(follow);
    };

    const release = () => {
      if (magnet) magnet.style.translate = "";
      magnet = magnetRect = null;
    };

    const onMove = (event) => {
      if (event.pointerType !== "mouse") return;
      pos.x = event.clientX;
      pos.y = event.clientY;
      dotRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;

      if (hidden) {
        hidden = false;
        pos.rx = pos.x;
        pos.ry = pos.y;
        setMode((current) => (current === "hidden" ? "default" : current));
      }
      if (!frame) frame = requestAnimationFrame(follow);

      if (magnet) {
        const dx = event.clientX - (magnetRect.left + magnetRect.width / 2);
        const dy = event.clientY - (magnetRect.top + magnetRect.height / 2);
        magnet.style.translate = `${dx * 0.3}px ${dy * 0.3}px`;
      }
    };

    const onOver = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const labelled = target.closest("[data-cursor]");
      if (target.closest(FIELD)) setMode("field");
      else if (labelled) {
        setMode("label");
        setLabel(labelled.dataset.cursor);
      } else setMode(target.closest(LINK) ? "link" : "default");

      const next = target.closest("[data-magnetic]");
      if (next !== magnet) {
        release();
        if (next) {
          magnet = next;
          magnetRect = next.getBoundingClientRect();
        }
      }
    };

    const onLeave = () => {
      hidden = true;
      setMode("hidden");
      release();
    };
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    html.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("scroll", release, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      html.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", release);
      if (frame) cancelAnimationFrame(frame);
      release();
      html.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div className={`cursor is-${mode} ${down ? "is-down" : ""}`} aria-hidden="true">
      <div className="cursor-ring" ref={ringRef}>
        <span className="cursor-label">{label}</span>
      </div>
      <div className="cursor-dot" ref={dotRef} />
    </div>
  );
}
