"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";

// A curtain that lifts off each page reached by client-side navigation
// (the first load has the preloader instead). Runs before paint, so the new page never flashes.
export default function PageTransition() {
  const pathname = usePathname();
  const previous = useRef(pathname);
  const [count, setCount] = useState(0);

  useLayoutEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setCount((c) => c + 1);
  }, [pathname]);

  if (!count) return null;

  return (
    <div className="page-curtain" key={count} aria-hidden="true">
      <img src="/images/logo-mark.webp" width="56" height="69" alt="" />
    </div>
  );
}
