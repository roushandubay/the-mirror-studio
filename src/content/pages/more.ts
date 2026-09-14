import type { PageDoc } from "@/lib/blocks/types";
import { FOOTER, SITE } from "@/content/site";
import {
  BOOKING_LOCATIONS,
  BOOKING_SERVICES,
  CLOSING,
  GALLERY_ITEMS,
  JANVI_FACE,
  PHOTO,
  REGIONS,
  TRAVEL_NOTES,
  USP_MARQUEE,
  USP_TEASER,
} from "@/content/shared";

/** Janvi Agarwal — the face of the brand. */
export const janviPage: PageDoc = {
  slug: "/janvi-agarwal",
  title: "Janvi Agarwal — Makeup Artist & Founder of THE MIRROR, Siliguri",
  description:
    "Meet Janvi Agarwal, founder and lead artist of THE MIRROR — bridal makeup in Siliguri, across India and abroad, and teacher of the three-day makeup course.",
  blocks: [
    {
      id: "hero",
      type: "page-hero",
      eyebrow: "Founder & lead artist",
      heading: "JANVI _Agarwal._",
      body: "The artist behind THE MIRROR — and the teacher behind every academy batch.",
      scene: "particles",
      sceneWords: ["JANVI", "AGARWAL"],
      cta: { label: "Book with JANVI", href: "/book" },
      secondaryCta: { label: "Learn from Janvi", href: "/academy" },
    },
    { ...JANVI_FACE, eyebrow: "The face of THE MIRROR", cta: { label: "Book with JANVI", href: "/book" } },
    {
      id: "philosophy",
      type: "manifesto",
      heading: "a FACE, _not a mask._",
      lead: "Skin first. Nothing heavier than it needs to be.",
      body: [
        "Janvi's approach begins with the skin and the person — how you want to feel, what you will wear, where the light will fall — and only then the products.",
        "It is why THE MIRROR looks hold through an Indian wedding day and still look like the bride in every photograph.",
        "And it is why she teaches: so more women can do the same for themselves, in three days.",
      ],
      cta: { label: "Learn in 3 DAYS", href: "/academy" },
    },
    {
      id: "process",
      type: "stepper",
      heading: "HOW SHE _works_",
      scrollLength: 3,
      transition: { style: "slide-up", drift: 70, overscan: 1.06, travel: 0.55 },
      steps: [
        { id: "p1", label: "01 — Listen", segment: "She LISTENS _first,_", image: { ...PHOTO.janviAtWork, fit: "contain", fitMobile: "cover" } },
        { id: "p2", label: "02 — Choose", segment: "chooses EVERY _shade,_", image: { ...PHOTO.shades, fit: "contain", fitMobile: "cover" } },
        { id: "p3", label: "03 — Build", segment: "builds THE _look,_", image: { ...PHOTO.palette, fit: "contain", fitMobile: "cover" } },
        { id: "p4", label: "04 — Reveal", segment: "and HANDS YOU _the mirror._", image: { ...PHOTO.finishedLook, fit: "contain", fitMobile: "cover" } },
      ],
    },
    {
      id: "gallery",
      type: "media-grid-push",
      cta: { label: "See the GALLERY", href: "/gallery" },
      motion: { columns: 5, columnsMobile: 2, drift: 120, rise: 44, stagger: 0.07, aspect: "9 / 16" },
      items: GALLERY_ITEMS.slice(0, 10),
    },
    USP_TEASER,
    CLOSING,
    FOOTER,
  ],
};

