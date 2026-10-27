"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import SectionHead from "@/components/SectionHead";
import { testimonials } from "@/lib/content";

const initials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("");

// One quote at a time. The active dot's fill animation is the timer: when it ends, the next quote shows,
// and pausing the animation (hover, focus) pauses the carousel. "Reduce motion" turns it off.
export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touched, setTouched] = useState(false);
  const total = testimonials.length;

  const show = (next) => {
    setTouched(true);
    setIndex((next + total) % total);
  };

  return (
    <section
      className="testimonials on-blue"
      id="testimonials"
      aria-roledescription="carousel"
      aria-label="What clients say"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setPaused(false)}
    >
      <SectionHead index="05" label="Kind words" title="Clients who felt the *pulse.*" />

      <div className="quote-stack" aria-live={touched ? "polite" : "off"}>
        {testimonials.map((item, i) => (
          <figure
            className={`quote ${i === index ? "is-active" : ""}`}
            key={item.name}
            aria-hidden={i !== index}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${total}`}
          >
            <blockquote>
              <p>{item.quote}</p>
            </blockquote>

            <figcaption className="quote-author">
              <span className="quote-avatar" aria-hidden="true">
                {initials(item.name)}
              </span>
              <span>
                <strong>{item.name}</strong>
                <span className="quote-role">{item.role}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="quote-controls">
        <ol className={`quote-dots ${paused ? "is-paused" : ""}`}>
          {testimonials.map((item, i) => (
            <li key={item.name}>
              <button
                aria-label={`Show quote ${i + 1}: ${item.name}`}
                aria-current={i === index}
                onClick={() => show(i)}
              >
                <span key={i === index ? index : "idle"} onAnimationEnd={() => setIndex((index + 1) % total)} />
              </button>
            </li>
          ))}
        </ol>

        <div className="quote-nav">
          <button aria-label="Previous quote" onClick={() => show(index - 1)} data-magnetic="">
            <Icon name="chevron-back" />
          </button>

          <button aria-label="Next quote" onClick={() => show(index + 1)} data-magnetic="">
            <Icon name="chevron-forward" />
          </button>
        </div>
      </div>
    </section>
  );
}
