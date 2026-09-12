/**
 * The page is DATA, not JSX.
 *
 * Every section on the landing page is one Block in an ordered array. The CMS
 * admin edits this array — reorder, add, delete, and override any text, colour,
 * font, size, image or grid placement — and the renderer maps each block to a
 * component. Nothing about a page is hardcoded, which is the whole reason the
 * visual editor can exist.
 */

/** Per-block presentation overrides. Every field is optional: unset = use the
 *  Figma default baked into the component. The admin writes into this object. */
export type BlockStyle = {
  /** CSS colour or a token name like "primary-750" */
  background?: string;
  color?: string;
  paddingTop?: number;
  paddingBottom?: number;
  /** content well width in px; unset = 1224 */
  maxWidth?: number;
  align?: "left" | "center" | "right";
  fontFamily?: string;
  /** multiplies the block's base type scale, e.g. 1.25 */
  fontScale?: number;
  fontWeight?: number;
  /** grid columns for card blocks */
  columns?: number;
  gap?: number;
  radius?: number;
  /** arbitrary escape hatch for power users */
  className?: string;
};

export type AnimationName =
  | "none"
  | "fade"
  | "rise"
  | "mask-wipe"
  | "split-words"
  | "split-chars"
  | "parallax"
  | "scale-in";

export type BlockAnimation = {
  on?: AnimationName;
  /** seconds */
  duration?: number;
  delay?: number;
  /** per-child stagger, seconds */
  stagger?: number;
  /** 0..1 — how much of the block must be visible before it fires */
  amount?: number;
  once?: boolean;
};

/**
 * Per-asset image/video grading, editable in the admin.
 *
 * Everything except `darkness` and `shade` is a real CSS filter applied to the
 * pixels; those two are a separate overlay layer, because darkening with a
 * filter also crushes the highlights whereas an overlay keeps them.
 *
 * One editable group, attachable to ANY MediaRef — so every image on the site
 * can be graded individually without touching code.
 */
export type MediaAdjust = {
  /** 1 = unchanged. Above 1 brightens, below 1 darkens. */
  brightness?: number;
  /** 1 = unchanged */
  contrast?: number;
  /** 1 = unchanged, 0 = greyscale */
  saturation?: number;
  /** px of blur */
  blur?: number;
  /** 0..1 black overlay laid on top (keeps highlights, unlike brightness) */
  darkness?: number;
  /** colour wash laid over the asset, e.g. "primary-900" or "#14010a" */
  shade?: string;
  /** 0..1 strength of the shade wash */
  shadeAmount?: number;
};

/** Which viewports an asset appears on. */
export type Viewport = "desktop" | "mobile" | "both";

export type MediaRef = {
  /** the desktop source, and the fallback everywhere */
  src: string;
  /**
   * Optional separate file used below the lg breakpoint. Phones want a portrait
   * crop; desktops want a landscape one. Using one file for both is what forces
   * object-cover to crop hard and makes the picture look zoomed in.
   */
  srcMobile?: string;
  /** show this asset only on one viewport. Defaults to "both". */
  showOn?: Viewport;
  alt?: string;
  /** object-position, e.g. "50% 30%" */
  focal?: string;
  /** aspect-ratio for this asset's box, e.g. "16 / 9". Overrides the block default. */
  aspect?: string;
  /** "cover" crops to fill (default); "contain" shows the whole picture, never zoomed */
  fit?: "cover" | "contain";
  /** fit below the lg breakpoint; falls back to "cover" (a portrait still fills
   *  a phone screen fine, so contain is usually only wanted on desktop) */
  fitMobile?: "cover" | "contain";
  /** per-asset grading — see MediaAdjust */
  adjust?: MediaAdjust;
};

export type LinkRef = {
  label: string;
  href: string;
  /** renders as an outline button rather than a text link */
  variant?: "solid" | "outline" | "ghost" | "link";
};