/** Pan India & abroad. */
export const destinationsPage: PageDoc = {
  slug: "/destination-weddings",
  title: "Destination Wedding Makeup — Pan India & Abroad | THE MIRROR by Janvi Agarwal",
  description:
    "Janvi Agarwal and the THE MIRROR team travel for bridal makeup and hair across India and abroad — Delhi, Udaipur, Goa, Dubai, Bali, London and more.",
  blocks: [
    {
      id: "hero",
      type: "page-hero",
      eyebrow: "Pan India & abroad",
      heading: "From SILIGURI _to anywhere._",
      body: "Wherever you are getting married, the studio comes with you — the artist, the kit and the same unhurried care.",
      scene: "particles",
      sceneWords: ["INDIA", "ABROAD"],
      cta: { label: "Check my DATE", href: "/book?service=bridal" },
      secondaryCta: { label: "How it works", href: "#where" },
      facts: [
        { label: "Home studio", value: "Siliguri" },
        { label: "Travels", value: "Across India" },
        { label: "And", value: "Overseas" },
        { label: "Quote", value: "Up front, in writing" },
      ],
    },
    {
      id: "where",
      type: "destinations",
      eyebrow: "Where we go",
      heading: "WE TRAVEL _with you._",
      body: "Tell us the city. If it is not on this list, ask — these are simply the places brides most often call us to.",
      regions: REGIONS,
      notes: TRAVEL_NOTES,
      cta: { label: "Check my DATE", href: "/book?service=bridal" },
      scene: "globe",
    },
    {
      id: "packages",
      type: "service-list",
      eyebrow: "What travels",
      heading: "The whole _celebration_",
      intro: "Book one function or the full wedding. Every destination booking is quoted as one clear package before you confirm.",
      items: [
        { id: "t1", title: "Bride only", description: "Wedding-day makeup and hair, with the artist staying through the key moments.", includes: ["Makeup", "Hair"], image: PHOTO.finishedLook, bookValue: "bridal" },
        { id: "t2", title: "All functions", description: "Mehendi to reception, a considered look for every event.", includes: ["Multi-day"], image: PHOTO.palette, bookValue: "bridal" },
        { id: "t3", title: "Bride & family", description: "An artist team for the bride, mothers, sisters and bridesmaids.", includes: ["Team"], image: PHOTO.blowDry, bookValue: "bridal" },
        { id: "t4", title: "Trial before travel", description: "At the Siliguri studio, or on a video consultation for brides abroad.", includes: ["Studio or video"], image: PHOTO.shades, bookValue: "bridal" },
      ],
    },
    USP_MARQUEE,
    {
      id: "faq",
      type: "faq",
      eyebrow: "Travel",
      heading: "Destination _questions_",
      items: [
        { id: "q1", q: "How far ahead should I book a destination wedding?", a: "As soon as the date and city are fixed. Travel days block the artist's calendar on either side of the wedding." },
        { id: "q2", q: "Who pays for travel and stay?", a: "Travel and accommodation for the team are added to the service and quoted in writing before you confirm — no surprises later." },
        { id: "q3", q: "Can I have a trial if I live abroad?", a: "Yes. We do a detailed video consultation, or a trial at the Siliguri studio if you are visiting before the wedding." },
        { id: "q4", q: "Do you bring everything?", a: "The artist travels with the full kit, lighting and hair tools. You only need a well-lit space near a mirror." },
      ],
    },
    CLOSING,
    FOOTER,
  ],
};

export const galleryPage: PageDoc = {
  slug: "/gallery",
  title: "Gallery — Bridal, Party & Salon Work | THE MIRROR by Janvi Agarwal",
  description: "Looks, hair and moments from THE MIRROR studio in Siliguri.",
  blocks: [
    {
      id: "hero",
      type: "page-hero",
      eyebrow: "Gallery",
      heading: "Every face, _a story._",
      body: "Looks, hair and moments from the studio on Sevoke Road. More every week on Instagram.",
      scene: "liquid",
      height: 0.8,
      cta: { label: "Follow on INSTAGRAM", href: SITE.instagram },
    },
    {
      id: "grid",
      type: "media-grid-push",
      cta: { label: "Book your LOOK", href: "/book" },
      motion: { columns: 4, columnsMobile: 2, drift: 160, rise: 50, stagger: 0.06, aspect: "9 / 16" },
      items: [...GALLERY_ITEMS, PHOTO.finishedLook, PHOTO.janvi],
    },
    USP_MARQUEE,
    USP_TEASER,
    CLOSING,
    FOOTER,
  ],
};

