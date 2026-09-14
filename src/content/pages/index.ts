import type { PageDoc } from "@/lib/blocks/types";
import { homePage } from "./home";
import { academyPage } from "./academy";
import { beautyPage, bridalPage, hairPage, partyPage, servicesIndexPage } from "./services";
import {
  bookPage,
  contactPage,
  destinationsPage,
  faqPage,
  galleryPage,
  janviPage,
  privacyPage,
  termsPage,
} from "./more";

/**
 * Every page on the site, keyed by slug. This array is the stand-in for the
 * CMS: the catch-all route asks `getPage(slug)` and renders whatever comes
 * back. Swapping this module for a Payload query is the only change needed.
 */
export const PAGES: PageDoc[] = [
  homePage,
  academyPage,
  servicesIndexPage,
  bridalPage,
  partyPage,
  hairPage,
  beautyPage,
  janviPage,
  destinationsPage,
  galleryPage,
  bookPage,
  contactPage,
  faqPage,
  termsPage,
  privacyPage,
];

const BY_SLUG = new Map(PAGES.map((p) => [p.slug, p]));

export function getPage(slug: string) {
  return BY_SLUG.get(slug);
}
