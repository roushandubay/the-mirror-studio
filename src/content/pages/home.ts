import type { PageDoc } from "@/lib/blocks/types";
import { FOOTER } from "@/content/site";
import {
  CLOSING,
  GALLERY_ITEMS,
  JANVI_FACE,
  REGIONS,
  USP_FULL,
  USP_MARQUEE,
} from "@/content/shared";

/**
 * The homepage, as data.
 *
 * Long-form cinematic structure (modelled on verostudio.com) rendered in the
 * Beautya palette from Figma. Display strings use the DisplayLine underscore
 * convention: "Making every _reflection_ UNFORGETTABLE." renders the underscored
 * words in display italic lowercase and everything else in caps.
 *
 * Media is the studio's own: the logo and photography come from
 * @themirror_by_janviiagarwal, the hero videos were supplied by the client, and
 * the pinned scroll section drives the client's Lipstick.fbx in real 3D.
 *
 * COPY STATUS: business facts (name, positioning, address, services) are taken
 * from the studio's own Instagram and grand-opening poster. Prices and the
 * founder quote are DRAFT and must be confirmed by Janvi before this is shown
 * to clients.
 *
 * Running order: the studio's promise, then its headline offer — "Learn makeup
 * in three days" — straight after the opening scrub so no visitor misses it,
 * then the process, Janvi as the face of the brand, the work, and where the
 * studio travels.
 */