export const bookPage: PageDoc = {
  slug: "/book",
  title: "Book an Appointment — THE MIRROR by Janvi Agarwal",
  description: "Book bridal, party, hair or beauty — or reserve a seat on the three-day makeup course. Three quick questions.",
  blocks: [
    {
      id: "booking",
      type: "booking-form",
      heading: "Let's _book you in._",
      intro: "Three quick questions. We confirm everything else with you personally on WhatsApp.",
      services: BOOKING_SERVICES,
      locations: BOOKING_LOCATIONS,
      whatsapp: SITE.whatsapp,
      successHeading: "One tap to send.",
      successBody:
        "Your request is written and ready. Send it on WhatsApp and the studio will reply to confirm availability — your date is held once we confirm.",
      assurances: [
        "Takes under a minute",
        "No payment to request a date",
        "Siliguri studio, across India & abroad",
        "Replies from the studio on WhatsApp",
      ],
    },
    FOOTER,
  ],
};

export const contactPage: PageDoc = {
  slug: "/contact",
  title: "Contact THE MIRROR — Sevoke Road, Siliguri",
  description: "Visit, call or message THE MIRROR by Janvi Agarwal — near Tourist Inn Hotel, Sevoke Road, Siliguri.",
  blocks: [
    {
      id: "contact",
      type: "contact",
      heading: "Come _say hello._",
      intro: "The quickest way to reach the studio is WhatsApp. For bookings, the booking form takes less than a minute.",
      channels: [
        { id: "c1", label: "Book", value: "Book an appointment", href: "/book" },
        { id: "c2", label: "WhatsApp", value: SITE.phone, href: `https://wa.me/${SITE.whatsapp}` },
        { id: "c3", label: "Call", value: SITE.phone, href: `tel:${SITE.phone.replace(/[^+\d]/g, "")}` },
        { id: "c4", label: "Instagram", value: SITE.instagramHandle, href: SITE.instagram },
      ],
      // PLACEHOLDER hours — confirm with the studio
      hours: [
        { id: "h1", days: "Monday – Sunday", time: "By appointment" },
        { id: "h2", days: "Bridal & destination", time: "On request" },
      ],
      address: SITE.address,
      mapHref: SITE.mapHref,
      image: PHOTO.signage,
    },
    USP_TEASER,
    FOOTER,
  ],
};

export const faqPage: PageDoc = {
  slug: "/faq",
  title: "FAQ — Booking, Academy & Travel | THE MIRROR by Janvi Agarwal",
  description: "Answers about booking, the three-day makeup course, destination weddings and the salon membership.",
  blocks: [
    {
      id: "hero",
      type: "page-hero",
      eyebrow: "Questions",
      heading: "Ask _us anything._",
      scene: "liquid",
      height: 0.7,
    },
    {
      id: "booking",
      type: "faq",
      eyebrow: "Booking",
      heading: "Booking",
      items: [
        { id: "b1", q: "How do I book?", a: "Use the booking form — three questions — and send the request on WhatsApp. The studio replies to confirm availability." },
        { id: "b2", q: "When is my date confirmed?", a: "Once the studio confirms on WhatsApp. Until then, a request does not hold the date." },
        { id: "b3", q: "Can I change my date?", a: "Rescheduling depends on availability. Tell us as early as possible and we will do our best." },
      ],
    },
    {
      id: "academy",
      type: "faq",
      eyebrow: "Academy",
      heading: "Learn in _3 days_",
      items: [
        { id: "a1", q: "Do I need any experience?", a: "None. The course begins with skin and moves step by step to a complete look." },
        { id: "a2", q: "Is the kit provided?", a: "Yes, for all three days. We also help you plan a starter kit of your own." },
        { id: "a3", q: "How do I find batch dates?", a: "Choose ‘Learn makeup in 3 days’ on the booking form and we will send the upcoming dates and fee." },
      ],
    },
    {
      id: "travel",
      type: "faq",
      eyebrow: "Travel",
      heading: "Pan India _& abroad_",
      items: [
        { id: "t1", q: "Where do you travel?", a: "Anywhere in India and overseas — Dubai, Bangkok, Bali, Singapore, London and beyond. Ask for any city." },
        { id: "t2", q: "How are travel costs handled?", a: "Travel and stay for the team are quoted up front, in writing, together with the service." },
      ],
    },
    USP_TEASER,
    FOOTER,
  ],
};

