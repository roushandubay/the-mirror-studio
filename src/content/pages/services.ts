import type { Block, FaqBlock, PageDoc, PageHeroBlock, ServiceItem } from "@/lib/blocks/types";
import { FOOTER } from "@/content/site";
import { CLOSING, PHOTO, REGIONS, TRAVEL_NOTES, USP_MARQUEE, USP_TEASER } from "@/content/shared";

/**
 * Service pages. They share one shape — hero with a live scene, the menu as
 * editorial rows, a photograph band, questions, the three-day course teaser,
 * the closing invitation — so they are built by one factory from data.
 *
 * COPY STATUS: menus are DRAFT and deliberately carry no prices. Items marked
 * "from the studio" appear on the studio's own membership card.
 */

function servicePage({
  slug,
  title,
  description,
  hero,
  heading,
  intro,
  items,
  band,
  faq,
  extra = [],
}: {
  slug: string;
  title: string;
  description: string;
  hero: Omit<PageHeroBlock, "id" | "type">;
  heading: string;
  intro: string;
  items: ServiceItem[];
  band: { image: PageHeroBlock["image"]; caption: string };
  faq: FaqBlock["items"];
  extra?: Block[];
}): PageDoc {
  return {
    slug,
    title,
    description,
    blocks: [
      { id: "hero", type: "page-hero", ...hero },
      { id: "menu", type: "service-list", eyebrow: "The menu", heading, intro, items },
      {
        id: "band",
        type: "band",
        image: { ...band.image!, fit: "contain", fitMobile: "cover" },
        caption: band.caption,
        height: 360,
        overlay: 0.3,
        parallax: 110,
      },
      ...extra,
      { id: "faq", type: "faq", eyebrow: "Good to know", heading: "Your _questions_", items: faq },
      USP_TEASER,
      USP_MARQUEE,
      CLOSING,
      FOOTER,
    ],
  };
}

const BOOK_TRAVEL_FAQ = {
  id: "travel",
  q: "Do you travel outside Siliguri?",
  a: "Yes — across India and abroad. Choose ‘Elsewhere in India’ or ‘Abroad’ on the booking form and add the city; travel and stay are quoted up front, in writing.",
};

export const bridalPage = servicePage({
  slug: "/services/bridal",
  title: "Bridal Makeup by Janvi Agarwal — THE MIRROR, Siliguri & Destination",
  description:
    "Bridal makeup and hair by Janvi Agarwal for every function — in the Siliguri studio, across India and at destination weddings abroad.",
  hero: {
    eyebrow: "Bridal",
    heading: "The bride, _unhurried._",
    body: "One conversation, a proper trial, and a face that holds from the first photograph to the last dance — in Siliguri or wherever you marry.",
    scene: "mirror",
    cta: { label: "Book a BRIDAL DATE", href: "/book?service=bridal" },
    secondaryCta: { label: "Destination weddings", href: "/destination-weddings" },
    facts: [
      { label: "Led by", value: "Janvi Agarwal" },
      { label: "Includes", value: "Trial & consultation" },
      { label: "Where", value: "Studio, India, abroad" },
      { label: "Hair", value: "Styled in-house" },
    ],
  },
  heading: "Every _function,_ ONE ARTIST.",
  intro: "Book the wedding day alone or the whole celebration. Each look is designed around the outfit, the jewellery and the light at the venue.",
  items: [
    {
      id: "b1",
      title: "Wedding day",
      description: "The bridal look with hair, draping support and touch-ups before the pheras.",
      includes: ["Makeup", "Hair", "Touch-ups"],
      image: PHOTO.finishedLook,
      bookValue: "bridal",
    },
    {
      id: "b2",
      title: "Bridal trial",
      description: "A full rehearsal of the look at the studio, adjusted until it is exactly right.",
      includes: ["Consultation", "Full trial"],
      image: PHOTO.shades,
      bookValue: "bridal",
    },
    {
      id: "b3",
      title: "Mehendi, haldi & sangeet",
      description: "Lighter, fresher looks that still photograph beautifully through a long day.",
      includes: ["Soft glam", "Hair"],
      image: PHOTO.palette,
      bookValue: "bridal",
    },
    {
      id: "b4",
      title: "Reception",
      description: "An evening look with more depth and definition, built to last under lights.",
      includes: ["Evening glam", "Hair"],
      image: PHOTO.vanity,
      bookValue: "bridal",
    },
    {
      id: "b5",
      title: "Family & bridesmaids",
      description: "Mothers, sisters and friends — looks that sit alongside the bride's without competing.",
      includes: ["Group booking"],
      image: PHOTO.blowDry,
      bookValue: "bridal",
    },
  ],
  band: { image: PHOTO.janviAtWork, caption: "a LOOK that _holds._" },
  faq: [
    {
      id: "q1",
      q: "How early should I book my bridal date?",
      a: "As early as you have a date. Wedding-season dates are booked months ahead, and a date is only held once it is confirmed on WhatsApp.",
    },
    {
      id: "q2",
      q: "Is a trial included?",
      a: "Every bridal booking begins with a consultation, and we strongly recommend a trial at the studio so nothing is decided on the day.",
    },
    BOOK_TRAVEL_FAQ,
    {
      id: "q4",
      q: "What should I bring to the trial?",
      a: "A photo of the outfit, the jewellery if you have it, and any looks you love. Come with clean, moisturised skin.",
    },
  ],
  extra: [
    {
      id: "destinations",
      type: "destinations",
      eyebrow: "Marrying away from home?",
      heading: "WE TRAVEL _with you._",
      regions: REGIONS,
      notes: TRAVEL_NOTES,
      cta: { label: "Plan a DESTINATION BOOKING", href: "/destination-weddings" },
      scene: "globe",
    },
  ],
});

