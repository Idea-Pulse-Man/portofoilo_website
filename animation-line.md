# animation-line

An animated full-screen background: white pentagon particles drift over a blue gradient, and thin white lines connect particles that are close to each other. Clicking the background adds more particles.

Built with [particles.js 2.0.0](https://github.com/VincentGarreau/particles.js).

## Files

| File | Purpose |
| --- | --- |
| [assets/css/animation-line.css](assets/css/animation-line.css) | Gradient container, canvas sizing, and the content layer that sits on top |
| [assets/js/animation-line.js](assets/js/animation-line.js) | particles.js configuration (runs on `DOMContentLoaded`) |

> **Status:** The animation was added as a standalone page in commit `ac10110` (`feature_animation_line`). The current [index.html](index.html), which is the Jack portfolio, does **not** load these files. To use the animation again, follow the steps under [Usage](#usage).

## Usage

1. Link the stylesheet in `<head>`:

   ```html
   <link rel="stylesheet" href="./assets/css/animation-line.css" />
   ```

2. Add the container. Anything inside `.animation-line__content` is centred on top of the animation:

   ```html
   <div id="animation-line">
     <div class="animation-line__content">
       <!-- optional content: heading, name, buttons -->
     </div>
   </div>
   ```

3. Load particles.js **before** the config script, at the end of `<body>`:

   ```html
   <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
   <script src="./assets/js/animation-line.js"></script>
   ```

The container id must be `animation-line`. particles.js looks the element up by that id and injects a `<canvas class="particles-js-canvas-el">` into it.

## Look

| Property | Value |
| --- | --- |
| Background | `linear-gradient(to right, #2b32b2, #1488cc)` (fallback `#1488cc`) |
| Container height | `min-height: 100vh` |
| Particle count | 30 per 800px² area (density-scaled) |
| Particle shape | Polygon, 5 sides (pentagon), no stroke |
| Particle colour / opacity | `#ffffff` / `0.5` |
| Particle size | `3` (random) |
| Link lines | `#ffffff`, opacity `0.4`, width `1`, drawn when particles are within `150px` |
| Movement | Speed `4`, random direction, leaves the edge and re-enters (`out_mode: "out"`), no bounce |
| Retina | `retina_detect: true` |

## Interaction

| Event | Behaviour |
| --- | --- |
| Click | `push`: adds 4 particles at the click point |
| Hover | Disabled (the `grab` mode is configured but `onhover.enable` is `false`) |
| Resize | Canvas resizes with the window |

Events are detected on the canvas (`detect_on: "canvas"`). The content layer uses `pointer-events: none` so clicks pass through to the canvas. Links and buttons inside it get `pointer-events: auto` so they stay clickable.

## Layering (CSS)

- `#animation-line` is `position: relative; overflow: hidden`, which keeps the canvas inside it.
- The canvas is `position: absolute; inset: 0` and forced to `100%` width and height. The `!important` overrides the inline size that particles.js sets.
- `.animation-line__content` is absolutely centred (`top/left: 50%` + `translate(-50%, -50%)`), `80%` wide, white text, `z-index: 1`.

## Customising

Change the values in [assets/js/animation-line.js](assets/js/animation-line.js):

- **More or fewer particles:** `particles.number.value`
- **Shape:** `particles.shape.type` (`"circle"`, `"triangle"`, `"polygon"`, …) and `polygon.nb_sides`
- **Longer or shorter links:** `particles.line_linked.distance`
- **Speed:** `particles.move.speed`
- **Hover effect:** set `interactivity.events.onhover.enable` to `true`. Hovering then draws lines from the cursor to nearby particles, within `400px`.
- **Colours:** change the gradient in [assets/css/animation-line.css](assets/css/animation-line.css), and `color.value` and `line_linked.color` in the JS.

Keep the default values above if you want the original look.
