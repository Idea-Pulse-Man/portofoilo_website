"use client";

import { useRef, useState } from "react";
import Icon from "@/components/Icon";
import { useScrollFrame } from "@/lib/hooks";

// Back-to-top button; its ring fills as the page scrolls
export default function GoTop() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useScrollFrame(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    ref.current.style.setProperty("--scroll", max > 0 ? (window.scrollY / max).toFixed(4) : 0);
    setVisible(window.scrollY >= 10);
  });

  return (
    <a
      href="#top"
      ref={ref}
      className={`go-top ${visible ? "active" : ""}`}
      title="Go to Top"
      aria-label="Go to top"
      data-magnetic=""
    >
      <svg className="go-top-ring" viewBox="0 0 54 54" aria-hidden="true">
        <circle cx="27" cy="27" r="25" pathLength="1" />
      </svg>
      <Icon name="arrow-up" />
    </a>
  );
}
