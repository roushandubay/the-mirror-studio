import type {
  BookingOption,
  BrandFaceBlock,
  ClosingCtaBlock,
  DestinationRegion,
  MarqueeBlock,
  MediaRef,
  UspDay,
  UspFeatureBlock,
} from "@/lib/blocks/types";

/**
 * Content fragments reused across several pages. In Payload these become
 * reusable blocks (or relationship fields), so editing the course outline once
 * updates the homepage, the academy page and every teaser at the same time.
 *
 * COPY STATUS — DRAFT, needs Janvi's sign-off before launch:
 *  - the three-day curriculum, batch format and certificate
 *  - the service menus (no prices are shown anywhere on purpose)
 *  - the list of destination cities
 * Facts taken from the studio's own material: the name, address, the
 * six-month membership with five complimentary services, and the salon menu
 * (manicure, pedicure, hair trimming, hair spa, cleanup).
 */

/* --------------------------------- photos --------------------------------- */
export const PHOTO = {
  janvi: { src: "/studio/reel-08.jpg", alt: "Janvi Agarwal, founder of THE MIRROR", focal: "50% 26%" },
  janviAtWork: { src: "/studio/reel-02.jpg", alt: "Janvi Agarwal styling a client's hair", focal: "45% 30%" },
  finishedLook: { src: "/studio/reel-05.jpg", alt: "A finished look at THE MIRROR", focal: "50% 30%" },
  shades: { src: "/studio/reel-03.jpg", alt: "Selecting shades at the studio" },
  palette: { src: "/studio/reel-04.jpg", alt: "Neutral eyeshadow palette and brushes" },
  vanity: { src: "/studio/reel-06.jpg", alt: "The studio vanity" },
  blowDry: { src: "/studio/reel-07.jpg", alt: "Blow-dry and styling", focal: "50% 40%" },
  pedicure: { src: "/studio/reel-01.jpg", alt: "Pedicure at the salon", focal: "50% 35%" },
  hairColour: { src: "/studio/reel-09.jpg", alt: "Hair colour and smoothening, before and after", focal: "50% 50%" },
  membership: { src: "/studio/reel-10.jpg", alt: "THE MIRROR six-month membership card", focal: "50% 55%" },
  signage: { src: "/studio/reel-11.jpg", alt: "THE MIRROR signage in gold on the studio wall", focal: "50% 45%" },
} satisfies Record<string, MediaRef>;

export const GALLERY_ITEMS: MediaRef[] = [
  PHOTO.finishedLook,
  PHOTO.shades,
  PHOTO.janvi,
  PHOTO.palette,
  PHOTO.signage,
  PHOTO.janviAtWork,
  PHOTO.vanity,
  PHOTO.blowDry,
  PHOTO.pedicure,
  PHOTO.hairColour,
];

/* ------------------------ the USP: learn in 3 days ------------------------ */
export const ACADEMY_DAYS: UspDay[] = [
  {
    id: "d1",
    label: "Day 01",
    title: "SKIN, BASE & _flawless finish_",
    points: [
      "Reading skin type and undertone",
      "Prep, priming and colour correction",
      "Foundation matching for Indian skin tones",
      "Concealing, setting and making it last",
      "Brush hygiene and a clean kit",
      "Hands-on practice, corrected live",
    ],
  },
  {
    id: "d2",
    label: "Day 02",
    title: "EYES, BROWS & _definition_",
    points: [
      "Brow mapping and shaping",
      "Blending eyeshadow without muddiness",
      "Winged, smudged and tight-line liner",
      "Applying lashes that stay put",
      "Contour, blush and highlight placement",
      "Lips that survive a full evening",
    ],
  },
  {
    id: "d3",
    label: "Day 03",
    title: "THE COMPLETE _look_",
    points: [
      "A soft day look, start to finish",
      "A party glam look, start to finish",
      "Bridal-ready techniques for photographs",
      "Timing a look against the clock",
      "Building your own starter kit",
      "Certificate of completion",
    ],
  },
];

export const USP_FULL: UspFeatureBlock = {
  id: "learn-in-three-days",
  type: "usp-feature",
  eyebrow: "THE MIRROR Academy — signature course",
  heading: "Learn makeup _in three days._",
  body: "Taught by Janvi Agarwal in her own studio. Three focused days, a brush in your hand from the first hour, and a complete look you can do on your own by the last.",
  highlights: ["3 days", "Hands-on", "Small batches", "Taught by Janvi", "Certificate"],
  days: ACADEMY_DAYS,
  cta: { label: "Reserve your SEAT", href: "/book?service=academy" },
  secondaryCta: { label: "See the course", href: "/academy" },
  // was 4 — long enough to feel stuck; 2.6 keeps each day readable
  scrollLength: 2.6,
};

