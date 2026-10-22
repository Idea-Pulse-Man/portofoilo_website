# Idea Pulse – agency website

One-page agency site built with **Next.js 16 (App Router)**, **React 19** and **React Three Fiber** (Three.js).
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

## Project structure

```text
agency/
├── app/
│   ├── layout.js            # fonts (next/font), metadata, theme boot script
│   ├── page.js              # the page: puts the sections together
│   ├── globals.css          # all site styles (themes, layout, breakpoints)
│   ├── animation-line.css   # particle background styles
│   ├── api/contact/route.js # contact form endpoint (Resend)
│   ├── icon.png             # favicon
│   └── opengraph-image.jpg  # link preview image
├── components/
│   ├── AnimationLine.jsx    # particles.js background (fixed behind the page)
│   ├── Header.jsx           # logo, menu, dark/light toggle
│   ├── Hero.jsx             # pinned hero; scroll progress drives steps + 3D logo
│   ├── Gem.jsx              # the 3D logo (React Three Fiber)
│   ├── Stats.jsx, About.jsx, Services.jsx, Work.jsx,
│   ├── Marquee.jsx, Process.jsx, Contact.jsx, Footer.jsx, GoTop.jsx
│   ├── Reveal.jsx           # scroll-in animation wrapper
│   └── Icon.jsx             # Ionicons 5 via react-icons
├── lib/
│   ├── content.js           # ALL text, links, services, projects — edit here
│   └── hooks.js
└── public/images/           # logo + placeholder artwork
```

## Editing content

Almost everything you will want to change is in [lib/content.js](lib/content.js):
contact details, social links, stats, services, stack, projects, process steps.

**Placeholders to replace before launch**

- Email, phone, address and social links (`site` in `lib/content.js`)
- Stats numbers (8+, 140+, 60+)
- Project names and images (`work` in `lib/content.js`): these are fictional examples
- Images in `public/images/`: generated glass-and-gold artwork, to be swapped for your photos.
  Drop in `.jpg`/`.png`/`.webp` files and update the paths; Next.js optimises them automatically.

## The 3D logo

[components/Gem.jsx](components/Gem.jsx) builds the logo in code: a 2-frequency geodesic sphere with a gold
frame, glass facets (clear on top, teal at the bottom), a pulsing core and the gold base with its teal edge.

- **Mouse:** drag to rotate (with inertia); the logo also leans toward the cursor.
- **Scroll:** while the hero is pinned, the logo spins and its facets split apart (step 02 "Shape"),
  then come back together (step 03 "Ship").
- Rendering pauses when the hero is off screen, and respects "reduce motion".
- Without WebGL the static logo image is shown instead.

To use a model made in Blender instead, export it as `.glb` into `public/models/`, then load it in
`Gem.jsx` with drei's `useGLTF("/models/logo.glb")` in place of `buildGem()`.

## Contact form

The form posts to `/api/contact`, which emails the message through [Resend](https://resend.com).
Copy `.env.example` to `.env.local` and set `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL`.
Until those are set, the form opens the visitor's mail app with the message filled in.

## Deploying

Easiest: push the repo to GitHub and import it on [Vercel](https://vercel.com) with **Root Directory = `agency`**,
then add the three environment variables above (and `NEXT_PUBLIC_SITE_URL` for link previews).
