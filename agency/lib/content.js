// All editable site content in one place.
// Images live in /public/images — replace the placeholder SVGs with your photos
// (any .jpg/.png/.webp works; keep the same path or update `image` here).
// Everything marked PLACEHOLDER is example content: replace it before launch.

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const site = {
  name: "Idea Pulse",
  tagline: "Creative & digital agency",
  description:
    "Idea Pulse is a creative and digital agency. We shape brands, websites, 3D and products, one facet at a time.",
  // TODO: replace with your real details
  email: "hello@your-domain.com",
  phone: { label: "+1 (000) 000 0000", href: "tel:+10000000000" },
  address: "Your street address, City, Country",
  timezone: "America/New_York", // studio clock in the footer (IANA time zone name)
  availability: "Booking new projects for Q1 2027",
  social: [
    { label: "Instagram", href: "#", icon: "instagram" },
    { label: "Behance", href: "#", icon: "behance" },
    { label: "LinkedIn", href: "#", icon: "linkedin" },
  ],
};

export const nav = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

export const heroSteps = [
  { title: "Spark", text: "We find the idea worth building." },
  { title: "Shape", text: "We cut it into brand, design and code." },
  { title: "Ship", text: "We launch it, and keep it shining." },
];

// PLACEHOLDER client names (the fictional projects below) — swap for real clients
export const clients = [
  { name: "Lumen Bank", mark: "ring" },
  { name: "Aurora", mark: "spark" },
  { name: "Nordwind", mark: "triangle" },
  { name: "Pulse Arena", mark: "bars" },
  { name: "Atlas Realty", mark: "hex" },
  { name: "Monolith", mark: "square" },
  { name: "Halcyon", mark: "arc" },
  { name: "Vela", mark: "diamond" },
];

// *stars* mark the words set in the gold serif accent
export const about = {
  statement:
    "We are a design and development studio for brands that refuse to *blend in.* We turn early sparks into brands, websites and products people can feel.",
  title: "A small studio with many *facets.*",
  text: "Like our logo, every project we take on is made of many faces: strategy, brand, interface, code and motion. We are a compact team of designers and developers who care about each one, and about how they fit together. No hand-offs between strangers. The people you meet are the people who build your product.",
};

// PLACEHOLDER numbers
export const stats = [
  { value: 8, label: "Years of craft" },
  { value: 140, label: "Projects shipped" },
  { value: 60, label: "Happy clients" },
];

