"use client";

import { useEffect } from "react";
import Lenis from "lenis";

// Inertia scrolling (Lenis). The page still scrolls natively underneath, so the sticky sections and
// scroll listeners work as before. Same-page #links glide to their target. Off for "reduce motion".
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ autoRaf: true, stopInertiaOnNavigate: true });
    const html = document.documentElement;

    // the intro and the open menu lock scrolling through classes on <html>
    const syncLock = () => {
      if (html.classList.contains("is-loading") || html.classList.contains("menu-open")) lenis.stop();
      else lenis.start();
    };
    const observer = new MutationObserver(syncLock);
    observer.observe(html, { attributeFilter: ["class"] });
    syncLock();

    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;

      const link = event.target.closest?.("a[href*='#']");
      if (!link) return;

      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;

      const id = decodeURIComponent(url.hash.slice(1));
      const target = id === "top" ? 0 : document.getElementById(id);
      if (target === null) return;

      event.preventDefault();
      history.pushState(null, "", url.hash);

      // next frame: a menu link first closes the menu, which unlocks scrolling
      requestAnimationFrame(() => {
        lenis.scrollTo(target, { duration: 1.6 });
        if (link.classList.contains("skip-link")) target.focus({ preventScroll: true });
      });
    };

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      observer.disconnect();
      lenis.destroy();
    };
  }, []);

  return null;
}
