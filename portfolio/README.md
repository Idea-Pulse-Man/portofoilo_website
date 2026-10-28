# Headland – cinematic portfolio

A one-page portfolio modelled on the design language of [pouyan.ai](https://pouyan.ai/): a live 3D scene behind the whole page, warm light-on-dark type, glass pills and cards, filterable shelves of work, and a résumé that opens in place.

The scene is its own: a lighthouse on a grassy headland at golden hour. Switch to night and the sun sets, the moon rises, the cottage windows light up and the lamp's beam sweeps the sea.

Plain HTML, CSS and JavaScript, with no build step. The only library is [three.js r128](https://threejs.org/), loaded from cdnjs.

The scene is built in code. Here is what makes it read as real:

- **Cliffs:** the land is a height field whose coastal ramp is pulled up into near-vertical walls. The walls are cut by vertical joints (buttresses and gullies), bedding ledges, a wave-cut notch at the waterline and small crags. In places a rock shelf runs along the foot.
- **Rocks:** six sea stacks (lobed, fissured and leaning, with broken crowns) and about 240 boulders scattered along the cliff foot.
- **Materials:** photo-scanned rock, lichen rock, turf, plaster and slate. The rock and turf are projected from three sides so vertical faces don't stretch. They're wet and darker at the waterline, with lichen, water stains and dry patches in the grass.
- **Sea:** 14 wave trains for the glitter. White water churns against every rock, foam lines roll in, and the shallows turn greener near land. All of it comes from a distance field baked from the coastline, stacks and boulders.

## Quick start

Serve the **repository root** (so the `../index.html` link to the Jack site works) and open `/portfolio/`:

```bash
npx serve .          # then open http://localhost:3000/portfolio/
# or
python -m http.server  # then open http://localhost:8000/portfolio/
```

You need an internet connection for three.js and Google Fonts. Opening `index.html` straight from disk works too, but browsers won't let WebGL read local image files. In that case the scene skips the photo scans and falls back to flat colour, so use a local server to see it as intended.

## What's on the page

| Part | What it does |
| --- | --- |
| Intro (the "twin") | First visit of a browser session, desktop only. A void, then a log of the real build steps with their timings, while a teal wireframe of the headland spreads out from the lighthouse. Then the stone is lit and the name types itself in. Any key, click or scroll skips it. |
| Hero | Name, a role line with a gold heartbeat, the bio, and pills for GitHub, LinkedIn, Dribbble, X, Résumé, Contact and Book a call. Three sparrows land on the tops of the letters, hop, peck, and fly off when the pointer comes close. They leave at night. |
| Day and night | The button at the top right, or a click on the lighthouse or cottage. Follows the system setting until a choice is made on the page, then remembers it (`localStorage`, key `theme`). |
| Résumé `#resume` | A glass sheet that opens under the pills: experience timeline (each employer expands), education, skills. `/#resume` opens it on load and Escape closes it. |
| Work `#work` | Filter chips (one per tag), then three shelves: Products and open source, Client work, Experiments. Each shelf head counts what the filter leaves ("2 of 6"). |
| Writing and speaking `#writing` | Three cards, each with a line drawing: publication, talks, workshops. |
| Footer | Page index, email, booking link, copyright. |

On desktop, the scene stays fixed behind the page. As you scroll, the camera rises toward the lantern and a blurred veil fades in, so the cards read over soft light. On touch screens the scene sits at the top of the page and scrolls away.

## Editing the content

Everything marked **PLACEHOLDER** is example content.

| What | Where |
| --- | --- |
| Name, role line, bio, page title and description | [index.html](index.html), the `hero-copy` header and the `<head>` |
| Résumé entries | [index.html](index.html), `#resume` |
| Writing, talks, workshops | [index.html](index.html), `#writing` |
| Links for the pills (`LINKS`) and your email (`EMAIL`) | top of [js/app.js](js/app.js) |
| Shelves (`SECTIONS`), projects (`PROJECTS`) and filter chips (`FILTERS`) | top of [js/app.js](js/app.js) |
| Project covers | `COVERS` in [js/app.js](js/app.js): one canvas painter per project `id` |

A pill whose `LINKS` value is empty still shows, but does nothing. Its tooltip says where to add the link. To add a project, add an entry to `PROJECTS`. To give it a cover, add a painter of the same `id` to `COVERS`. Without a painter the cover area stays dark.

## Files

```text
portfolio/
├── index.html        # the page: hero, résumé, writing, footer, SVG icon sprite
├── styles.css        # tokens, hero, résumé, shelves, intro, breakpoints
├── favicon.svg
├── assets/tex/       # the photo scans, WebP (about 1.35 MB in all); see Credits
└── js/
    ├── gate.js       # in <head>: restores the theme, decides whether the intro plays
    ├── scene.js      # the 3D headland (window.Lighthouse)
    └── app.js        # content, links, theme, résumé, shelves, covers, intro log, birds
```

## Behaviour notes

- **URL switches:** `?twin` forces the intro, and `?notwin` skips it.
- **Reduced motion:** no intro, a still camera and sea, instant day/night changes, and the birds stand still.
- **No WebGL, or three.js fails to load:** the page falls back to a CSS sky gradient, and everything else works.
- **Performance:** the scene renders at up to 1.5× pixel ratio and drops toward 1× on slow machines. It renders at half rate when deep under the veil, and pauses when the tab is hidden or the scene is off-screen.
- **Missing scans:** if any texture fails to load, the scene falls back to flat-colour materials rather than breaking.

## Credits

All textures are from [Poly Haven](https://polyhaven.com/), released under [CC0](https://polyhaven.com/license), so no attribution is required. They were downloaded at 1k and converted to WebP.

| File in `assets/tex/` | Poly Haven texture | Used for |
| --- | --- | --- |
| `rock_*` | [Dark Rock 02](https://polyhaven.com/a/dark_rock_02) | cliff faces, stacks, boulders |
| `moss_*` | [Mossy Rock](https://polyhaven.com/a/mossy_rock) | upper cliff, chimney, stone walls |
| `grass_*` | [Grass Ground](https://polyhaven.com/a/grass_ground) | turf on the headland |
| `wall_*` | [White Stucco](https://polyhaven.com/a/white_stucco) | lighthouse and cottage plaster |
| `roof_*` | [Grey Roof Tiles 02](https://polyhaven.com/a/grey_roof_tiles_02) | cottage roof |
