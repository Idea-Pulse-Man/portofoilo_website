"use client";

import Image from "next/image";
import { useRef } from "react";
import Button from "@/components/Button";
import Counter from "@/components/Counter";
import Reveal from "@/components/Reveal";
import Title from "@/components/Title";
import { about, stats } from "@/lib/content";
import { clampNum, useScrollFrame } from "@/lib/hooks";
import { splitWords } from "@/lib/text";

// Replace with a studio/team photo; SVG placeholders skip Next image optimisation
const image = "/images/studio.svg";

const words = splitWords(about.statement);

export default function About() {
  const statementRef = useRef(null);

  // the statement lights up word by word as it scrolls up the screen
  useScrollFrame(() => {
    const el = statementRef.current;
    const rect = el.getBoundingClientRect();
    const progress = clampNum((window.innerHeight * 0.8 - rect.top) / (rect.height + window.innerHeight * 0.3), 0, 1);
    el.style.setProperty("--progress", progress.toFixed(3));
  });

  return (
    <section className="about on-blue" id="about">
      <p className="section-subtitle">
        <span className="section-index">(01)</span> About us
      </p>

      <p className="about-statement" ref={statementRef} style={{ "--count": words.length }}>
        {words.map((word, i) => (
          <span key={i} style={{ "--i": i }}>
            {word.accent ? <em className="accent">{word.text}</em> : word.text}{" "}
          </span>
        ))}
      </p>

      <Reveal className="about-panel panel">
        <figure className="about-banner">
          <Image
            src={image}
            width={1400}
            height={1000}
            sizes="(min-width: 992px) 560px, 100vw"
            loading="eager"
            unoptimized={image.endsWith(".svg")}
            alt="Glass and gold geodesic sphere glowing on a dark background"
            className="w-100"
          />
        </figure>

        <div className="about-content">
          <Title as="h2" text={about.title} className="h3 about-title" />

          <p className="section-text">{about.text}</p>

          <ul className="about-stats">
            {stats.map((item) => (
              <li key={item.label}>
                <strong className="about-stat-value">
                  <Counter value={item.value} />+
                </strong>
                <span className="about-stat-label">{item.label}</span>
              </li>
            ))}
          </ul>

          <div className="btn-group">
            <Button href="#contact" icon="arrow">
              Work with us
            </Button>

            <Button href="#process" variant="primary">
              Our process
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