export const homePage: PageDoc = {
  slug: "/",
  title: "THE MIRROR by Janvi Agarwal — Luxury Makeup Studio, Salon & Academy",
  description:
    "Bridal makeup, hair and beauty by Janvi Agarwal — in Siliguri, across India and abroad. Home of the signature course: learn makeup in three days.",
  preloader: "Making every _reflection_ UNFORGETTABLE.",
  headerDelay: 1.1,

  blocks: [
    {
      id: "hero",
      type: "cinematic-hero",
      video: "/video/hero-desktop.mp4",
      videoMobile: "/video/hero-mobile.mp4",
      image: { src: "/video/hero-desktop.jpg", alt: "Inside THE MIRROR studio, Siliguri" },
      imageMobile: { src: "/video/hero-mobile.jpg", alt: "Inside THE MIRROR studio, Siliguri" },
      wordmarkImage: { src: "/studio/logo-mark.jpg", alt: "THE MIRROR by Janvi Agarwal" },
      tagline: "Making every _reflection_ UNFORGETTABLE.",
      // Bright, full-colour footage like the reference — the scrims behind the
      // buttons do the legibility work instead of a blanket scrim.
      overlay: 0.12,
      // One editable group per asset. brightness/contrast/saturation are real
      // CSS filters; darkness is a separate overlay so highlights survive.
      videoAdjust: {
        brightness: 1.04,
        contrast: 1.06,
        saturation: 1.06,
        darkness: 0.08,
      },
      // One editable group. Measured off the reference site: both insets ramp
      // linearly and settle at 90% of the hero's scroll, the horizontal one
      // starting a tenth later so the frame closes top/bottom first.
      shrinkOnScroll: {
        enabled: true,
        verticalTo: 13.5,
        horizontalTo: 12,
        horizontalLag: 0.1,
        completeAt: 0.9,
        radiusTo: 0,
        dimTo: 0.85,
      },
    },

    {
      id: "essence",
      type: "scroll-sequence",
      model: "lipstick",
      image: { src: "/studio/reel-04.jpg", alt: "Neutral eyeshadow palette and brushes" },
      background: "primary-900",
      // Much shorter scrub — this used to hold the visitor for four viewports
      scrollLength: 1.8,
      fadeOut: true,
      glassOverlay: { enabled: true, tint: 0.28, blur: 20 },
      stages: [
        {
          id: "st1",
          at: 0.16,
          heading: "YOUR MOST _important_ DAY",
        },
        {
          id: "st2",
          at: 0.5,
          heading: "DESERVES A FACE THAT _lasts._",
        },
        {
          id: "st3",
          at: 0.84,
          heading: "the ESSENCE of _the mirror_",
          body: "A luxury makeup studio, salon and academy on Sevoke Road — where every look is built around the person in the chair.",
        },
      ],
    },

    // The headline offer, immediately after the opening scrub
    USP_FULL,
    USP_MARQUEE,

    {
      id: "signage",
      type: "band",
      image: { src: "/studio/reel-11.jpg", alt: "THE MIRROR signage in gold on the studio wall", focal: "50% 45%", fit: "contain", fitMobile: "cover" },
      caption: "where ARTISTRY meets _precision_",
      height: 320,
      overlay: 0.3,
      parallax: 110,
    },

    {
      id: "process",
      type: "stepper",
      heading: "a PROCESS BUILT for _perfection_",
      scrollLength: 3,
      // One editable group — hard-edged panels sliding up, photo counter-drift.
      // overscan only needs to cover the drift; more than that crops the photo.
      transition: { style: "slide-up", drift: 70, overscan: 1.06, travel: 0.55 },
      steps: [
        {
          id: "p1",
          label: "01 — Consultation",
          segment: "From the FIRST _conversation,_",
          image: { src: "/studio/reel-02.jpg", alt: "Janvi consulting with a client", focal: "50% 40%", fit: "contain", fitMobile: "cover" },
        },
        {
          id: "p2",
          label: "02 — Trial",
          segment: "to the PERFECT _trial,_",
          image: { src: "/studio/reel-03.jpg", alt: "Selecting shades at the studio", focal: "50% 50%", fit: "contain", fitMobile: "cover" },
        },
        {
          id: "p3",
          label: "03 — Hair & Styling",
          segment: "to every STRAND in _place,_",
          image: { src: "/studio/reel-07.jpg", alt: "Hair styling at the studio", focal: "50% 45%", fit: "contain", fitMobile: "cover" },
        },
        {
          id: "p4",
          label: "04 — The Day",
          segment: "to the MOMENT you _walk in._",
          image: { src: "/studio/reel-05.jpg", alt: "A finished look at THE MIRROR", focal: "50% 30%", fit: "contain", fitMobile: "cover" },
        },
      ],
    },

    {
      id: "manifesto",
      type: "manifesto",
      heading: "so THAT YOU BECOME _art._",
      lead: "Seen once. Remembered always.",
      body: [
        "You get ready once, and the photographs last a lifetime. That hour in the chair deserves to feel as considered as the day it is building towards.",
        "THE MIRROR is a luxury makeup studio, salon and academy in Siliguri, led by Janvi Agarwal. Bridal, hair and beauty — done unhurried, in a space kept immaculately clean, with products chosen for how they wear through a full Indian wedding day, not just how they photograph in the first hour.",
        "Every booking begins with a conversation. We talk through your outfit, your jewellery, the light at your venue, and how you want to feel. Then we build a look that holds.",
        "Alongside bridal and party makeup the salon runs manicure, pedicure, hair trimming, hair spa and cleanup — available individually or on a six-month membership.",
      ],
      cta: { label: "Explore our SERVICES", href: "/services" },
    },

    JANVI_FACE,

    {
      id: "gallery",
      type: "media-grid-push",
      cta: { label: "Explore the GALLERY", href: "/gallery" },
      // One editable group — five columns on desktop, two on phones, adjacent
      // columns always drifting against each other
      motion: {
        columns: 5,
        columnsMobile: 2,
        drift: 130,
        rise: 44,
        stagger: 0.07,
        aspect: "9 / 16",
      },
      items: GALLERY_ITEMS.slice(0, 9),
    },

    {
      id: "destinations",
      type: "destinations",
      eyebrow: "Pan India & abroad",
      heading: "From SILIGURI to _wherever you say yes._",
      body: "The studio travels. Janvi and her team fly to weddings across India and overseas, with the full kit and the same unhurried care as in the chair on Sevoke Road.",
      regions: REGIONS,
      cta: { label: "Plan a DESTINATION BOOKING", href: "/destination-weddings" },
      scene: "globe",
    },

    {
      id: "closing-quote",
      type: "overflow-quote",
      lines: ["EVERY FACE TELLS", "A STORY WORTH", "REMEMBERING."],
      seal: { src: "/studio/logo-mark.jpg", alt: "" },
      attribution: "THE MIRROR — SILIGURI",
    },

    CLOSING,
    FOOTER,
  ],
};