export const USP_TEASER: UspFeatureBlock = {
  ...USP_FULL,
  id: "learn-in-three-days-teaser",
  variant: "teaser",
  heading: "Or learn to do it _yourself._",
  body: "The signature three-day course at THE MIRROR Academy — from bare skin to a finished look, in your hands.",
};

export const USP_MARQUEE: MarqueeBlock = {
  id: "usp-marquee",
  type: "marquee",
  tone: "accent",
  items: ["Learn makeup _in three days_", "Taught by Janvi Agarwal", "Siliguri studio", "Pan India & abroad"],
  speed: 34,
};

/* ------------------------- Janvi, the brand face ------------------------- */
export const JANVI_FACE: BrandFaceBlock = {
  id: "janvi",
  type: "brand-face",
  eyebrow: "The face of THE MIRROR",
  name: "Janvi Agarwal",
  role: "Founder & lead artist",
  statement: "Every look STARTS with _listening._",
  body: [
    "Janvi Agarwal founded THE MIRROR on Sevoke Road as a studio where nobody is rushed out of the chair. She leads the bridal bookings herself and teaches every academy batch in person.",
    "Her work is skin-first and long-wearing — built for the heat, the lights and the length of an Indian wedding day, and for how a face actually reads in photographs.",
  ],
  portrait: PHOTO.janvi,
  secondary: PHOTO.janviAtWork,
  signature: "Janvi Agarwal",
  // Figures taken from the studio's own offer, not invented career numbers.
  // Replace with real milestones (brides, students, years) once Janvi confirms.
  stats: [
    { id: "s1", value: 3, suffix: " days", label: "To learn makeup" },
    { id: "s2", value: 5, label: "Complimentary salon services" },
    { id: "s3", value: 6, suffix: " months", label: "Membership validity" },
    // the number of cities listed in REGIONS below — keep in step
    { id: "s4", value: 22, suffix: "cities", label: "On the travel map" },
  ],
  cta: { label: "Meet JANVI", href: "/janvi-agarwal" },
  scene: "liquid",
};

/* ------------------------------ destinations ------------------------------ */
export const REGIONS: DestinationRegion[] = [
  { id: "r1", region: "North Bengal & the hills", cities: ["Siliguri", "Darjeeling", "Kalimpong", "Gangtok"] },
  { id: "r2", region: "East & Northeast", cities: ["Kolkata", "Guwahati", "Shillong", "Kathmandu"] },
  { id: "r3", region: "North & West India", cities: ["Delhi", "Jaipur", "Udaipur", "Mumbai", "Goa"] },
  { id: "r4", region: "South India", cities: ["Bengaluru", "Hyderabad", "Kerala"] },
  { id: "r5", region: "Abroad", cities: ["Dubai", "Bangkok", "Bali", "Singapore", "London", "Toronto"] },
];

export const TRAVEL_NOTES = [
  {
    id: "n1",
    title: "Tell us the date and the city",
    body: "That is all the booking form asks. We check the artist's calendar and come back on WhatsApp.",
  },
  {
    id: "n2",
    title: "A trial before anyone travels",
    body: "At the Siliguri studio, or on a video call for brides abroad, so the look is settled before the day.",
  },
  {
    id: "n3",
    title: "One clear travel quote",
    body: "Travel and stay for the team are quoted up front with the service, in writing, before you confirm.",
  },
  {
    id: "n4",
    title: "The studio arrives with you",
    body: "The artist travels with the full kit, lighting and hair tools, and stays with you through the day.",
  },
];

/* --------------------------------- booking -------------------------------- */
export const BOOKING_SERVICES: BookingOption[] = [
  { value: "academy", label: "Learn makeup in 3 days", hint: "The academy course, taught by Janvi" },
  { value: "bridal", label: "Bridal makeup", hint: "Wedding day, trial and pre-wedding events" },
  { value: "party", label: "Party & engagement", hint: "Engagement, reception, cocktail, shoots" },
  { value: "hair", label: "Hair & salon", hint: "Styling, spa, trims, colour" },
  { value: "beauty", label: "Skin & beauty", hint: "Cleanup, manicure, pedicure, membership" },
];

export const BOOKING_LOCATIONS: BookingOption[] = [
  { value: "studio", label: "At the studio", hint: "Sevoke Road, Siliguri" },
  { value: "india", label: "Elsewhere in India", hint: "We travel" },
  { value: "abroad", label: "Abroad", hint: "Destination weddings" },
];

/* --------------------------------- closing -------------------------------- */
export const CLOSING: ClosingCtaBlock = {
  id: "closing",
  type: "closing-cta",
  heading: "Your day deserves to be _unforgettable._",
  body: "Bridal dates for the season fill early — in Siliguri and away. Tell us the date and the city and we will hold your slot.",
  cta: { label: "Book your APPOINTMENT", href: "/book" },
};
