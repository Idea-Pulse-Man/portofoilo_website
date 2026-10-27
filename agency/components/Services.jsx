"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import { services, stack } from "@/lib/content";

/** Image that follows the cursor while hovering the service list (hidden on touch screens via CSS) */
function usePreview() {
  const previewRef = useRef(null);
  const motion = useRef({ x: 0, y: 0, tx: 0, ty: 0, frame: null, active: false });
  const [image, setImage] = useState(services[0].image);
  const [active, setActive] = useState(false);

  useEffect(() => () => cancelAnimationFrame(motion.current.frame), []);

  const loop = () => {
    const m = motion.current;
    m.x += (m.tx - m.x) * 0.18;
    m.y += (m.ty - m.y) * 0.18;
    previewRef.current.style.transform = `translate(${m.x}px, ${m.y}px) rotate(${(m.tx - m.x) * 0.05}deg)`;
    m.frame = m.active ? requestAnimationFrame(loop) : null;
  };

  const enter = (event, src) => {
    const m = motion.current;
    setImage(src);
    if (!m.active) {
      m.x = m.tx = event.clientX + 24;
      m.y = m.ty = event.clientY - 110;
    }
    m.active = true;
    setActive(true);
    if (!m.frame) m.frame = requestAnimationFrame(loop);
  };

  const move = (event) => {
    motion.current.tx = event.clientX + 24;
    motion.current.ty = event.clientY - 110;
  };

  const leave = () => {
    motion.current.active = false;
    setActive(false);
  };

  return { previewRef, image, active, enter, move, leave };
}

export default function Services() {
  const [tab, setTab] = useState("services");
  const [open, setOpen] = useState(0);
  const preview = usePreview();
  const showStack = tab === "stack";

  return (
    <>
      <Reveal as="section" className="services panel" id="services">
        <div className="services-content section-content">
          <SectionHead index="03" label="What we do" title="Every idea has many *facets.*" />

          <p className="section-text">
            One team for the whole journey, from the first sketch to the launch and beyond. Open a service to see what
            is inside.
          </p>

          <div className={`skills-toggle ${showStack ? "active" : ""}`} role="tablist">
            <button
              className={`toggle-btn ${showStack ? "" : "active"}`}
              role="tab"
              aria-selected={!showStack}
              onClick={() => setTab("services")}
            >
              Services
            </button>

            <button
              className={`toggle-btn ${showStack ? "active" : ""}`}
              role="tab"
              aria-selected={showStack}
              onClick={() => setTab("stack")}
            >
              Stack
            </button>
          </div>
        </div>

        <div className={`skills-box ${showStack ? "active" : ""}`}>
          <ul className="service-list" onMouseLeave={preview.leave}>
            {services.map((item, i) => (
              <li className={`service-item ${open === i ? "is-open" : ""}`} key={item.title}>
                <button
                  className="service-row"
                  aria-expanded={open === i}
                  aria-controls={`service-${i}`}
                  onClick={() => setOpen(open === i ? -1 : i)}
                  onMouseEnter={(event) => preview.enter(event, item.image)}
                  onMouseMove={preview.move}
                >
                  <span className="service-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="service-body">
                    <span className="h4 service-title">{item.title}</span>
                    <span className="service-text">{item.text}</span>
                  </span>
                  <span className="service-toggle" aria-hidden="true" />
                </button>

                <div className="service-panel" id={`service-${i}`} inert={open !== i}>
                  <div>
                    <ul className="service-tags" aria-label={`${item.title} includes`}>
                      {item.deliverables.map((deliverable) => (
                        <li key={deliverable}>{deliverable}</li>
                      ))}
                    </ul>

                    <a href="#contact" className="service-link" aria-label={`Get a quote for ${item.title}`}>
                      Get a quote <Icon name="arrow" />
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <ul className="stack-list">
            {stack.map((item) => (
              <li className="stack-chip" key={item.label}>
                <Icon name={item.icon} /> {item.label}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      {/* outside the panel: the panel's backdrop-filter would become this fixed preview's positioning box */}
      <figure className={`service-preview ${preview.active ? "active" : ""}`} ref={preview.previewRef} aria-hidden="true">
        <img src={preview.image} alt="" />
      </figure>
    </>
  );
}
