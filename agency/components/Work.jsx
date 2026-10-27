"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import Button from "@/components/Button";
import SectionHead from "@/components/SectionHead";
import { work } from "@/lib/content";
import { clampNum, useMediaQuery, useScrollFrame } from "@/lib/hooks";

const pad = (n) => String(n).padStart(2, "0");

export default function Work() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const countRef = useRef(null);
  const travelRef = useRef(0);
  // same query as the pinned layout in globals.css
  const pinned = useMediaQuery("(min-width: 992px) and (prefers-reduced-motion: no-preference)");

  // desktop: the section is pinned and vertical scrolling slides the cards sideways
  useScrollFrame(() => {
    const section = sectionRef.current;
    const track = trackRef.current;

    if (!pinned) {
      travelRef.current = 0;
      section.style.height = "";
      track.style.transform = "";
      return;
    }

    const travel = Math.max(0, track.offsetWidth - section.clientWidth);
    if (travel !== travelRef.current) {
      travelRef.current = travel;
      section.style.height = `${travel + window.innerHeight}px`;
    }

    const progress = travel ? clampNum(-section.getBoundingClientRect().top / travel, 0, 1) : 0;
    track.style.transform = `translate3d(${(-progress * travel).toFixed(1)}px, 0, 0)`;
    section.style.setProperty("--progress", progress.toFixed(4));
    countRef.current.textContent = pad(Math.min(work.length, Math.floor(progress * work.length) + 1));

    // parallax inside each picture, by how far the card is from the middle of the screen
    for (const img of track.querySelectorAll(".card-banner img")) {
      const rect = img.parentElement.getBoundingClientRect();
      const offset = (rect.left + rect.width / 2 - window.innerWidth / 2) / window.innerWidth;
      img.style.translate = `${(offset * -8).toFixed(2)}% 0`;
    }
  }, [pinned]);

  // keyboard users: tabbing to a card scrolls the page so the card slides into view
  const onFocus = (event) => {
    const item = event.target.closest(".work-item");
    const travel = travelRef.current;
    if (!pinned || !item || !travel) return;

    const start = parseFloat(getComputedStyle(trackRef.current).paddingLeft);
    const progress = clampNum((item.offsetLeft - start) / travel, 0, 1);
    const top = sectionRef.current.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + progress * travel, behavior: "instant" });
  };

  return (
    <section className={`work on-blue ${pinned ? "is-pinned" : ""}`} id="work" ref={sectionRef}>
      <div className="work-sticky">
        <div className="container work-head">
          <SectionHead index="02" label="Selected work" title="Facets we have cut *lately.*" />

          <p className="work-counter" aria-hidden="true">
            <span ref={countRef}>01</span> / {pad(work.length)}
            <span className="work-bar">
              <span />
            </span>
          </p>
        </div>

        <ul className="work-track" ref={trackRef} onFocus={onFocus}>
          {work.map((item, i) => (
            <li className="work-item" key={item.slug}>
              <Link href={`/work/${item.slug}`} className="work-card" data-cursor="View">
                <figure className="card-banner">
                  <Image
                    src={item.image}
                    width={1000}
                    height={1250}
                    sizes="(min-width: 992px) 460px, (min-width: 550px) 50vw, 100vw"
                    unoptimized={item.image.endsWith(".svg")}
                    alt={item.alt}
                  />
                </figure>

                <div className="card-content">
                  <span className="card-index">{pad(i + 1)}</span>
                  <h3 className="h4 card-title">{item.title}</h3>
                  <span className="card-tag">{item.tag}</span>
                  <time className="publish-date" dateTime={String(item.year)}>
                    {item.year}
                  </time>
                </div>
              </Link>
            </li>
          ))}

          <li className="work-item work-end">
            <p className="work-end-title">
              Your project <em className="accent">next?</em>
            </p>

            <Button href="#contact" icon="arrow">
              Start a project
            </Button>
          </li>
        </ul>
      </div>
    </section>
  );
}
