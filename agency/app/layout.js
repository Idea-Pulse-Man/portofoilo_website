import { Instrument_Serif, Poppins, Roboto, Saira_Stencil } from "next/font/google";
import AnimationLine from "@/components/AnimationLine";
import Cursor from "@/components/Cursor";
import Footer from "@/components/Footer";
import GoTop from "@/components/GoTop";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import Preloader from "@/components/Preloader";
import SmoothScroll from "@/components/SmoothScroll";
import { site, siteUrl } from "@/lib/content";
import "lenis/dist/lenis.css";
import "./animation-line.css";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-poppins" });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-roboto" });
const saira = Saira_Stencil({ subsets: ["latin"], weight: "700", variable: "--font-saira", adjustFontFallback: false });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif" });

const title = `${site.name} - ${site.tagline.toLowerCase()}`;

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: {
    title,
    description: "We give ideas a pulse. Brand, web, 3D and product design.",
    siteName: site.name,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport = {
  themeColor: "#2b32b2",
};

// Runs before paint: enables scroll-reveal styles, restores the saved theme without a flash,
// and decides whether the intro plays (first visit of the session, motion allowed)
const bootScript = `
var html = document.documentElement;
html.classList.add("js");
try {
  if (localStorage.getItem("theme") === "light_theme") {
    document.body.classList.replace("dark_theme", "light_theme");
  }
} catch (err) {}
var intro = false;
try {
  intro = !sessionStorage.getItem("intro-seen") && !matchMedia("(prefers-reduced-motion: reduce)").matches;
} catch (err) {}
html.classList.add(intro ? "is-loading" : "is-loaded");
if (intro) setTimeout(function () { html.classList.replace("is-loading", "is-loaded"); }, 6000);
`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: siteUrl,
  logo: `${siteUrl}/images/logo.jpg`,
  email: site.email,
  description: site.description,
  sameAs: site.social.map((item) => item.href).filter((href) => href.startsWith("http")),
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${roboto.variable} ${saira.variable} ${serif.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body id="top" className="dark_theme" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <a href="#main" className="skip-link">
          Skip to content
        </a>

        <Preloader />

        <AnimationLine />

        <Header />

        {children}

        <Footer />

        <GoTop />

        <Cursor />
        <SmoothScroll />
        <PageTransition />
      </body>
    </html>
  );
}
