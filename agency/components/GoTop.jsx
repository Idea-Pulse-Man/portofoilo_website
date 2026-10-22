"use client";

import Icon from "@/components/Icon";
import { useScrolled } from "@/lib/hooks";

export default function GoTop() {
  const scrolled = useScrolled();

  return (
    <a href="#top" className={`go-top ${scrolled ? "active" : ""}`} title="Go to Top" aria-label="Go to top">
      <Icon name="arrow-up" />
    </a>
  );
}
