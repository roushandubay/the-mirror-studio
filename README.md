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

## Pages

Every page is a `PageDoc` in `src/content/pages/`, served by the single route
`src/app/[[...slug]]/page.tsx` (statically generated; unknown URLs 404).

| URL | Page | 3D |
|---|---|---|
| `/` | Homepage (`home.ts`) | lipstick, particles, liquid, globe |
| `/academy` | **Learn Makeup in 3 Days** — the USP | particles |
| `/services` | Service index | liquid |
| `/services/bridal` · `party` · `hair` · `beauty` | Service pages (one factory in `services.ts`) | mirror / particles / liquid |
| `/janvi-agarwal` | Janvi as the brand face | particles, liquid |
| `/destination-weddings` | Pan India & abroad | particles, globe |
| `/gallery` | Gallery | liquid |
| `/book` | Three-question booking → WhatsApp | liquid |
| `/contact`, `/faq` | | particles / liquid |
| `/terms`, `/privacy` | Draft policies | — |

`/studio` redirects to `/janvi-agarwal`, `/journal` to `/gallery` (`next.config.ts`).

Shared content lives in two files, so one edit updates every page:

- `src/content/site.ts` — navigation, header CTA, menu feature card, contact
  details, footer (a Payload **Global**)
- `src/content/shared.ts` — the 3-day curriculum, Janvi's brand-face block,
  destination regions, booking options, the closing CTA

### Homepage running order

`cinematic-hero` → `scroll-sequence` (lipstick) → **`usp-feature`** (Learn
makeup in 3 days, pinned) → `marquee` → `band` → `stepper` → `manifesto` →
**`brand-face`** (Janvi) → `media-grid-push` → **`destinations`** (globe) →
`overflow-quote` → `closing-cta` → `footer`.

The USP is placed straight after the opening scrub so no visitor misses it,
and it is also the first link in the menu and a glass feature card inside the
menu overlay.

## Inner-page blocks

