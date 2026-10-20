# Jack – Personal Portfolio Website

A one-page, responsive portfolio site for "Jack Reacher", a web developer. It is built with plain HTML, CSS and JavaScript, with no build step or framework.

## Quick start

Open [index.html](index.html) in a browser, or serve the folder with any static server:

```bash
npx serve .
# or
python -m http.server
```

An internet connection is needed for Google Fonts and Ionicons, which load from CDNs.

## Project structure

```text
.
├── index.html               # The whole page
├── favicon.svg
├── assets/
│   ├── css/
│   │   ├── style.css        # Site styles (themes, layout, breakpoints)
│   │   └── animation-line.css   # Particle background (not used by index.html yet)
│   ├── js/
│   │   ├── script.js        # Header, menu, skills toggle, theme toggle
│   │   └── animation-line.js    # Particle background (not used by index.html yet)
│   └── images/              # Hero/about banners, project thumbnails, skill & tool logos
├── index.txt                # All page copy and alt texts, section by section
├── style-guide.md           # Design tokens: colours, fonts, sizes, themes
├── animation-line.md        # Docs for the particle background
└── jack-website.md          # This file
```

## Page sections

The page is a single `<main>`. Each section has an `id` that the navbar links to.

| Section | `id` | Content |
| --- | --- | --- |
| Header | — | "Jack." logo, language select (En / Ar), theme toggle, mobile menu button, navbar |
| Hero | `#home` | "We Design & Build Creative Products", *Get in touch* button, Facebook / Twitter / LinkedIn links, scroll hint |
| Stats | `#stats` | 12+ years of experience · 230+ completed projects · 95+ happy clients |
| About | `#about` | Short bio, *Hire me* and *Download cv* buttons |
| Skills | `#skills` | Two tabs. **Skills** has 12 items, from HTML5 to SASS. **Tools** has 12 items, from Ajax to Adobe XD. |
| Portfolio | `#portfolio` | "My Works": a grid of 7 project cards, using placeholder titles |
| Contact | `#contact` | Contact details, plus a form with name, email, phone and message |
| Footer | — | Logo and copyright |
| Go to top | — | Floating button that appears after scrolling |

The full text for every section is in [index.txt](index.txt).

## JavaScript behaviour

All logic lives in [assets/js/script.js](assets/js/script.js). Elements are selected with `data-*` attributes, not classes:

| Feature | Hook(s) | What it does |
| --- | --- | --- |
| Sticky header and go-to-top | `[data-header]`, `[data-go-top]` | Adds `.active` to both once `scrollY >= 10` |
| Mobile menu | `[data-nav-toggle-btn]`, `[data-navbar]` | Toggles `.active` on the button, the navbar and `<body>` |
| Skills / Tools tabs | `[data-toggle-box]`, `[data-toggle-btn]`, `[data-skills-box]` | Toggles `.active` to switch between the two lists |
| Dark / light theme | `[data-theme-btn]` | Swaps the `dark_theme` and `light_theme` classes on `<body>` and saves the choice in `localStorage` (`theme` key) |

On page load, the saved theme is applied. The default is `dark_theme`.

## Styling

- Design tokens (colours, fonts, font sizes, spacing, radii, theme variables) are documented in [style-guide.md](style-guide.md) and defined in [assets/css/style.css](assets/css/style.css).
- **Fonts:** Saira Stencil One (logo), Poppins 700 (headings), Roboto 400/700 (body).
- **Icons:** [Ionicons 5.5.2](https://ionic.io/ionicons) via `<ion-icon name="...">`.
- **Themes:** `body.dark_theme` and `body.light_theme` set `--bg-primary`, `--bg-secondary`, `--color-primary`, `--color-secondary`, `--card-shadow` and `--input-bg`.
- **Responsive breakpoints** (mobile-first `min-width`): `550px`, `768px`, `992px`, `1200px`.

## Known gaps / TODO

- **Language select (En / Ar)** is in the markup, but no JavaScript is connected to it yet. An Arabic version would also need RTL (`dir="rtl"`) support.
- **Contact form** has no `action` or submit handler, so messages are not sent anywhere.
- **Portfolio cards** use placeholder text ("Lorem Ipsum Dolor 01–07").
- **Social links, *Hire me* and *Download cv*** point to `#`.
- **Footer credit** still reads "© 2022 codewithsadee", carried over from the original template.
- **animation-line background** is in the repo but not wired into this page. See [animation-line.md](animation-line.md) for how to add it, for example as the hero background.

## Credits

Based on a portfolio template by [codewithsadee](https://github.com/codewithsadee).
