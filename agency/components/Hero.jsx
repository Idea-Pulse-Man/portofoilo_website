"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { heroSteps, site } from "@/lib/content";
import { clampNum } from "@/lib/hooks";

// three.js only runs in the browser
const Gem = dynamic(() => import("@/components/Gem"), { ssr: false });

export default function Hero() {
  const heroRef = useRef(null);
  const progressRef = useRef(0);
  const [step, setStep] = useState(0);
  const [gemReady, setGemReady] = useState(false);

  // scroll progress (0 → 1) while the hero is pinned; drives the steps and the 3D logo
  useEffect(() => {
    let frame = null;

    const update = () => {
      frame = null;
      const hero = heroRef.current;
      const rect = hero.getBoundingClientRect();
      const progress = clampNum(-rect.top / (rect.height - window.innerHeight), 0, 1);

      progressRef.current = progress;
      hero.style.setProperty("--progress", progress.toFixed(4));
      setStep(progress < 0.34 ? 0 : progress < 0.67 ? 1 : 2);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="hero" id="home" ref={heroRef} data-step={step}>
      <div className="hero-sticky">
        <div className="container hero-grid">
          <div className="hero-content">
            <p className="section-subtitle">{site.tagline}</p>

            <h2 className="h2 hero-title">
              <span className="line">
                <span>We give</span>
              </span>
              <span className="line">
                <span>
                  ideas a <em className="text-gold">pulse.</em>
                </span>
              </span>
            </h2>

            <p className="hero-text">
              {site.name} is a design and development studio. We shape brands, websites, 3D and products, one facet at a
              time.
            </p>

            <div className="btn-group">
              <a href="#contact" className="btn btn-secondary">
                Start a project
              </a>

              <a href="#work" className="btn btn-primary">
                See our work
              </a>
            </div>
          </div>

          <div className={`hero-stage ${gemReady ? "is-ready" : ""}`} data-gem-stage>
            <img
              src="/images/logo-mark.webp"
              width="640"
              height="786"
              alt={`${site.name} logo: a gold-framed glass icosahedron`}
              className="hero-fallback"
            />

            <Gem progressRef={progressRef} heroRef={heroRef} onReady={() => setGemReady(true)} />

            <p className="stage-hint">
              <Icon name="hand" />
              Drag to rotate · Scroll to explore
            </p>
          </div>

          <ol className="hero-steps" aria-label="How an idea becomes a product">
            {heroSteps.map((item, i) => (
              <li className="hero-step" key={item.title}>
                <span className="step-num">0{i + 1}</span>
                <strong>{item.title}</strong>
                <span className="step-text">{item.text}</span>
              </li>
            ))}
          </ol>

          <div className="hero-progress" aria-hidden="true">
            <span />
          </div>
        </div>

        <ul className="hero-social-list">
          {site.social.map((item) => (
            <li key={item.label}>
              <a href={item.href} className="hero-social-link" aria-label={item.label}>
                <Icon name={item.icon} />
                <div className="tooltip">{item.label}</div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