export const partyPage = servicePage({
  slug: "/services/party",
  title: "Party & Engagement Makeup — THE MIRROR by Janvi Agarwal",
  description: "Engagement, reception, cocktail and photoshoot makeup and hair at THE MIRROR, Siliguri.",
  hero: {
    eyebrow: "Party & engagement",
    heading: "Walk in. _Turn heads._",
    body: "Engagements, cocktails, receptions and shoots — a look that suits the evening and lasts it.",
    scene: "particles",
    sceneWords: ["GLAM"],
    cta: { label: "Book a PARTY LOOK", href: "/book?service=party" },
    facts: [
      { label: "For", value: "Every occasion" },
      { label: "Hair", value: "Styled in-house" },
      { label: "Where", value: "Studio or venue" },
      { label: "Time", value: "Book ahead" },
    ],
  },
  heading: "Made for _the evening._",
  intro: "Tell us the occasion and the outfit; we build the look around both.",
  items: [
    { id: "p1", title: "Engagement & roka", description: "Soft, radiant and camera-ready for the ring and the portraits.", includes: ["Makeup", "Hair"], image: PHOTO.finishedLook, bookValue: "party" },
    { id: "p2", title: "Cocktail & sangeet", description: "More shine, more drama, built to move all night.", includes: ["Glam", "Lashes"], image: PHOTO.palette, bookValue: "party" },
    { id: "p3", title: "Guest of the wedding", description: "For family and friends who want to look their best without upstaging the bride.", includes: ["Makeup", "Hair"], image: PHOTO.shades, bookValue: "party" },
    { id: "p4", title: "Photoshoots", description: "Pre-wedding, maternity, portfolio — makeup that reads correctly on camera.", includes: ["HD finish"], image: PHOTO.vanity, bookValue: "party" },
  ],
  band: { image: PHOTO.palette, caption: "SHINE, _but make it last._" },
  faq: [
    { id: "q1", q: "How long does a party look take?", a: "Allow around an hour for makeup and a little more if hair is included. We will confirm timing when we speak." },
    { id: "q2", q: "Can you come to the venue?", a: "Yes. Choose where you will get ready on the booking form and we will confirm availability." },
    BOOK_TRAVEL_FAQ,
  ],
});

export const hairPage = servicePage({
  slug: "/services/hair",
  title: "Hair & Salon — THE MIRROR by Janvi Agarwal, Siliguri",
  description: "Hair styling, hair spa, trims, colour and smoothening at THE MIRROR salon on Sevoke Road, Siliguri.",
  hero: {
    eyebrow: "Hair & salon",
    heading: "Every strand _in place._",
    body: "Blow-dries and occasion styling, trims, hair spa and colour — in the calm of the studio on Sevoke Road.",
    scene: "liquid",
    cta: { label: "Book a HAIR APPOINTMENT", href: "/book?service=hair" },
  },
  heading: "The _salon_ MENU.",
  intro: "Walk-in care or a full transformation. Hair trimming and hair spa are also part of the six-month membership.",
  items: [
    { id: "h1", title: "Styling & blow-dry", description: "Soft waves, sleek finishes and occasion updos.", includes: ["Occasion", "Everyday"], image: PHOTO.blowDry, bookValue: "hair" },
    { id: "h2", title: "Hair spa", description: "A deep conditioning ritual to restore softness and shine.", includes: ["Membership"], image: PHOTO.janviAtWork, bookValue: "hair" },
    { id: "h3", title: "Hair trimming", description: "Shape, ends and a finish that grows out well.", includes: ["Membership"], image: PHOTO.vanity, bookValue: "hair" },
    { id: "h4", title: "Colour & smoothening", description: "Tones, global colour and smoothing for glossy, manageable hair.", includes: ["Consultation first"], image: PHOTO.hairColour, bookValue: "hair" },
  ],
  band: { image: PHOTO.hairColour, caption: "from THE START _to the result._" },
  faq: [
    { id: "q1", q: "Do I need an appointment for the salon?", a: "Booking ahead guarantees your slot, especially on weekends and in wedding season." },
    { id: "q2", q: "Is hair included in bridal bookings?", a: "Yes — bridal and party looks can include hair styling done in-house." },
    { id: "q3", q: "What is the membership?", a: "A six-month card that includes complimentary manicure, pedicure, hair trimming, hair spa and cleanup. It is non-transferable and cannot be combined with other offers." },
  ],
});

