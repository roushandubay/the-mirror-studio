# THE MIRROR by Janvi Agarwal — website

Luxury makeup studio, salon and academy. Near Tourist Inn Hotel, Sevoke Road,
Siliguri. Next.js 16 (App Router) · Tailwind v4 · Motion · Lenis · Three.js.

**References**
- Layout / motion: [verostudio.com](https://www.verostudio.com/) — long-form
  scroll narrative, pinned scrubs, oversized display type.
- Palette / type ramp: Figma *Beautya | Skincare - Cosmetic Website*,
  `Desktop/Landing/01` (`1058:8965`) — taken verbatim.
- Brand / content: [@themirror_by_janviiagarwal](https://www.instagram.com/themirror_by_janviiagarwal/)

---

## ⚠️ Run it with `node`, not `npm run`

The folder is named `Makeup CMS & ECOM`. The `&` breaks Windows' npm/npx `.cmd`
shims — `npm run dev` fails with
`'ECOM\node_modules\.bin\' is not recognized`.

```bash
node node_modules/next/dist/bin/next dev
```

```bash
node node_modules/next/dist/bin/next build
```

**Fix properly:** rename the folder to e.g. `H:\makeup-cms-ecom`, then npm
scripts work normally.

---

## Homepage structure

Ten blocks, ~13,000px. Every one is data in `src/content/landing.ts`.

| # | Block | What it does |
|---|---|---|
| 1 | `cinematic-hero` | Full-frame video, square glass MENU + booking buttons, her logo, split tagline. No header bar. Recedes on scroll via a clip-path inset. |
| 2 | `scroll-sequence` | Pinned 1.8-viewport scrub driving the **real 3D lipstick** behind dark frosted glass, fading as it goes. |
| 3 | `band` | Studio signage, parallax. |
| 4 | `stepper` | Thumbnail grows to full-bleed, then steps Consultation → Trial → Hair → The Day with a dot rail. |
| 5 | `manifesto` | "so THAT YOU BECOME _art._" + long copy + glass CTA. |
| 6 | `band` | Second punctuation band. |
| 7 | `media-grid-push` | Column grid — 5 columns desktop, 2 on phones — adjacent columns drifting against each other, centred glass pill. |
| 8 | `pull-quote` | Founder portrait + quote, line-by-line reveal. |
| 9 | `overflow-quote` | 168px type running past both viewport edges + rotating metal seal. |
| 10 | `footer` | Links, newsletter, contact band, copyright. |

The Figma commerce blocks (`hero`, `categories`, `product-carousel`,
`feature-row`, `offer`, `brand`, `blog`, `value-props`, `header`) are still
registered and ready for inner pages.

---

## Architecture — the page is data, not JSX

The CMS must let the client edit every component, text, colour, font, size,
image and grid placement. That is only possible if no page is hardcoded:

```
src/content/landing.ts            PageDoc  →  ordered Block[]
src/lib/blocks/types.ts           the schema every block conforms to
src/components/blocks/registry.ts block.type  →  React component
src/components/BlockRenderer.tsx  walks the array and draws it
```

`src/app/page.tsx` contains no layout. **Adding a section** = add a type, write
the component, add one line to the registry.

`BlockStyle` on every block covers background, colour, padding, max width,
alignment, font family/scale/weight, grid columns, gap and radius. Colours
accept a hex or a token name (`"primary-750"` → `var(--color-primary-750)`).

### Display typography

Display strings use an underscore convention so emphasis can be typed into a
plain CMS text field:

```
"Making every _reflection_ UNFORGETTABLE."
→ MAKING EVERY  reflection  UNFORGETTABLE.
     (caps)      (italic lc)    (caps)
```

`DisplayLine` parses it and reveals each word from behind its own mask.

---

## Scroll behaviours, measured off the reference site

Each is ONE self-contained group in `lib/blocks/types.ts`, so the admin shows a
single editable panel rather than loose numbers, and the whole behaviour can be
retuned or switched off as a unit.

**`shrinkOnScroll` (hero).** The hero does not move or scale. A `clip-path`
inset closes in from the edges while the section scrolls away normally — that
combination is what reads as "shrinks and rises". Measured values:

```
vertical   inset % = clamp(0, 15 * p, 13.5)
horizontal inset % = clamp(0, 15 * (p - 0.1), 12)
```

Both ramps are linear and settle at p = 0.9; the horizontal one starts a tenth
later, which is why the frame closes top-and-bottom first and then the sides.
Verified against ours: `inset(0%)` → `inset(3% 1.5%)` → `inset(7.5% 6%)` →
`inset(13.5% 12%)`.

**`transition` (stepper).** Not a crossfade. Each step is a full-bleed panel
with a HARD edge that slides up over the previous one, while the photo inside
counter-drifts sideways (scaled by `overscan` 1.14 so the drift can never
expose an edge). One persistent caption sits at the bottom the whole time and
only the active fragment brightens — the sentence is never swapped out. A
diamond rail marks progress.

**`motion` (gallery).** Items are dealt round-robin into columns and adjacent
columns drift in OPPOSITE directions; a single uniform parallax just looks like
the block sliding. Five columns on desktop, two on phones.

## Fixed header

The hero's MENU and booking controls live in a **fixed** header that stays on
screen for the whole page, as on the reference.

- **Desktop** — plain text buttons measured off the reference: 45px row, 30px
  side gutters, 15px serif at 0.9px tracking, fully transparent, two-speed roll
  on hover (0.8s out / 1s in, `cubic-bezier(0.22, 1, 0.36, 1)`).
- **Tablet and phone** (<1024px) — bare 45px icons, no panel.
- **Colour follows the ground.** Each block is wrapped in
  `data-header-theme` (`light` = pale text, `dark` = ink). `useHeaderTheme`
  hit-tests just under the bar once per frame while scrolling. Defaults per block
  type live in `HEADER_THEME` in the registry; any block can override with
  `headerTheme`. Blocks in `HEADER_FOLLOWS_MEDIA` (the stepper) go light only
  while a photo is actually under the bar.

The menu overlay is **portalled to <body>**. Rendered inside the header it
inherited the header's stacking context and scroll fade, and opened invisibly
while still locking the page. Opening it also calls `lenis.stop()` — body
`overflow: hidden` does not hold Lenis.

Anything that scrolls programmatically must go through `getLenis()` from
`lib/scroll.ts`; `window.scrollTo` is overridden by Lenis every frame.

## Per-asset grading (`MediaAdjust`)

Any `MediaRef` anywhere on the site can carry an `adjust` group, so every image
is gradable from the admin without touching code. The hero video has its own
`videoAdjust`.

| field | effect |
|---|---|
| `brightness` | CSS filter, 1 = unchanged |
| `contrast` | CSS filter, 1 = unchanged |
| `saturation` | CSS filter, 0 = greyscale |
| `blur` | CSS filter, px |
| `darkness` | 0..1 black **overlay** |
| `shade` + `shadeAmount` | colour wash (token name or hex) |

`darkness` is deliberately an overlay rather than a brightness filter: lowering
brightness crushes the highlights and makes footage look muddy, whereas an
overlay leaves the speculars intact. Helpers live in `lib/blocks/media.ts`;
wired into the hero, gallery, stepper and bands.

## Image sizing

Gallery tiles default to a **9/16** aspect because that is the shape of the
studio's reel stills. Forcing a different box makes `object-cover` crop and
upscale them, which reads on desktop as the images being zoomed in. Override
per-block with `motion.aspect`.

## Buttons and liquid glass

Hero chrome is a **44x44 icon square**, never a text pill — matched to the
reference, whose buttons measure 45x45.

**On phones there is no panel at all.** Vero's mobile buttons compute to
`background: transparent` / `backdrop-filter: none`, so ours do too: a bare
icon with a drop shadow for legibility, and the footage is never boxed in.
`ChromeButton` makes that call via `useIsMobile`, treating the pre-mount
`null` as desktop so the server and first client render match.

**On desktop the icon sits in liquid glass** (`GlassPanel`), which is seven
layers:

1. `blur(28px) saturate(200%)` backdrop — the refraction. The saturation is
   what keeps the colour behind the glass alive instead of grey.
2. a faint fill, brighter at the top, so light falls off downward
3. an inset bevel: bright top-left, soft bottom-right, as a real edge catches light
4. **rim caustic** — a conic highlight rotating around the border, masked to the
   outer 1px (`liquid-rim`, 9s)
5. **interior refraction** — two radial blobs drifting out of phase
   (`liquid-drift-a` 11s / `liquid-drift-b` 14s); the asynchrony is what stops
   it reading as a pulsing glow
6. a pointer-tracked specular highlight
7. a **water-drop ripple** on press, expanding from the exact contact point

All of it is transform/background-position only, so nothing relayouts, and the
whole set is skipped under `prefers-reduced-motion`.

Display text carries the same idea: `.liquid-text` sweeps a caustic across the
glyphs by clipping a moving gradient to them (`liquid-glint`, 7s), used on the
manifesto heading and the oversized closing statement.

---

## Media pipeline

`scripts/prepare-video.mjs` — probes the hero videos, extracts poster frames,
and remuxes with `+faststart` so the moov atom leads (without it the browser
must fetch the whole file before the first frame, which is what makes a hero
video feel janky).

The supplied desktop cut was **4096×2160, 12.1 MB** — far too heavy for a
browser to decode smoothly. It is transcoded to **1920×1012, 1.61 MB**, audio
stripped. The 4K master is kept in `media-src/` (git-ignored, not served).

The hero picks its cut at runtime via `matchMedia` and only crossfades the video
over the poster on `canplaythrough`.

---

## The 3D lipstick

`src/components/three/LipstickModel.tsx` — plain Three.js, dynamically imported
so it never reaches the server bundle.

Reflections are real: a `RoomEnvironment` is convolved into a PMREM cubemap and
used as the environment map, so the polished case genuinely mirrors its
surroundings. The topmost mesh gets the magenta bullet material, the rest a
chrome `MeshPhysicalMaterial`. Scroll drives rotation and dolly.

> In development the Lenis instance is exposed as `window.__lenis`. Lenis
> re-applies its own scroll target every frame, so a plain `window.scrollTo`
> is overridden immediately — drive it with `__lenis.scrollTo(y, {immediate:true})`.

> `@react-three/fiber` is **not** used — it pins `react <19.3` (we are on 19.3)
> and pulls in Expo. One model does not need a declarative scene graph.

---

## Mirror glass

`src/components/ui/GlassPanel.tsx` — the Apple-style surface used for the MENU
pill, CTAs and the close button. Four stacked effects: backdrop blur +
saturation, a top-lit fill, a masked 1px gradient hairline, and a
**pointer-tracked specular highlight** (that last one is what makes it read as
mirror rather than frosted).

---

## Motion

| Component | Role |
|---|---|
| `SmoothScroll` | Lenis, mounted once in the root layout |
| `Reveal` / `RevealItem` | scroll-into-view entrance + child stagger |
| `DisplayLine` | CAPS/italic display reveal behind per-word masks |
| `SplitText` | per-word / per-character reveal |
| `Magnetic` | cursor-following buttons |
| `Parallax` | scroll-scrubbed drift |
| `ScrollProgress` | hairline progress bar |
| `Preloader` | entrance curtain with a real % counter |

All of them fall back to a plain element under `prefers-reduced-motion`.

### Three bugs worth knowing about (all fixed — don't reintroduce)

1. **`tailwind-merge` ate the type scale.** Our sizes live in `@theme`
   (`--text-d1`, `--text-h3`, …), which tailwind-merge cannot see, so it
   classified `text-d2` as a *colour* and dropped it whenever a real colour
   followed in the same `cn()`. Every display heading silently collapsed to the
   inherited size. Fixed by registering the sizes in `src/lib/cn.ts`.
2. **`mask-wipe` could never trigger itself.** It hides an element by clipping
   it to zero area — which also makes its own IntersectionObserver report it as
   not visible, so a standalone mask-wipe stayed clipped forever. `Reveal` now
   keeps the outer trigger unclipped and moves the clip to an inner wrapper.
3. **Lazy images inside a mask never loaded.** The browser does not queue a
   fully clipped lazy image and does not re-check when the mask opens. Images
   inside a mask-wipe set `loading="eager"`.

---

## Outstanding — needs the client

- **Logo resolution.** `public/studio/logo-mark.jpg` is 150×150, lifted from her
  Instagram avatar. Need the original **SVG or high-res PNG**; it is currently
  used as the hero mark and the closing seal, where it will soften on retina.
- **Phone / WhatsApp.** `+91 00000 00000` in `src/content/landing.ts` and the
  number in `FloatingActions.tsx` are placeholders.
- **Founder quote.** The pull-quote is **drafted by me and attributed to Janvi**.
  It must not go live until she approves or replaces it.
- **Gallery photography.** Currently 8 stills pulled from her Instagram grid.
  Two posts were excluded (a text-heavy hair collage and the grand-opening
  poster) and two were cropped to remove burnt-in captions.
- **Service list and prices.** Not yet on the cinematic homepage; they belong on
  the inner service pages.

## Next

1. Remaining page designs.
2. Payload CMS: block schemas mirroring `lib/blocks/types.ts`, plus
   `Appointments` and `Orders` collections and media uploads.
3. Booking flow — service picker, date/time, confirmation.
