"use client";

import Image from "next/image";
import Reveal from "@/components/Reveal";
import { work } from "@/lib/content";
import { useReducedMotion } from "@/lib/hooks";

function WorkCard({ item }) {
  const reduced = useReducedMotion();

  const onMove = (event) => {
    if (reduced || event.pointerType !== "mouse") return;

    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    card.style.setProperty("--ry", `${(x - 0.5) * 12}deg`);
    card.style.setProperty("--rx", `${(0.5 - y) * 12}deg`);
    card.style.setProperty("--gx", `${x * 100}%`);
    card.style.setProperty("--gy", `${y * 100}%`);
  };

  const onLeave = (event) => {
    event.currentTarget.style.setProperty("--rx", "0deg");
    event.currentTarget.style.setProperty("--ry", "0deg");
  };

  return (
    <a href="#" className="work-card" onPointerMove={onMove} onPointerLeave={onLeave}>
      <figure className="card-banner">
        <Image
          src={item.image}
          width={1000}
          height={1250}
          sizes="(min-width: 992px) 400px, (min-width: 550px) 50vw, 100vw"
          unoptimized={item.image.endsWith(".svg")}
          alt={item.alt}
          className="w-100"
        />
      </figure>

      <div className="card-content">
        <span className="card-tag">{item.tag}</span>
        <h3 className="h4 card-title">{item.title}</h3>
        <time className="publish-date" dateTime={String(item.year)}>
          {item.year}
        </time>
      </div>

      <span className="card-glare" aria-hidden="true" />
    </a>
  );
}

export default function Work() {
  return (
    <section className="work" id="work">
      <Reveal className="work-head">
        <div className="section-content">
          <p className="section-subtitle">Selected work</p>

          <h2 className="h3 section-title">Facets we have cut lately.</h2>
        </div>

        <a href="#contact" className="btn btn-primary">
          Your project next?
        </a>
      </Reveal>

      <ul className="work-list">
        {work.map((item) => (
          <Reveal as="li" key={item.title}>
            <WorkCard item={item} />
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
