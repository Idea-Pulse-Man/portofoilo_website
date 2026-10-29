# Idea Pulse – agency website

Agency site built with **Next.js 16 (App Router)**, **React 19**, **React Three Fiber** (Three.js) and **Lenis** (smooth scrolling).
Styling is plain CSS, carried over from the Jack portfolio in the repo root, with the logo's gold + teal palette.

## Quick start

```bash
cd agency
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

The scripts use the **webpack** bundler (`--webpack`): Next 16's default Turbopack crashed on this
Windows / Node 25 machine. If you are on another machine you can try removing the flag.

## What's on the site

**Home page** (`/`), in scroll order:

| Section | What it does |
| --- | --- |
| Intro | First visit of a session: logo, heartbeat line and a 0–100 counter, then the curtain lifts |
| Hero | Pinned while you scroll: the 3D logo spins and splits (Spark → Shape → Ship) |
| Clients | Logo strip that scrolls on its own, pauses on hover |
| About `#about` | A statement that lights up word by word as you scroll, studio photo, counters |
| Work `#work` | Desktop: the section pins and the projects slide sideways. Mobile: a grid. Each card opens its case study |
| Services `#services` | Accordion with deliverables; a preview image follows the mouse; Services / Stack tabs |
| Process `#process` | Heartbeat line that draws itself, four steps with timings |
| Testimonials | Auto-advancing quotes (pause on hover/focus), dots + arrows |
| FAQ `#faq` | Native `<details>` accordion, with FAQ structured data for search engines |
| Contact `#contact` | Big call to action, copy-email button, form with needs + budget |

**Case studies** (`/work/<slug>`): one static page per project: intro, cover, facts, challenge and approach,
results, gallery, client quote, next project.

**Everywhere:** custom cursor with "View / Drag" labels and magnetic buttons (mouse only), header that hides
while scrolling down with a centred menu on desktop and a full-screen menu on mobile, page-transition curtain,
back-to-top button with scroll progress ring, dark/light theme, film grain, branded 404 page,
`sitemap.xml`, `robots.txt` and Organization structured data.

Visitors who ask their system for **reduced motion** get no intro, no smooth scrolling, no custom cursor,
no pinned/sideways sections and no auto-advancing quotes. Without JavaScript all content is still visible.

## Project structure

```text
agency/
├── app/
│   ├── layout.js            # fonts, metadata, theme/intro boot script, shared chrome (header, footer, cursor…)
│   ├── page.js              # the home page: puts the sections together
│   ├── work/[slug]/page.js  # case study pages (built from `work` in lib/content.js)
│   ├── not-found.js         # 404 page
│   ├── sitemap.js, robots.js
│   ├── globals.css          # all site styles (themes, layout, breakpoints)
│   ├── animation-line.css   # particle background styles
│   ├── api/contact/route.js # contact form endpoint (Resend)
│   ├── icon.png             # favicon
│   └── opengraph-image.jpg  # link preview image
├── components/
│   ├── AnimationLine.jsx    # particles.js background (fixed behind the page)
│   ├── Preloader.jsx        # first-visit intro
│   ├── SmoothScroll.jsx     # Lenis + smooth #anchor links
│   ├── Cursor.jsx           # custom cursor + magnetic elements
│   ├── PageTransition.jsx   # curtain between pages
│   ├── Header.jsx           # logo, menus, dark/light toggle
│   ├── Hero.jsx, Gem.jsx    # pinned hero and the 3D logo (React Three Fiber)
│   ├── Clients.jsx, About.jsx, Work.jsx, Services.jsx, Marquee.jsx,
│   ├── Process.jsx, Testimonials.jsx, Faq.jsx, Contact.jsx, Footer.jsx, GoTop.jsx
│   ├── Button.jsx           # gold/outline pill button (rolling label, magnetic)
│   ├── Title.jsx            # heading whose words rise in; *stars* = gold serif accent
│   ├── SectionHead.jsx      # "(02) Label" + Title
│   ├── SiteLink.jsx         # #section links that work from every page
│   ├── Reveal.jsx           # scroll-in animation wrapper
│   ├── Counter.jsx, Clock.jsx
│   └── Icon.jsx             # Ionicons 5 via react-icons
├── lib/
│   ├── content.js           # ALL text, links, projects, quotes, FAQs — edit here
│   ├── hooks.js             # scroll/media-query hooks
│   └── text.js
└── public/images/           # logo + placeholder artwork
```

## Editing content

Almost everything you will want to change is in [lib/content.js](lib/content.js): contact details, social
links, availability line, studio time zone, clients, about text, stats, services, stack, projects
(with their case-study text), process steps, testimonials, FAQs and form options.

In titles and the about statement, wrap words in `*stars*` to set them in the gold serif accent,
e.g. `"Every idea has many *facets.*"`.

**Placeholders to replace before launch** (marked `PLACEHOLDER` or `TODO` in `lib/content.js`)

- Email, phone, address, social links, `timezone` and `availability` (`site`)
- Stats numbers (8+, 140+, 60+)
- Client names and marks (`clients`; the marks are drawn in `components/Clients.jsx`)
- Projects (`work`): fictional examples, including their case-study text and results numbers
- Testimonials: fictional quotes; use real ones, with the client's permission
- Budget ranges in the contact form (`budgets`), FAQ answers and process timings, if they don't match how you work
- Images in `public/images/`: generated glass-and-gold artwork, to be swapped for your photos.
  Drop in `.jpg`/`.png`/`.webp` files and update the paths; Next.js optimises them automatically.
  Give real gallery images a descriptive `alt` text in `app/work/[slug]/page.js`.

## The 3D logo

[components/Gem.jsx](components/Gem.jsx) builds the logo in code: a 2-frequency geodesic sphere with a gold
frame, glass facets (clear on top, teal at the bottom), a pulsing core and the gold base with its teal edge.

- **Mouse:** drag to rotate (with inertia); the logo also leans toward the cursor.
- **Scroll:** while the hero is pinned, the logo spins and its facets split apart (step 02 "Shape"),
  then come back together (step 03 "Ship").
- It grows into place when the intro lifts. Rendering pauses when the hero is off screen, and respects "reduce motion".
- Without WebGL the static logo image is shown instead.

To use a model made in Blender instead, export it as `.glb` into `public/models/`, then load it in
`Gem.jsx` with drei's `useGLTF("/models/logo.glb")` in place of `buildGem()`.

## Contact form

The form posts to `/api/contact`, which emails the message through [Resend](https://resend.com).
Copy `.env.example` to `.env.local` and set `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL`.
Until those are set, the form opens the visitor's mail app with the message filled in.

## Deploying

Easiest: push the repo to GitHub and import it on [Vercel](https://vercel.com) with **Root Directory = `agency`**,
then add the three environment variables above, and `NEXT_PUBLIC_SITE_URL` (your domain, e.g.
`https://your-domain.com`) for link previews, the sitemap and structured data.