/**
 * Policy pages. DRAFT — written from the studio's own membership terms and
 * standard booking practice. Must be reviewed by the studio (and ideally a
 * lawyer) before launch.
 */
export const termsPage: PageDoc = {
  slug: "/terms",
  title: "Booking Terms — THE MIRROR by Janvi Agarwal",
  blocks: [
    {
      id: "terms",
      type: "text-page",
      heading: "Booking terms",
      updated: "Draft — pending review by the studio",
      sections: [
        {
          id: "requests",
          heading: "Requests and confirmation",
          paragraphs: [
            "Submitting the booking form prepares a request that you send to the studio on WhatsApp. A request does not reserve a date.",
            "A booking is confirmed only when THE MIRROR confirms it with you directly, including any advance payment agreed at that time.",
          ],
        },
        {
          id: "travel",
          heading: "Bookings outside Siliguri",
          paragraphs: [
            "For bookings elsewhere in India or abroad, travel, accommodation and related costs for the team are quoted in writing before confirmation and are payable in addition to the service.",
          ],
        },
        {
          id: "changes",
          heading: "Rescheduling",
          paragraphs: [
            "Requests to change a confirmed date are accommodated subject to availability. Please tell us as early as possible.",
          ],
        },
        {
          id: "academy",
          heading: "Academy",
          paragraphs: [
            "An academy seat is confirmed once the studio confirms your batch. Batch dates and fees are shared directly at the time of booking.",
          ],
        },
        {
          id: "membership",
          heading: "Membership card",
          paragraphs: [
            "The membership card is valid for six months from the date of purchase. Prior appointment is mandatory.",
            "The card is non-transferable, cannot be combined with any other discount or promotion, and lost or damaged cards cannot be replaced.",
          ],
        },
      ],
    },
    FOOTER,
  ],
};

export const privacyPage: PageDoc = {
  slug: "/privacy",
  title: "Privacy Policy — THE MIRROR by Janvi Agarwal",
  blocks: [
    {
      id: "privacy",
      type: "text-page",
      heading: "Privacy policy",
      updated: "Draft — pending review by the studio",
      sections: [
        {
          id: "collect",
          heading: "What we collect",
          paragraphs: [
            "The booking form asks for the service, date, location, your name and a WhatsApp number. These details are assembled in your browser and only reach us when you choose to send them on WhatsApp.",
            "If you subscribe to updates, we keep your email address.",
          ],
        },
        {
          id: "use",
          heading: "How we use it",
          paragraphs: [
            "Only to respond to your booking, confirm appointments, and — if you subscribed — to send studio news. We do not sell or share your details.",
          ],
        },
        {
          id: "whatsapp",
          heading: "WhatsApp",
          paragraphs: [
            "Messages sent to the studio on WhatsApp are also subject to WhatsApp's own privacy policy.",
          ],
        },
        {
          id: "contact",
          heading: "Contact",
          paragraphs: [
            `To see or remove the details we hold about you, message the studio or visit us at ${SITE.address}.`,
          ],
        },
      ],
    },
    FOOTER,
  ],
};
