# Headland – cinematic portfolio

A one-page portfolio modelled on the design language of [pouyan.ai](https://pouyan.ai/): a live 3D scene behind the whole page, warm light-on-dark type, glass pills and cards, filterable shelves of work, and a résumé that opens in place.

The scene is its own: a lighthouse on a grassy headland at golden hour. Switch to night and the sun sets, the moon rises, and the lamp lights and sweeps its beam over the sea.

Plain HTML, CSS and JavaScript, with no build step. The only library is [three.js r128](https://threejs.org/), loaded from cdnjs.

The scene is built in code. Here is what makes it read as real:

- **Cliffs:** the land is a height field whose coastal ramp is pulled up into near-vertical walls. The walls are cut by vertical joints (buttresses and gullies), bedding ledges, a wave-cut notch at the waterline and small crags. In places a rock shelf runs along the foot.
- **Rocks:** six sea stacks (lobed, fissured and leaning, with broken crowns) and about 240 boulders scattered along the cliff foot.
- **Turf:** about 6,000 clumps of grass, sea thrift and flowering gorse cover the clifftop, thickest round the lighthouse and right up to the cliff edge. They nod in the wind, glow at their edges when you look toward the low sun, and go dark grey-green under the moon. A gravel path runs from the tower door away inland.
- **The lighthouse:** its small windows are deep-set behind white frames with stone sills. Its door is panelled and painted, with a white architrave and a stone step.
- **Materials:** photo-scanned rock, lichen rock, turf and plaster. The rock and turf are projected from three sides so vertical faces don't stretch. They're wet and darker at the waterline, with lichen, water stains and dry patches in the grass.
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
| Day and night | The button at the top right, or a click on the lighthouse. Follows the system setting until a choice is made on the page, then remembers it (`localStorage`, key `theme`). |
| Résumé `#resume` | A glass sheet that opens under the pills: experience timeline (each employer expands), education, skills. `/#resume` opens it on load and Escape closes it. |
| The climb `#climb` | Desktop only, and on desktop it is how the work is shown. Scrolling past the hero flies the camera over the sea, up over the cliff and in at the lighthouse door, then up a spiral stair inside. Each project hangs on the wall beside the stair: its illustration in a frame, and a plaque explaining it. A caption names the piece in view and links to it. At the top you lean over the rail and look down the open well at the whole spiral of work, then climb a ladder through the hatch onto the lantern gallery. The ending is described below. |
| Work `#work` | Phones and tablets (and desktops without WebGL): filter chips (one per tag), then three shelves of cards: Products and open source, Client work, Experiments. Each shelf head counts what the filter leaves ("2 of 6"). Where the climb runs, the cards stay in the page only for screen readers. |
| Writing and speaking `#writing` | Three cards, each with a line drawing: publication, talks, workshops. |
| Footer | Page index, email, booking link, copyright. |

On desktop, the scene stays fixed behind the page and scrolling drives the climb. After it, the page settles on dark for the writing section and the footer. The footer's Products, Client work and Experiments links scroll to that shelf's first piece on the stair. On touch screens and without WebGL there is no climb: the scene sits at the top of the page and scrolls away, and the cards show the work.

### Inside the lighthouse

The interior is bigger on the inside: an 11 m hall entered through the door. A stone stair cantilevered from the plaster wall winds up it, with iron balusters, a brass handrail and a second rail along the wall. The middle is an open well, so from the top you can see down the whole spiral to the floor.

Projects hang in `SECTIONS` order. Each one gets:

- **An illustration:** its cover, drawn by the same painter as its card, in a dark frame under a brass picture light.
- **A plaque:** section, number, name, meta, description, tags and link.

Pictures hang at a set height above the step beneath them, so the row climbs with the stair. A window between each pair glows with the hour outside: sunset by day, moonlit blue at night.

The scroll length is set from the number of projects: about 0.6 of a screen per piece. Adding a project to `PROJECTS` adds it to the stair.

**How the camera moves.** You climb on the stair beside the handrail at a steady pace that eases a little at each piece, but never stops or rushes. Your gaze rests on the wall a few steps ahead, about 27° off square, so each piece and its plaque glide into the middle of the frame and move on. The view turns only as fast as the stair does. Every phase begins exactly where the last one ended, and each turn (the lean over the rail, the turn to the ladder, the turn on the gallery) takes at least a third of a screen of scroll. The camera follows the scroll through a spring, so it gathers speed and settles smoothly instead of lurching at each notch of the wheel.

### The ending

1. **Nightfall:** you come out onto the lantern gallery at sunset. As you scroll on, the sun sinks into the sea, the stars and moon come out, and the lamp catches behind you. The scroll runs the clock to night whatever hour the page is set to; scroll back up and your own hour returns.
2. **The pull-back:** you turn round over the moonlit headland, and the camera draws back off the gallery and orbits out over the water, keeping the lighthouse in view while its beams sweep the sea.
3. **The signal:** it comes to rest out at sea like a boat on the swell. The beam swings round onto you, and the lamp spells **HELLO** in Morse code.
4. **The caption:** each dot and dash lights as it flashes, and each letter as it's spelled out. Below them are **Say hello back** and **Book a call**.

The flashes stay under three a second. Under reduced motion the lamp holds steady and the whole word shows at once.

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
├── assets/tex/       # the photo scans, WebP (about 1.3 MB in all); see Credits
└── js/
    ├── gate.js       # in <head>: restores the theme, decides whether the intro plays
    ├── scene.js      # the 3D headland (window.Lighthouse)
    └── app.js        # content, links, theme, résumé, shelves, covers, intro log, birds
```

## Behaviour notes

- **URL switches:** `?twin` forces the intro, and `?notwin` skips it.
- **Reduced motion:** no intro, a still camera and sea, instant day/night changes, and the birds stand still. The climb still runs, because it moves only as you scroll; it just follows the scroll exactly, with no easing.
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
| `wall_*` | [White Stucco](https://polyhaven.com/a/white_stucco) | lighthouse plaster |
