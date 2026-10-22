import { Poppins, Roboto, Saira_Stencil } from "next/font/google";
import { site } from "@/lib/content";
import "./animation-line.css";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-poppins" });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-roboto" });
const saira = Saira_Stencil({ subsets: ["latin"], weight: "700", variable: "--font-saira", adjustFontFallback: false });

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: `${site.name} - ${site.tagline.toLowerCase()}`,
  description: site.description,
  openGraph: {
    title: `${site.name} - ${site.tagline.toLowerCase()}`,
    description: "We give ideas a pulse. Brand, web, 3D and product design.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#2b32b2",
};

// Runs before paint: enables scroll-reveal styles and restores the saved theme without a flash
const bootScript = `
document.documentElement.classList.add("js");
try {
  if (localStorage.getItem("theme") === "light_theme") {
    document.body.classList.replace("dark_theme", "light_theme");
  }
} catch (err) {}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} ${roboto.variable} ${saira.variable}`} suppressHydrationWarning>
      <body id="top" className="dark_theme" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        {children}
      </body>
    </html>
  );
}