export const beautyPage = servicePage({
  slug: "/services/beauty",
  title: "Skin & Beauty — Manicure, Pedicure, Cleanup & Membership | THE MIRROR",
  description: "Cleanup, manicure, pedicure and the six-month membership with five complimentary services at THE MIRROR, Siliguri.",
  hero: {
    eyebrow: "Skin & beauty",
    heading: "Care that _shows._",
    body: "Cleanups, manicures and pedicures — and a six-month membership with five complimentary services.",
    scene: "particles",
    sceneWords: ["GLOW"],
    cta: { label: "Book a BEAUTY APPOINTMENT", href: "/book?service=beauty" },
    facts: [
      { label: "Membership", value: "6 months" },
      { label: "Complimentary", value: "5 services" },
      { label: "Studio", value: "Sevoke Road" },
      { label: "Hygiene", value: "Kept immaculate" },
    ],
  },
  heading: "Small RITUALS, _big difference._",
  intro: "Available individually, or all five together on the six-month membership.",
  items: [
    { id: "s1", title: "Cleanup", description: "A refreshing facial cleanup that leaves skin clear and ready for makeup.", includes: ["Membership"], image: PHOTO.vanity, bookValue: "beauty" },
    { id: "s2", title: "Manicure", description: "Shaping, cuticle care and a polished finish.", includes: ["Membership"], image: PHOTO.shades, bookValue: "beauty" },
    { id: "s3", title: "Pedicure", description: "A relaxing soak, scrub and care for tired feet.", includes: ["Membership"], image: PHOTO.pedicure, bookValue: "beauty" },
    { id: "s4", title: "Six-month membership", description: "Manicure, pedicure, hair trimming, hair spa and cleanup — complimentary for six months from purchase.", includes: ["5 services", "6 months"], image: PHOTO.membership, bookValue: "beauty" },
  ],
  band: { image: PHOTO.membership, caption: "FIVE services, _six months._" },
  faq: [
    { id: "q1", q: "How does the membership work?", a: "The card is valid for six months from the date of purchase and includes a complimentary manicure, pedicure, hair trimming, hair spa and cleanup. Prior appointment is mandatory." },
    { id: "q2", q: "Can I share my membership?", a: "The card is non-transferable, cannot be combined with other offers, and lost or damaged cards cannot be replaced." },
    { id: "q3", q: "Do I need to book ahead?", a: "Yes — every membership service requires a prior appointment." },
  ],
});

export const servicesIndexPage: PageDoc = {
  slug: "/services",
  title: "Services — Bridal, Party, Hair & Beauty | THE MIRROR by Janvi Agarwal",
  description: "Bridal and party makeup, hair and salon, skin and beauty, and the three-day makeup course at THE MIRROR, Siliguri.",
  blocks: [
    {
      id: "hero",
      type: "page-hero",
      eyebrow: "Services",
      heading: "Everything for _the face_ IN THE MIRROR.",
      body: "Bridal, party, hair and beauty — in Siliguri, across India and abroad.",
      scene: "liquid",
      height: 0.85,
      cta: { label: "Book your APPOINTMENT", href: "/book" },
    },
    {
      id: "cards",
      type: "service-list",
      layout: "cards",
      items: [
        { id: "c1", title: "Bridal _makeup_", description: "Every function, one artist — trial included.", image: PHOTO.finishedLook, href: "/services/bridal" },
        { id: "c2", title: "Party & _engagement_", description: "Engagement, cocktail, reception and shoots.", image: PHOTO.palette, href: "/services/party" },
        { id: "c3", title: "Hair & _salon_", description: "Styling, spa, trims, colour and smoothening.", image: PHOTO.blowDry, href: "/services/hair" },
        { id: "c4", title: "Skin & _beauty_", description: "Cleanup, manicure, pedicure and membership.", image: PHOTO.pedicure, href: "/services/beauty" },
      ],
    },
    USP_TEASER,
    CLOSING,
    FOOTER,
  ],
};
