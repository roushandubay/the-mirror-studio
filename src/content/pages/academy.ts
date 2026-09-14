import type { PageDoc } from "@/lib/blocks/types";
import { FOOTER } from "@/content/site";
import { CLOSING, JANVI_FACE, PHOTO, USP_FULL } from "@/content/shared";

/**
 * THE MIRROR Academy — the signature "Learn makeup in three days" course.
 * COPY STATUS: curriculum, format and certificate are DRAFT (see shared.ts).
 */
export const academyPage: PageDoc = {
  slug: "/academy",
  title: "Learn Makeup in 3 Days — THE MIRROR Academy by Janvi Agarwal",
  description:
    "A hands-on three-day makeup course taught by Janvi Agarwal at THE MIRROR, Siliguri. From skin prep to a complete party and bridal-ready look.",
  blocks: [
    {
      id: "hero",
      type: "page-hero",
      eyebrow: "THE MIRROR Academy — signature course",
      heading: "Learn makeup _in three days._",
      body: "From bare skin to a finished look you can do yourself — taught hands-on, in small batches, by Janvi Agarwal.",
      scene: "particles",
      sceneWords: ["THREE", "DAYS"],
      cta: { label: "Reserve your SEAT", href: "/book?service=academy" },
      secondaryCta: { label: "See the three days", href: "#course" },
      facts: [
        { label: "Duration", value: "3 days" },
        { label: "Format", value: "Hands-on, in studio" },
        { label: "Batch", value: "Small groups" },
        { label: "Taught by", value: "Janvi Agarwal" },
      ],
    },

    {
      ...USP_FULL,
      id: "course",
      heading: "Three days. _One complete_ SKILL.",
      body: "Every day ends with a finished face — yours or a model's — checked and corrected by Janvi before you leave.",
      secondaryCta: undefined,
    },

    {
      id: "marquee",
      type: "marquee",
      tone: "light",
      items: ["Day one _base_", "Day two _eyes_", "Day three _the look_", "Certificate _in hand_"],
      speed: 36,
    },

    {
      id: "who",
      type: "service-list",
      eyebrow: "Who it is for",
      heading: "No experience _needed._",
      intro: "The course starts from the very beginning and moves fast. Bring nothing but curiosity — the studio kit is yours to use for all three days.",
      items: [
        {
          id: "w1",
          title: "Complete beginners",
          description: "Never held a beauty blender? Perfect. Day one starts at skin.",
          includes: ["Studio kit provided", "Step-by-step"],
          image: PHOTO.palette,
          bookValue: "academy",
        },
        {
          id: "w2",
          title: "Aspiring artists",
          description: "The foundation for a career — technique, hygiene, timing and how to build a kit.",
          includes: ["Kit guidance", "Certificate"],
          image: PHOTO.janviAtWork,
          bookValue: "academy",
        },
        {
          id: "w3",
          title: "Brides & families",
          description: "Learn your own look for the mehendi, sangeet and every function you do not book an artist for.",
          includes: ["Your own face", "Event looks"],
          image: PHOTO.finishedLook,
          bookValue: "academy",
        },
        {
          id: "w4",
          title: "Salon professionals",
          description: "Add makeup to the services you already offer, with techniques built for photographs.",
          includes: ["Upskill", "Bridal-ready"],
          image: PHOTO.shades,
          bookValue: "academy",
        },
      ],
    },

    {
      ...JANVI_FACE,
      id: "teacher",
      eyebrow: "Your teacher",
      statement: "I TEACH what I _do every day._",
      body: [
        "Every academy batch is taught by Janvi Agarwal herself — the same techniques she uses on brides in her studio and at weddings across India.",
        "The class stays small so she can stand behind every chair, correct every stroke, and make sure nobody leaves unsure.",
      ],
      cta: { label: "Reserve your SEAT", href: "/book?service=academy" },
    },

    {
      id: "faq",
      type: "faq",
      eyebrow: "Before you book",
      heading: "Academy _questions_",
      items: [
        {
          id: "q1",
          q: "Can I really learn makeup in three days?",
          a: "You will learn the complete sequence — skin, base, eyes, brows, contour, lips — and finish a full look on your own by day three. Mastery comes with practice; the course gives you the method to practise correctly.",
        },
        {
          id: "q2",
          q: "Do I need my own makeup kit?",
          a: "No. The studio kit is provided for all three days. On day three we help you build a starter kit that suits your skin and budget.",
        },
        {
          id: "q3",
          q: "How big is a batch?",
          a: "Batches are kept small so Janvi can work with every student individually. Seats are confirmed in the order bookings are received.",
        },
        {
          id: "q4",
          q: "Will I get a certificate?",
          a: "Yes — every student who completes the three days receives a certificate of completion from THE MIRROR Academy.",
        },
        {
          id: "q5",
          q: "When are the next batches, and what is the fee?",
          a: "Batch dates and the course fee are shared on WhatsApp. Use the booking form, choose ‘Learn makeup in 3 days’, and we will send the upcoming dates.",
        },
      ],
    },

    {
      ...CLOSING,
      heading: "Three days from now, _you could be doing this._",
      body: "Seats in each batch are limited. Reserve yours and we will send the dates on WhatsApp.",
      cta: { label: "Reserve your SEAT", href: "/book?service=academy" },
    },
    FOOTER,
  ],
};
