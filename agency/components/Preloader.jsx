"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/content";

const DURATION = 1500;

// First visit of the session: a short branded intro (counter + heartbeat line), then the curtain lifts.
// The boot script in layout.js decides: <html class="is-loading"> plays it, "is-loaded" skips it.
export default function Preloader() {
  const countRef = useRef(null);
  const [phase, setPhase] = useState("intro"); // intro → leaving → done

  useEffect(() => {
    if (!document.documentElement.classList.contains("is-loading")) {
      setPhase("done");
      return;
    }

    let frame = null;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / DURATION);
      countRef.current.textContent = Math.round((1 - Math.pow(1 - t, 3)) * 100);
      if (t < 1) frame = requestAnimationFrame(tick);
      else setPhase("leaving");
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (phase !== "leaving") return;

    // the curtain is already lifting: start the page's entrance animations underneath it
    document.documentElement.classList.replace("is-loading", "is-loaded");
    try {
      sessionStorage.setItem("intro-seen", "1");
    } catch (err) {
      /* storage unavailable */
    }

    const timer = setTimeout(() => setPhase("done"), 1200);
    return () => clearTimeout(timer);
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div className={`preloader ${phase === "leaving" ? "is-leaving" : ""}`} aria-hidden="true">
      <div className="preloader-brand">
        <img src="/images/logo-mark.webp" width="80" height="98" alt="" className="preloader-mark" />

        <p className="preloader-name">
          {site.name}
          <span>.</span>
        </p>

        <svg className="preloader-pulse" viewBox="0 0 300 60">
          <path d="M0 30 H105 L118 30 L128 8 L140 52 L150 30 H190 L200 30 L208 18 L216 42 L224 30 H300" pathLength="1" />
        </svg>
      </div>

      <p className="preloader-count">
        <span ref={countRef}>0</span>%
      </p>
    </div>
  );
}