/** Fields shared by every block. */
export type BlockBase = {
  /** stable id — the admin reorders by this, never by array index */
  id: string;
  hidden?: boolean;
  style?: BlockStyle;
  anim?: BlockAnimation;
  /**
   * Colour the fixed header uses while this block is under it: "light" = pale
   * text for dark/photographic grounds, "dark" = ink text for pale grounds.
   * Unset = the default for the block type (see HEADER_THEME in the registry).
   */
  headerTheme?: "light" | "dark";
};

/* ------------------------------- block types ------------------------------ */

export type HeaderBlock = BlockBase & {
  type: "header";
  logo: MediaRef;
  nav: LinkRef[];
  showSearch?: boolean;
  showLocale?: boolean;
  locale?: string;
  sticky?: boolean;
};

export type HeroSlide = {
  id: string;
  image: MediaRef;
  heading: string;
  cta?: LinkRef;
  /** 0..1 dark scrim over the photo */
  overlay?: number;
};

export type HeroBlock = BlockBase & {
  type: "hero";
  slides: HeroSlide[];
  height?: number;
  autoplayMs?: number;
  showArrows?: boolean;
  showDots?: boolean;
};

export type CategoryItem = {
  id: string;
  label: string;
  image: MediaRef;
  href: string;
};

export type CategoriesBlock = BlockBase & {
  type: "categories";
  heading: string;
  items: CategoryItem[];
};

export type SplitPromoBlock = BlockBase & {
  type: "split-promo";
  heading: string;
  body?: string;
  /** small line above the CTA, e.g. "Scan with your phone to get started" */
  kicker?: string;
  divider?: string;
  qr?: MediaRef;
  image: MediaRef;
  cta?: LinkRef;
  /** which side the artwork sits on */
  mediaSide?: "left" | "right";
  /** full-bleed dark band vs inset card */
  variant?: "band" | "inset";
};

export type ProductItem = {
  id: string;
  title: string;
  description?: string;
  price?: string;
  image: MediaRef;
  href: string;
  badge?: string;
};

export type ProductCarouselBlock = BlockBase & {
  type: "product-carousel";
  heading: string;
  items: ProductItem[];
  /** cards visible at 1440 */
  perView?: number;
  showArrows?: boolean;
};

export type EditorialCard = {
  heading: string;
  body?: string;
  image: MediaRef;
  href?: string;
};

export type FeatureRowBlock = BlockBase & {
  type: "feature-row";
  heading: string;
  editorial: EditorialCard;
  items: ProductItem[];
};

export type OfferBlock = BlockBase & {
  type: "offer";
  eyebrow?: string;
  heading: string;
  body?: string;
  footnote?: string;
  image: MediaRef;
  badge?: MediaRef;
  cta?: LinkRef;
  mediaSide?: "left" | "right";
};

export type BrandBlock = BlockBase & {
  type: "brand";
  heading: string;
  body: string;
  image: MediaRef;
  cta?: LinkRef;
};

export type PostItem = {
  id: string;
  title: string;
  excerpt?: string;
  image: MediaRef;
  href: string;
  author?: string;
  date?: string;
  category?: string;
};

export type BlogBlock = BlockBase & {
  type: "blog";
  heading: string;
  viewAll?: LinkRef;
  items: PostItem[];
};

export type ValuePropItem = { id: string; icon: MediaRef; label: string };

export type ValuePropsBlock = BlockBase & {
  type: "value-props";
  items: ValuePropItem[];
};

export type FooterColumn = { id: string; heading: string; links: LinkRef[] };

export type FooterBlock = BlockBase & {
  type: "footer";
  columns: FooterColumn[];
  newsletter?: {
    heading: string;
    body?: string;
    placeholder?: string;
    cta: string;
    consent?: string;
  };
  socials: { id: string; label: string; icon: MediaRef; href: string }[];
  phone?: string;
  address?: string;
  copyright?: string;
  legal?: LinkRef[];
  watermark?: MediaRef;
};


/* --------------------- cinematic homepage block types ---------------------
 * Layout modelled on verostudio.com: a long-form, scroll-driven narrative
 * rather than a dense commerce grid. Display strings use the DisplayLine
 * underscore convention — "Your most _important_ day" renders YOUR MOST
 * *important* DAY.
 * ------------------------------------------------------------------------ */


