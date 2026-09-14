import type { FooterBlock, LinkRef } from "@/lib/blocks/types";

/**
 * Site-wide settings — the one document every page shares. In Payload this is
 * a Global: the admin edits navigation, contact details and the footer once and
 * every page picks it up.
 *
 * PLACEHOLDERS still waiting on the client: the phone and WhatsApp numbers
 * below are not real.
 */

export const SITE = {
  name: "THE MIRROR by Janvi Agarwal",
  shortName: "THE MIRROR",
  address: "Near Tourist Inn Hotel, Sevoke Road, Siliguri, West Bengal",
  mapHref: "https://www.google.com/maps/search/?api=1&query=THE+MIRROR+Sevoke+Road+Siliguri",
  instagram: "https://www.instagram.com/themirror_by_janviiagarwal/",
  instagramHandle: "@themirror_by_janviiagarwal",
  // PLACEHOLDER — replace with the studio's real numbers
  phone: "+91 00000 00000",
  whatsapp: "910000000000",
};

export const NAV: LinkRef[] = [
  { label: "Learn Makeup in 3 Days", href: "/academy" },
  { label: "Bridal", href: "/services/bridal" },
  { label: "Party & Engagement", href: "/services/party" },
  { label: "Hair & Salon", href: "/services/hair" },
  { label: "Skin & Beauty", href: "/services/beauty" },
  { label: "Pan India & Abroad", href: "/destination-weddings" },
  { label: "Janvi Agarwal", href: "/janvi-agarwal" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export const HEADER = {
  menuLabel: "Menu",
  cta: { label: "Book your APPOINTMENT", href: "/book" } satisfies LinkRef,
  /** the highlighted card inside the menu overlay */
  feature: {
    eyebrow: "The signature course",
    title: "Learn Makeup _in three days._",
    href: "/academy",
    cta: "See the course",
  },
};

export const FOOTER: FooterBlock = {
  id: "footer",
  type: "footer",
  watermark: { src: "/figma/footer-bg-logo.svg" },
  columns: [
    {
      id: "f1",
      heading: "How Can We Help?",
      links: [
        { label: "Book An Appointment", href: "/book" },
        { label: "Learn Makeup in 3 Days", href: "/academy" },
        { label: "Pan India & Abroad", href: "/destination-weddings" },
        { label: "Contact Us", href: "/contact" },
        { label: "FAQ", href: "/faq" },
      ],
    },
    {
      id: "f2",
      heading: "Services",
      links: [
        { label: "Bridal Makeup", href: "/services/bridal" },
        { label: "Party & Engagement", href: "/services/party" },
        { label: "Hair & Salon", href: "/services/hair" },
        { label: "Skin & Beauty", href: "/services/beauty" },
        { label: "Janvi Agarwal", href: "/janvi-agarwal" },
        { label: "Gallery", href: "/gallery" },
      ],
    },
  ],
  newsletter: {
    heading: "Keep In Touch With The Mirror",
    body: "Wedding-season dates, new services and academy batches — before anyone else.",
    placeholder: "Email Address",
    cta: "Subscribe",
    consent:
      "By submitting your email you agree to receive updates from THE MIRROR. Read our Privacy Policy.",
  },
  socials: [
    { id: "ig", label: "Instagram", href: SITE.instagram, icon: { src: "/figma/social-instagram.svg" } },
    { id: "wa", label: "WhatsApp", href: `https://wa.me/${SITE.whatsapp}`, icon: { src: "/figma/icon-call.svg" } },
  ],
  address: SITE.address,
  phone: SITE.phone,
  copyright: "2026 THE MIRROR by Janvi Agarwal. All Rights Reserved.",
  legal: [
    { label: "Booking Terms", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
};