| Block | What it does |
|---|---|
| `page-hero` | Inner-page opening with a live scene. Object scenes (globe, particles, mirror) sit right of the copy; surface scenes (liquid) fill the frame. Particle words form on load, then advance with scroll. |
| `usp-feature` | `full`: pinned scrub — dust forms THREE → DAYS beside the promise, then each day takes over while the dust re-forms ONE / TWO / THREE. Pin is 2.6 viewports (was 4 — it felt stuck), and each day's copy drifts with the scroll so something always moves. Copy is capped at 44vw so it never runs under the dust. `teaser`: one screen, dust cycling on its own. |
| `brand-face` | Name set enormous behind a portrait in an arch (the studio mirror's shape), liquid chrome in a larger arch behind her, pointer tilt + glare, counters. |
| `service-list` | `rows`: hairline rows; hovering floats the photo under the cursor, leaning with pointer velocity. `cards`: tilt cards. |
| `destinations` | Globe pinned left (desktop) turning India → Gulf/Europe as the regions scroll by; numbered travel steps. |
| `booking-form` | See below. |
| `faq`, `contact`, `marquee`, `text-page` | Accordion; channel list; scroll-velocity-reactive running text; policy text with sticky contents. |

## The booking page

Three questions only — **what** (one tap, auto-advances), **when & where**
(date or "not fixed yet"; studio / elsewhere in India / abroad, with a city
field only when travelling), **who** (name + WhatsApp). The request is written
into a pre-filled WhatsApp message; nothing is stored server-side yet.
`/book?service=academy` (or `bridal`, `party`, `hair`, `beauty`) pre-selects
step one — every "Book" link on the site uses it.

## WebGL scenes

Blocks never import Three.js. They name a scene in data (`scene: "globe"`) and
render `SceneCanvas`, which dynamically imports `three` and only that scene.

| Scene | File | Notes |
|---|---|---|
| `mirror` | `three/scenes/mirror.ts` | The logo as a brushed-silver mirror box: logo front, true mirror back, easing turn that lingers on each face, orbiting specks. Rose and gold panels are baked into the reflected room. |
| `globe` | `three/scenes/globe.ts` | Fibonacci dot sphere, arcs from Siliguri to 16 cities, pulsing pins. No textures. |
| `particles` | `three/scenes/particles.ts` | Up to 7k dust grains sampled from Cormorant glyphs, staggered morph through words, pointer gust. |
| `liquid` | `three/scenes/liquid.ts` | One-triangle shader: domain-warped metal reflecting a procedural studio, thin-film tint. |

**The 3D lipstick is homepage-only** (`scroll-sequence.model`). It is
deliberately not a `SceneName`, so no inner page can select it.

All scenes run on `lib/three/stage.ts`: paused off screen (IntersectionObserver)
and in background tabs, sized by ResizeObserver, DPR capped, shared eased
pointer (touch ignored). Skipped for reduced motion.

> **Particle words are spelled out, not numerals.** Cormorant's figures are
> old-style — a "3" hangs below the baseline and reads as a hook in dust.
> Sampling uses the 600 weight; the light cut's hairlines are too thin to hold
> enough grains.

## Page transitions & Lenis

- `app/template.tsx` — a plum curtain lifts off each new page on client
  navigation (skipped on first load). It is a sibling of the page, never a
  transformed wrapper, so fixed/sticky children keep working.
- `SmoothScroll` — Lenis 1.3 ticked from **Motion's frame loop** (`frame.update`)
  so scroll and every `useScroll` style land in the same frame; `anchors`,
  `stopInertiaOnNavigate`, `allowNestedScroll` on; scroll reset + `resize()` on
  every route change.

The Figma commerce blocks (`hero`, `categories`, `product-carousel`,
`feature-row`, `offer`, `brand`, `blog`, `value-props`, `header`) are still
registered.

---

## Architecture — the page is data, not JSX

The CMS must let the client edit every component, text, colour, font, size,
image and grid placement. That is only possible if no page is hardcoded:

```
src/content/pages/*.ts            PageDoc  →  ordered Block[]
src/content/pages/index.ts        slug  →  PageDoc  (swap for a CMS query)
src/lib/blocks/types.ts           the schema every block conforms to
src/components/blocks/registry.ts block.type  →  React component
src/components/BlockRenderer.tsx  walks the array and draws it
```

`src/app/[[...slug]]/page.tsx` contains no layout. **Adding a section** = add a type, write
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

`src/components/SiteHeader.tsx`, rendered once per page (it used to live inside
the homepage hero). MENU, booking CTA, and on inner pages a centred wordmark
linking home. It stays on screen for the whole page, as on the reference.

- **Desktop** — plain text buttons measured off the reference: 45px row, 30px
  side gutters, 15px serif at 0.9px tracking, fully transparent, two-speed roll
  on hover (0.8s out / 1s in, `cubic-bezier(0.22, 1, 0.36, 1)`).
- **Tablet and phone** (<1024px) — bare 45px icons, no panel.
- **Colour follows the ground.** Each block is wrapped in
  `data-header-theme` (`light` = pale text, `dark` = ink). `useHeaderTheme`
  hit-tests just under the bar once per frame while scrolling — **once per
  control** (left, centre, right), so a row straddling a dark panel and cream
  colours each control correctly. Any element inside a block can carry its own
  `data-header-theme` (the booking page's dark panel does). Defaults per block
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

Every button on the site is `GlassPanel` (via `GlassCta`, `TextCta`, `Button`,
the booking controls, footer submit, service arrows, floating actions),
modelled on the macOS Tahoe Control Center controls:

1. **Light blur, strong colour.** `blur(14px) saturate(190%) brightness(1.12)` —
   the pane takes the colour of what is behind it instead of greying it out.
2. **Continuous curvature.** Capsules and circles by default (`radius` 999);
   tiles pass a radius (booking choices 26, menu feature card 30).
3. **Specular rim.** A 1px masked gradient ring, bright where light enters
   (top-left) and exits (bottom-right), faint along the sides.
4. **Edge lensing.** Inner top highlight, darker inner bottom edge, soft inner
   glow — the pane reads thicker at its rim than its centre.
5. A pointer-tracked highlight on hover, and a water-drop ripple on press.

Tones: `light` (dark grounds), `dark` (cream), `accent` (brand-tinted glass for
the one primary action — booking "Continue", "Send on WhatsApp", a selected
booking tile with its white check disc, like an active toggle).

**The fixed header is the exception.** On desktop MENU and BOOK YOUR
APPOINTMENT stay the transparent reference text buttons, as measured; on phones
(`useIsMobile`) they are 44px glass circles. This split is the client's call.

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

`src/components/ui/GlassPanel.tsx` — see **Buttons and liquid glass** above.

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
- **Phone / WhatsApp.** `SITE.phone` and `SITE.whatsapp` in
  `src/content/site.ts` are placeholders — the booking form sends to that
  WhatsApp number, so **bookings go nowhere until it is replaced**.
- **Founder quote.** The drafted pull-quote was removed from the homepage (the
  `brand-face` block replaced it). Don't reinstate it without Janvi's approval.
- **Academy course.** The 3-day curriculum, "small batches", the certificate,
  and all FAQ answers about fees/batches are **draft** (`src/content/shared.ts`).
- **Service menus** are draft and deliberately carry no prices.
- **Brand-face stats** use facts from the studio's own offer (3 days, 5 services,
  6 months, 22 listed cities), not career numbers — replace with real ones.
- **Destination cities** and **opening hours** (`/contact`) are placeholders.
- **Policies** (`/terms`, `/privacy`) are drafts for the studio / a lawyer to review.
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
