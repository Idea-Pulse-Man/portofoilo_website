"use client";

import { useEffect, useRef, useState } from "react";

/** Fades/slides its element in the first time it scrolls into view ([data-reveal] in globals.css) */
export default function Reveal({ as: Tag = "div", className = "", children, ...props }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.15 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} data-reveal="" className={`${className} ${visible ? "is-visible" : ""}`.trim()} {...props}>
      {children}
    </Tag>
  );
}