export const services = [
  {
    title: "Brand identity",
    text: "Naming, logo, visual systems and guidelines.",
    image: "/images/service-01.svg",
    deliverables: ["Brand strategy", "Naming", "Logo & mark", "Visual system", "Guidelines", "Packaging"],
  },
  {
    title: "Web design & development",
    text: "Fast, accessible websites built to convert.",
    image: "/images/service-02.svg",
    deliverables: ["UX & wireframes", "UI design", "Next.js & React", "Headless CMS", "Accessibility", "Performance"],
  },
  {
    title: "3D & motion",
    text: "Product renders, interactive 3D and animation.",
    image: "/images/service-03.svg",
    deliverables: ["Product renders", "WebGL & Three.js", "Launch films", "Brand animation", "3D viewers"],
  },
  {
    title: "Product & UI/UX",
    text: "Research, flows and interfaces for web and mobile apps.",
    image: "/images/service-04.svg",
    deliverables: ["User research", "User flows", "Prototypes", "Design systems", "iOS & Android UI"],
  },
  {
    title: "E-commerce",
    text: "Online stores that are a pleasure to shop.",
    image: "/images/service-05.svg",
    deliverables: ["Shopify", "Custom storefronts", "Product pages", "Checkout UX", "Subscriptions"],
  },
  {
    title: "Growth & SEO",
    text: "Analytics, content and search to keep the pulse strong.",
    image: "/images/service-06.svg",
    deliverables: ["Technical SEO", "Analytics", "Content strategy", "A/B testing", "Monthly support"],
  },
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

// PLACEHOLDER projects: fictional case studies (names, copy and numbers) — replace with real work.
// Each one gets its own page at /work/<slug>.
export const work = [
  {
    slug: "lumen-bank",
    title: "Lumen Bank",
    tag: "Fintech app",
    year: 2026,
    image: "/images/work-01.svg",
    alt: "Glass icosahedron with gold edges on a midnight blue background",
    summary: "A mobile bank that makes saving feel like progress, not punishment.",
    services: ["Product & UI/UX", "Brand identity", "3D & motion"],
    duration: "16 weeks",
    challenge:
      "Lumen had a banking licence, a solid feature list and a crowded market. Their beta tested well, but people rarely opened it twice: saving felt like a chore and the brand looked like every other blue bank.",
    approach:
      "We rebuilt the product around one idea: every deposit lights up a facet of your goal. A new visual system, calmer navigation and a 3D goal object that grows as you save, shipped in fortnightly releases tested with real customers.",
    results: [
      { value: "+38%", label: "Monthly active users" },
      { value: "2.4×", label: "Saving goals created" },
      { value: "4.8", label: "App Store rating" },
    ],
    gallery: ["/images/service-04.svg", "/images/service-03.svg"],
  },
  {
    slug: "aurora-skincare",
    title: "Aurora Skincare",
    tag: "E-commerce",
    year: 2026,
    image: "/images/work-02.svg",
    alt: "Teal crystal shard with gold edges floating in a deep teal space",
    summary: "A Shopify store as calm and clear as the products on its shelves.",
    services: ["E-commerce", "Web design & development", "Growth & SEO"],
    duration: "10 weeks",
    challenge:
      "Aurora's old store was slow, cluttered and hard to use on a phone, where most of their customers shop. Great products were getting lost between pop-ups, badges and banners.",
    approach:
      "We designed a quiet, editorial storefront built around ingredients and routines, rebuilt the theme for speed and cut checkout to three steps. Product pages now answer the questions customers used to email about.",
    results: [
      { value: "+27%", label: "Conversion rate" },
      { value: "1.2s", label: "Page load on mobile" },
      { value: "-41%", label: "Support emails" },
    ],
    gallery: ["/images/service-05.svg", "/images/service-02.svg"],
  },
  {
    slug: "nordwind-coffee",
    title: "Nordwind Coffee",
    tag: "Brand identity",
    year: 2025,
    image: "/images/work-03.svg",
    alt: "Amber geodesic sphere glowing on a warm brown background",
    summary: "A roastery brand with the warmth of a cup and the edge of a northern wind.",
    services: ["Brand identity", "Packaging", "Web design & development"],
    duration: "8 weeks",
    challenge:
      "Nordwind had grown from one café into wholesale and online, but the brand was still a hand-drawn logo on a chalkboard. It needed to work on bags, vans, cups and screens without losing its character.",
    approach:
      "We built an identity from the shape of a compass rose and a warm, roasted palette. A flexible label system lets the team launch a new origin in a day, and a simple online shop sells subscriptions.",
    results: [
      { value: "3×", label: "Online subscriptions" },
      { value: "40+", label: "Wholesale partners" },
      { value: "1 day", label: "To launch a new blend" },
    ],
    gallery: ["/images/service-01.svg", "/images/studio.svg"],
  },
  {
    slug: "pulse-arena",
    title: "Pulse Arena",
    tag: "Esports platform",
    year: 2025,
    image: "/images/work-04.svg",
    alt: "Violet glass octahedron with gold edges among small shards",
    summary: "A tournament platform that feels as fast as the games it hosts.",
    services: ["Product & UI/UX", "Web design & development", "3D & motion"],
    duration: "20 weeks",
    challenge:
      "Players were joining tournaments through spreadsheets and group chats. Pulse Arena wanted one home for brackets, live scores and highlights, ready for thousands of fans at once.",
    approach:
      "We designed a dark, high-contrast interface with real-time brackets and animated match cards, then built it on Next.js with live updates. Motion design gives every win its moment.",
    results: [
      { value: "120k", label: "Players in year one" },
      { value: "<100ms", label: "Live score updates" },
      { value: "+65%", label: "Average session time" },
    ],
    gallery: ["/images/service-03.svg", "/images/service-06.svg"],
  },
  {
    slug: "atlas-realty",
    title: "Atlas Realty",
    tag: "Website",
    year: 2025,
    image: "/images/work-05.svg",
    alt: "Ice blue icosahedron with gold edges on a blue background",
    summary: "A property website that sells the neighbourhood, not just the floor plan.",
    services: ["Web design & development", "3D & motion", "Growth & SEO"],
    duration: "12 weeks",
    challenge:
      "Atlas listings looked like everyone else's: a grid of photos and a price. Buyers moving from out of town could not get a feel for an area before booking a viewing.",
    approach:
      "We built neighbourhood guides with interactive 3D maps, fast search and listing pages written for people, not portals. A headless CMS lets agents publish a listing in minutes.",
    results: [
      { value: "+52%", label: "Viewing requests" },
      { value: "#1", label: "Local search ranking" },
      { value: "6 min", label: "To publish a listing" },
    ],
    gallery: ["/images/service-02.svg", "/images/service-06.svg"],
  },
  {
    slug: "monolith-audio",
    title: "Monolith Audio",
    tag: "3D & motion",
    year: 2024,
    image: "/images/work-06.svg",
    alt: "Dark glass geodesic sphere with gold edges and a teal glow",
    summary: "Launch films and 3D renders for a speaker carved from a single block.",
    services: ["3D & motion", "Brand identity"],
    duration: "6 weeks",
    challenge:
      "Monolith's first speaker was still a prototype when pre-orders had to open. They needed product visuals that looked real, before the product was.",
    approach:
      "We modelled the speaker from its CAD files, then produced a library of photoreal renders, a 60-second launch film and an interactive 3D viewer for the product page.",
    results: [
      { value: "4,000", label: "Pre-orders in 30 days" },
      { value: "2.1M", label: "Launch film views" },
      { value: "0", label: "Photo shoots needed" },
    ],
    gallery: ["/images/service-03.svg", "/images/service-01.svg"],
  },
];

export const marquee = {
  top: ["Brand", "Web", "3D", "Motion", "Product", "E-commerce"],
  bottom: ["Ideas", "with", "a", "pulse", "·"],
};

export const processSteps = [
  { title: "Discover", time: "Week 1", text: "Workshops, research and a clear brief. We learn your business before we touch a pixel." },
  { title: "Design", time: "Weeks 2–4", text: "Concepts, brand and interfaces, shaped with you in short, visible rounds." },
  { title: "Develop", time: "Weeks 4–10", text: "Clean, fast code and 3D, tested on real devices every week." },
  { title: "Deliver", time: "Launch & beyond", text: "Launch, measure and improve. We stay on to keep the pulse strong." },
];

// PLACEHOLDER quotes from the fictional projects — replace with real client words (with their permission)
export const testimonials = [
  {
    quote:
      "They found the one idea our app was missing and built everything around it. People finally open Lumen because they want to.",
    name: "Elena Varga",
    role: "Head of Product, Lumen Bank",
    slug: "lumen-bank",
  },
  {
    quote:
      "They redesigned our store without losing what made it ours. It is faster, calmer and it sells more. Our support inbox has never been this quiet.",
    name: "Priya Raman",
    role: "Founder, Aurora Skincare",
    slug: "aurora-skincare",
  },
  {
    quote:
      "From the first workshop to the last bag label, it felt like working with our own team. The new brand travels everywhere we go.",
    name: "Marcus Hale",
    role: "Co-founder, Nordwind Coffee",
    slug: "nordwind-coffee",
  },
  {
    quote:
      "The renders were so good that people asked where to buy the speaker before it existed. That is exactly what we needed.",
    name: "Tom Becker",
    role: "CEO, Monolith Audio",
    slug: "monolith-audio",
  },
];

export const faqs = [
  {
    q: "How much does a project cost?",
    a: "Every project is different, so we quote after a free 30-minute call. You get a fixed price and a clear scope within two working days, with no hourly surprises. If you would rather start small, we also run fixed-price design sprints.",
  },
  {
    q: "How long does it take?",
    a: "A brand identity usually takes 4 to 6 weeks and a marketing website 6 to 10 weeks. Product work runs in two-week sprints, so you see progress from the first fortnight.",
  },
  {
    q: "Do you work with startups?",
    a: "Yes, from the first funding round to fast-growing teams. We can name and brand the company, design the first version of the product and build a site that wins investors and customers.",
  },
  {
    q: "What do you need from us to get started?",
    a: "A short brief, or just a call. Tell us what you are building, who it is for and what success looks like. We take it from there: research, workshops, a plan and a timeline.",
  },
  {
    q: "Do you stay on after launch?",
    a: "Most clients keep us on. Monthly support covers updates, new pages, SEO and performance, so your site and product keep their pulse long after launch.",
  },
  {
    q: "Can you work with our in-house team?",
    a: "Of course. We often design alongside in-house developers, or build what an in-house design team has drawn. Shared files, stand-ups and Slack channels: whatever fits your team.",
  },
];

export const needs = ["Brand", "Website", "3D & motion", "App / product", "E-commerce"];

export const budgets = ["Under $10k", "$10k–25k", "$25k–50k", "$50k+", "Not sure yet"];
