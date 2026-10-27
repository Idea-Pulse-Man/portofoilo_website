"use client";

import { useEffect } from "react";

// animation-line: white pentagon particles drifting and linked by thin lines.
// Here it is a fixed layer behind the whole site (see #animation-line in globals.css).
const config = {
  particles: {
    number: { value: 30, density: { enable: true, value_area: 800 } },
    color: { value: "#ffffff" },
    shape: {
      type: "polygon",
      stroke: { width: 0, color: "#000000" },
      polygon: { nb_sides: 5 },
    },
    opacity: { value: 0.5, random: false, anim: { enable: false } },
    size: { value: 3, random: true, anim: { enable: false } },
    line_linked: {
      enable: true,
      distance: 150,
      color: "#ffffff",
      opacity: 0.4,
      width: 1,
    },
    move: {
      enable: true,
      speed: 4,
      direction: "none",
      random: true,
      straight: false,
      out_mode: "out",
      bounce: false,
      attract: { enable: false, rotateX: 600, rotateY: 1200 },
    },
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: { enable: false, mode: "grab" },
      onclick: { enable: true, mode: "push" },
      resize: true,
    },
    modes: {
      grab: { distance: 400, line_linked: { opacity: 1 } },
      push: { particles_nb: 4 },
    },
  },
  retina_detect: true,
};

const destroy = () => {
  window.pJSDom?.forEach((p) => p.pJS.fn.vendors.destroypJS());
  window.pJSDom = [];
};

export default function AnimationLine() {
  useEffect(() => {
    let cancelled = false;

    import("particles.js").then(() => {
      if (cancelled) return;
      destroy();
      window.particlesJS("animation-line", config);
    });

    // Content covers the canvas, so clicks anywhere on the page (except controls) add particles too
    const onClick = (event) => {
      if (!window.pJSDom?.length) return;
      if (event.target.closest("a, button, input, textarea, label, select, summary, [data-gem-stage], .particles-js-canvas-el")) return;

      const pJS = window.pJSDom[0].pJS;
      if (pJS.particles.array.length > 120) return;

      pJS.fn.modes.pushParticles(pJS.interactivity.modes.push.particles_nb, {
        pos_x: event.clientX * pJS.canvas.pxratio,
        pos_y: event.clientY * pJS.canvas.pxratio,
      });
    };

    document.addEventListener("click", onClick);

    return () => {
      cancelled = true;
      document.removeEventListener("click", onClick);
      destroy();
    };
  }, []);

  return <div id="animation-line" aria-hidden="true" />;
}
