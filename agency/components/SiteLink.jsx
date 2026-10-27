"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * "#section" links are plain anchors on the home page (SmoothScroll glides to them)
 * and become "/#section" Next links on other pages. "/paths" use Next links, the rest plain anchors.
 */
export default function SiteLink({ href, ...props }) {
  const pathname = usePathname();

  if (href.startsWith("#") && (pathname === "/" || href === "#top")) return <a href={href} {...props} />;
  if (href.startsWith("#")) return <Link href={`/${href}`} {...props} />;
  if (href.startsWith("/")) return <Link href={href} {...props} />;
  return <a href={href} {...props} />;
}
