"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import Icon from "@/components/Icon";
import SiteLink from "@/components/SiteLink";
import { nav, site } from "@/lib/content";
import { useMediaQuery, useScrollFrame } from "@/lib/hooks";

export function Logo() {
  const home = usePathname() === "/";

  return (
    <p className="h1 logo">
      <SiteLink href={home ? "#top" : "/"} aria-label={`${site.name}, home`}>
        <img src="/images/logo-mark.webp" width="40" height="49" alt="" className="logo-mark" />
        {site.name}
        <span>.</span>
      </SiteLink>
    </p>
  );
}

function ThemeToggle() {
  const [light, setLight] = useState(false);

  // pick up the theme restored by the boot script in layout.js
  useEffect(() => {
    setLight(document.body.classList.contains("light_theme"));
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    document.body.classList.toggle("light_theme", next);
    document.body.classList.toggle("dark_theme", !next);
    try {
      localStorage.setItem("theme", next ? "light_theme" : "dark_theme");
    } catch (err) {
      /* storage unavailable */
    }
  };

  return (
    <button className={`theme-btn ${light ? "active" : ""}`} aria-label="Change Theme" title="Change Theme" onClick={toggle}>
      <span className="icon" />
    </button>
  );
}

/** label that rolls up on hover (the copy is for the eye only) */
const Roll = ({ children }) => (
  <span className="roll">
    <span>{children}</span>
    <span aria-hidden="true">{children}</span>
  </span>
);

export default function Header() {
  const pathname = usePathname();
  const home = pathname === "/";
  const desktop = useMediaQuery("(min-width: 992px)");
  const [bar, setBar] = useState({ scrolled: false, hidden: false, active: "" });
  // the menu belongs to the page it was opened on, so navigating closes it
  const [menuPath, setMenuPath] = useState(null);
  const open = menuPath === pathname && !desktop;
  const scroll = useRef({ last: 0, turn: 0, dir: 0 });

  useScrollFrame(() => {
    const y = window.scrollY;
    const s = scroll.current;
    const dir = y > s.last ? 1 : y < s.last ? -1 : s.dir;
    if (dir !== s.dir) {
      s.turn = s.last;
      s.dir = dir;
    }
    s.last = y;

    // the last section whose top has passed 40% of the screen
    let active = "";
    if (home) {
      for (const item of nav) {
        const section = document.getElementById(item.href.slice(1));
        if (section && section.getBoundingClientRect().top <= window.innerHeight * 0.4) active = item.href;
      }
    }

    setBar((prev) => {
      let hidden = prev.hidden;
      if (y < 300) hidden = false;
      else if (dir === 1 && y - s.turn > 60) hidden = true;
      else if (dir === -1 && s.turn - y > 60) hidden = false;

      const scrolled = y >= 10;
      if (prev.hidden === hidden && prev.scrolled === scrolled && prev.active === active) return prev;
      return { scrolled, hidden, active };
    });
  }, [home]);

  // while the menu is open: lock scrolling, make the page behind it inert, close on Escape
  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    document.querySelectorAll("main, .footer").forEach((el) => (el.inert = open));
    if (!open) return;

    const onKey = (event) => {
      if (event.key === "Escape") setMenuPath(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setMenuPath(null);

  return (
    <header className={`header ${bar.scrolled ? "active" : ""} ${bar.hidden && !open ? "is-hidden" : ""}`}>
      <div className="container">
        <Logo />

        <nav className="header-nav" aria-label="Main">
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <SiteLink href={item.href} className={`header-link ${bar.active === item.href ? "is-active" : ""}`}>
                  <Roll>{item.label}</Roll>
                </SiteLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="navbar-actions">
          <Button href="#contact" className="header-cta">
            Start a project
          </Button>

          <ThemeToggle />
        </div>

        <button
          className={`nav-toggle-btn ${open ? "active" : ""}`}
          aria-label="Toggle Menu"
          aria-expanded={open}
          aria-controls="site-menu"
          title="Toggle Menu"
          onClick={() => setMenuPath(open ? null : pathname)}
        >
          <span className="one" />
          <span className="two" />
          <span className="three" />
        </button>

        <nav className={`navbar ${open ? "active" : ""}`} id="site-menu" aria-label="Menu">
          <ul className="navbar-list">
            {nav.map((item, i) => (
              <li key={item.href}>
                <SiteLink href={item.href} className="navbar-link" onClick={close}>
                  <span className="navbar-num">0{i + 1}</span>
                  {item.label}.
                </SiteLink>
              </li>
            ))}
          </ul>

          <div className="navbar-footer">
            <a href={`mailto:${site.email}`} className="navbar-email">
              {site.email}
            </a>

            <ul className="navbar-social">
              {site.social.map((item) => (
                <li key={item.label}>
                  <a href={item.href} aria-label={item.label}>
                    <Icon name={item.icon} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
}
