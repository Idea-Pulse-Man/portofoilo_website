// All editable site content in one place.
// Images live in /public/images — replace the placeholder SVGs with your photos
// (any .jpg/.png/.webp works; keep the same path or update `image` here).

export const site = {
  name: "Idea Pulse",
  tagline: "Creative & digital agency",
  description:
    "Idea Pulse is a creative and digital agency. We shape brands, websites, 3D and products, one facet at a time.",
  // TODO: replace with your real details
  email: "hello@your-domain.com",
  phone: { label: "+1 (000) 000 0000", href: "tel:+10000000000" },
  address: "Your street address, City, Country",
  social: [
    { label: "Instagram", href: "#", icon: "instagram" },
    { label: "Behance", href: "#", icon: "behance" },
    { label: "LinkedIn", href: "#", icon: "linkedin" },
  ],
};

export const nav = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

export const heroSteps = [
  { title: "Spark", text: "We find the idea worth building." },
  { title: "Shape", text: "We cut it into brand, design and code." },
  { title: "Ship", text: "We launch it, and keep it shining." },
];

export const stats = [
  { value: 8, label: "Years of craft", icon: "diamond", href: "#process" },
  { value: 140, label: "Projects shipped", icon: "rocket", href: "#work" },
  { value: 60, label: "Happy clients", icon: "heart", href: "#contact" },
];

export const services = [
  { title: "Brand identity", text: "Naming, logo, visual systems and guidelines.", image: "/images/service-01.svg" },
  { title: "Web design & development", text: "Fast, accessible websites built to convert.", image: "/images/service-02.svg" },
  { title: "3D & motion", text: "Product renders, interactive 3D and animation.", image: "/images/service-03.svg" },
  { title: "Product & UI/UX", text: "Research, flows and interfaces for web and mobile apps.", image: "/images/service-04.svg" },
  { title: "E-commerce", text: "Online stores that are a pleasure to shop.", image: "/images/service-05.svg" },
  { title: "Growth & SEO", text: "Analytics, content and search to keep the pulse strong.", image: "/images/service-06.svg" },
];

export const stack = [
  { label: "Figma", icon: "figma" },
  { label: "React", icon: "react" },
  { label: "Next.js", icon: "javascript" },
  { label: "Node.js", icon: "nodejs" },
  { label: "Three.js", icon: "cube" },
  { label: "Blender", icon: "palette" },
  { label: "After Effects", icon: "film" },
  { label: "Vue", icon: "vue" },
  { label: "Sass", icon: "sass" },
  { label: "WordPress", icon: "wordpress" },
  { label: "Shopify", icon: "cart" },
  { label: "Firebase", icon: "firebase" },
];

// Placeholder projects — replace titles, tags, years and images with real work
export const work = [
  { title: "Lumen Bank", tag: "Fintech app", year: 2026, image: "/images/work-01.svg", alt: "Glass icosahedron with gold edges on a midnight blue background" },
  { title: "Aurora Skincare", tag: "E-commerce", year: 2026, image: "/images/work-02.svg", alt: "Teal crystal shard with gold edges floating in a deep teal space" },
  { title: "Nordwind Coffee", tag: "Brand identity", year: 2025, image: "/images/work-03.svg", alt: "Amber geodesic sphere glowing on a warm brown background" },
  { title: "Pulse Arena", tag: "Esports platform", year: 2025, image: "/images/work-04.svg", alt: "Violet glass octahedron with gold edges among small shards" },
  { title: "Atlas Realty", tag: "Website", year: 2025, image: "/images/work-05.svg", alt: "Ice blue icosahedron with gold edges on a blue background" },
  { title: "Monolith Audio", tag: "3D & motion", year: 2024, image: "/images/work-06.svg", alt: "Dark glass geodesic sphere with gold edges and a teal glow" },
];

export const marquee = {
  top: ["Brand", "Web", "3D", "Motion", "Product", "E-commerce"],
  bottom: ["Ideas", "with", "a", "pulse", "·"],
};

export const processSteps = [
  { title: "Discover", text: "Workshops, research and a clear brief. We learn your business before we touch a pixel." },
  { title: "Design", text: "Concepts, brand and interfaces, shaped with you in short, visible rounds." },
  { title: "Develop", text: "Clean, fast code and 3D, tested on real devices every week." },
  { title: "Deliver", text: "Launch, measure and improve. We stay on to keep the pulse strong." },
];

export const needs = ["Brand", "Website", "3D & motion", "App / product", "E-commerce"];
