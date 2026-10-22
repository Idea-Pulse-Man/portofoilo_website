"use client";

import { useEffect, useState } from "react";
import { nav, site } from "@/lib/content";
import { useScrolled } from "@/lib/hooks";

export function Logo({ as: Tag = "p" }) {
  return (
    <Tag className="h1 logo">
      <a href="#top">
        <img src="/images/logo-mark.webp" width="40" height="49" alt="" className="logo-mark" />
        {site.name}
        <span>.</span>
      </a>
    </Tag>
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

export default function Header() {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("active", open);
  }, [open]);

  return (
    <header className={`header ${scrolled ? "active" : ""}`}>
      <div className="container">
        <Logo as="h1" />

        <div className="navbar-actions">
          <a href="#contact" className="btn btn-secondary header-cta">
            Start a project
          </a>

          <ThemeToggle />
        </div>

        <button
          className={`nav-toggle-btn ${open ? "active" : ""}`}
          aria-label="Toggle Menu"
          aria-expanded={open}
          title="Toggle Menu"
          onClick={() => setOpen(!open)}
        >
          <span className="one" />
          <span className="two" />
          <span className="three" />
        </button>

        <nav className={`navbar ${open ? "active" : ""}`}>
          <ul className="navbar-list">
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="navbar-link" onClick={() => setOpen(false)}>
                  {item.label}.
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