/* ----------------------------- scroll effects -----------------------------
 * Each of these is ONE self-contained, admin-editable group. They are grouped
 * deliberately: the admin shows a single "Shrink on scroll" / "Step transition"
 * panel rather than a dozen loose numbers, and the whole behaviour can be
 * tuned or switched off as one unit.
 * ------------------------------------------------------------------------ */

/**
 * The hero recedes as you scroll: it does NOT move or scale. A clip-path inset
 * closes in from the edges while the section scrolls away normally, which reads
 * as the frame shrinking and rising. Measured off the reference site:
 *   vertical   inset % = clamp(0, 15 * p, 13.5)
 *   horizontal inset % = clamp(0, 15 * (p - 0.1), 12)
 * i.e. both ramp at the same rate, the horizontal one lagging by 0.1, and both
 * settle at p = 0.9.
 */
export type ShrinkOnScroll = {
  enabled?: boolean;
  /** final inset from top and bottom, % of the frame */
  verticalTo?: number;
  /** final inset from left and right, % of the frame */
  horizontalTo?: number;
  /** progress at which the horizontal inset starts (0..1) */
  horizontalLag?: number;
  /** progress at which both insets reach their final value */
  completeAt?: number;
  /** corner radius at full inset, px */
  radiusTo?: number;
  /** extra dimming of the media as it recedes, 0..1 */
  dimTo?: number;
};

/**
 * How one step replaces the previous one. "slide-up" is the reference
 * behaviour: the incoming step is a full-bleed panel with a hard edge that
 * slides up over the outgoing one, while the photo inside counter-drifts
 * sideways (scaled by `overscan` so the drift never exposes an edge).
 */
export type StepTransition = {
  style?: "slide-up" | "fade";
  /** horizontal counter-drift of the inner photo, px */
  drift?: number;
  /** scale on the inner photo so the drift cannot expose an edge */
  overscan?: number;
  /** portion of each step's slot spent transitioning, 0..1 */
  travel?: number;
};

/** Gallery reveal + the opposing-column drift used on narrow screens. */
export type GridMotion = {
  /** columns at desktop width */
  columns?: number;
  /** columns on phones — two, drifting in opposite directions */
  columnsMobile?: number;
  /** per-item entrance offset, px */
  rise?: number;
  /** stagger between items, seconds */
  stagger?: number;
  /** opposing vertical drift between adjacent columns, px */
  drift?: number;
  /**
   * CSS aspect-ratio for each tile. Default 9/16 matches the studio's reel
   * stills — forcing a different ratio makes object-cover crop and upscale
   * them, which reads as the images being zoomed in.
   */
  aspect?: string;
};

export type CinematicHeroBlock = BlockBase & {
  type: "cinematic-hero";
  /** poster for the landscape cut; shown until the video can play */
  image: MediaRef;
  /** landscape cut, served at 768px and up */
  video?: string;
  /** portrait cut served below 768px; falls back to `video` */
  videoMobile?: string;
  /** poster for the portrait cut; falls back to `image` */
  imageMobile?: MediaRef;
  /** grading applied to the hero video itself — see MediaAdjust */
  videoAdjust?: MediaAdjust;
  wordmark?: string;
  wordmarkImage?: MediaRef;
  /** DisplayLine syntax */
  tagline: string;
  menuLabel?: string;
  /** links shown in the full-screen menu overlay */
  nav?: LinkRef[];
  address?: string;
  instagram?: string;
  cta?: LinkRef;
  /** render the 3D lipstick over the frame instead of flat media */
  model?: "lipstick" | "none";
  overlay?: number;
  /** single editable group — see ShrinkOnScroll */
  shrinkOnScroll?: ShrinkOnScroll;
  scrollCue?: string;
};

/** One headline stage revealed at a point along a pinned scroll-scrub. */
export type SequenceStage = {
  id: string;
  /** DisplayLine syntax */
  heading: string;
  body?: string;
  /** 0..1 position within the pinned scroll where this stage is centred */
  at: number;
};

export type ScrollSequenceBlock = BlockBase & {
  type: "scroll-sequence";
  /** single image scrubbed by scale, or an ordered frame sequence when supplied */
  image: MediaRef;
  frames?: string[];
  /** swap the flat media for a real 3D model on a pinned scrub */
  model?: "lipstick" | "none";
  /**
   * Dark frosted panel laid over the media. Because it uses backdrop-filter it
   * genuinely blurs the 3D scene behind it rather than just tinting it, which
   * is what makes the model sit *behind* glass instead of under a flat scrim.
   * One editable group.
   */
  glassOverlay?: {
    enabled?: boolean;
    /** 0..1 darkness of the tint */
    tint?: number;
    /** blur radius behind the glass, px */
    blur?: number;
  };
  /** model dissolves toward the end of the scrub instead of cutting away */
  fadeOut?: boolean;
  stages: SequenceStage[];
  /** how many viewport heights the pin lasts */
  scrollLength?: number;
  /** start and end scale of the media across the scrub */
  scaleFrom?: number;
  scaleTo?: number;
  background?: string;
};

export type StepperStep = {
  id: string;
  label: string;
  /**
   * One piece of the single persistent caption line, DisplayLine syntax.
   * The reference site shows the whole sentence at all times and brightens the
   * active fragment — it does not swap the caption per step.
   */
  segment: string;
  image: MediaRef;
};

export type StepperBlock = BlockBase & {
  type: "stepper";
  /** DisplayLine syntax, shown before the steps take over */
  heading?: string;
  steps: StepperStep[];
  scrollLength?: number;
  showRail?: boolean;
  /** single editable group — see StepTransition */
  transition?: StepTransition;
};

export type BandBlock = BlockBase & {
  type: "band";
  image: MediaRef;
  /** DisplayLine syntax */
  caption?: string;
  height?: number;
  overlay?: number;
  parallax?: number;
};

export type ManifestoBlock = BlockBase & {
  type: "manifesto";
  /** DisplayLine syntax */
  heading: string;
  lead?: string;
  body?: string[];
  cta?: LinkRef;
};

export type MediaGridPushBlock = BlockBase & {
  type: "media-grid-push";
  items: MediaRef[];
  /** centred glass pill floating over the grid */
  cta?: LinkRef;
  /** single editable group — see GridMotion */
  motion?: GridMotion;
};

export type PullQuoteBlock = BlockBase & {
  type: "pull-quote";
  quote: string;
  attribution?: string;
  role?: string;
  image?: MediaRef;
};

export type OverflowQuoteBlock = BlockBase & {
  type: "overflow-quote";
  /** rendered oversized, running past both viewport edges */
  lines: string[];
  attribution?: string;
  /** rotating seal in the centre */
  seal?: MediaRef;
  sealText?: string;
};

export type ClosingCtaBlock = BlockBase & {
  type: "closing-cta";
  /** DisplayLine syntax */
  heading: string;
  body?: string;
  cta: LinkRef;
};

export type Block =
  | HeaderBlock
  | HeroBlock
  | CategoriesBlock
  | SplitPromoBlock
  | ProductCarouselBlock
  | FeatureRowBlock
  | OfferBlock
  | BrandBlock
  | BlogBlock
  | ValuePropsBlock
  | FooterBlock
  | CinematicHeroBlock
  | ScrollSequenceBlock
  | StepperBlock
  | BandBlock
  | ManifestoBlock
  | MediaGridPushBlock
  | PullQuoteBlock
  | OverflowQuoteBlock
  | ClosingCtaBlock;

export type BlockType = Block["type"];

/** Global, site-wide theme. The admin's colour/font pickers write here and the
 *  values are injected as CSS custom properties, so one edit restyles
 *  everything at once. */
export type ThemeDoc = {
  colors: Record<string, string>;
  fonts: { sans: string };
  radius: number;
  /** master on/off for all scroll animation */
  motion: boolean;
};

export type PageDoc = {
  slug: string;
  title: string;
  description?: string;
  theme?: Partial<ThemeDoc>;
  blocks: Block[];
};
