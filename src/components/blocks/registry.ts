import type { ComponentType } from "react";
import type { Block, BlockType } from "@/lib/blocks/types";

// Commerce / grid blocks — built from the Figma reference, used on inner pages
import HeaderBlock from "./HeaderBlock";
import HeroBlock from "./HeroBlock";
import CategoriesBlock from "./CategoriesBlock";
import SplitPromoBlock from "./SplitPromoBlock";
import ProductCarouselBlock from "./ProductCarouselBlock";
import FeatureRowBlock from "./FeatureRowBlock";
import OfferBlock from "./OfferBlock";
import BrandBlock from "./BrandBlock";
import BlogBlock from "./BlogBlock";
import ValuePropsBlock from "./ValuePropsBlock";
import FooterBlock from "./FooterBlock";

// Cinematic blocks — the long-form scroll narrative on the homepage
import CinematicHeroBlock from "./CinematicHeroBlock";
import ScrollSequenceBlock from "./ScrollSequenceBlock";
import StepperBlock from "./StepperBlock";
import BandBlock from "./BandBlock";
import ManifestoBlock from "./ManifestoBlock";
import MediaGridPushBlock from "./MediaGridPushBlock";
import PullQuoteBlock from "./PullQuoteBlock";
import OverflowQuoteBlock from "./OverflowQuoteBlock";
import ClosingCtaBlock from "./ClosingCtaBlock";

// Inner-page blocks — services, academy, travel, booking
import PageHeroBlock from "./PageHeroBlock";
import UspFeatureBlock from "./UspFeatureBlock";
import BrandFaceBlock from "./BrandFaceBlock";
import ServiceListBlock from "./ServiceListBlock";
import DestinationsBlock from "./DestinationsBlock";
import FaqBlock from "./FaqBlock";
import BookingFormBlock from "./BookingFormBlock";
import ContactBlock from "./ContactBlock";
import MarqueeBlock from "./MarqueeBlock";
import TextPageBlock from "./TextPageBlock";

/**
 * The single source of truth linking a stored block's `type` to the component
 * that draws it. Adding a section to the site = add a type in lib/blocks/types,
 * a component, and one line here — the CMS picks it up automatically.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BLOCK_REGISTRY: Record<BlockType, ComponentType<{ block: any }>> = {
  header: HeaderBlock,
  hero: HeroBlock,
  categories: CategoriesBlock,
  "split-promo": SplitPromoBlock,
  "product-carousel": ProductCarouselBlock,
  "feature-row": FeatureRowBlock,
  offer: OfferBlock,
  brand: BrandBlock,
  blog: BlogBlock,
  "value-props": ValuePropsBlock,
  footer: FooterBlock,

  "cinematic-hero": CinematicHeroBlock,
  "scroll-sequence": ScrollSequenceBlock,
  stepper: StepperBlock,
  band: BandBlock,
  manifesto: ManifestoBlock,
  "media-grid-push": MediaGridPushBlock,
  "pull-quote": PullQuoteBlock,
  "overflow-quote": OverflowQuoteBlock,
  "closing-cta": ClosingCtaBlock,

  "page-hero": PageHeroBlock,
  "usp-feature": UspFeatureBlock,
  "brand-face": BrandFaceBlock,
  "service-list": ServiceListBlock,
  destinations: DestinationsBlock,
  faq: FaqBlock,
  "booking-form": BookingFormBlock,
  contact: ContactBlock,
  marquee: MarqueeBlock,
  "text-page": TextPageBlock,
};

/** Human labels for the admin's "add section" menu. */
export const BLOCK_LABELS: Record<BlockType, string> = {
  header: "Header / navigation",
  hero: "Hero carousel",
  categories: "Category grid",
  "split-promo": "Split promo band",
  "product-carousel": "Product / service carousel",
  "feature-row": "Editorial + cards row",
  offer: "Offer band",
  brand: "About / brand",
  blog: "Journal grid",
  "value-props": "Value proposition strip",
  footer: "Footer",

  "cinematic-hero": "Cinematic hero (video)",
  "scroll-sequence": "Pinned scroll sequence (3D)",
  stepper: "Process stepper",
  band: "Image band",
  manifesto: "Manifesto / long copy",
  "media-grid-push": "Gallery grid",
  "pull-quote": "Founder pull quote",
  "overflow-quote": "Oversized closing quote",
  "closing-cta": "Closing call to action",

  "page-hero": "Page hero (3D scene)",
  "usp-feature": "Signature offer — Learn Makeup in 3 Days",
  "brand-face": "Brand face — Janvi Agarwal",
  "service-list": "Service list",
  destinations: "Destinations globe",
  faq: "Questions",
  "booking-form": "Booking form",
  contact: "Contact",
  marquee: "Running text band",
  "text-page": "Policy / long text",
};

/** Default fixed-header colour while each block type sits under it. */
export const HEADER_THEME: Record<BlockType, "light" | "dark"> = {
  header: "dark",
  hero: "light",
  categories: "dark",
  "split-promo": "dark",
  "product-carousel": "dark",
  "feature-row": "light",
  offer: "dark",
  brand: "dark",
  blog: "dark",
  "value-props": "dark",
  footer: "dark",

  "cinematic-hero": "light",
  "scroll-sequence": "light",
  // Starts as a small frame on cream; flips light once a photo is under the
  // header (see HEADER_FOLLOWS_MEDIA)
  stepper: "dark",
  band: "light",
  manifesto: "dark",
  "media-grid-push": "dark",
  "pull-quote": "dark",
  "overflow-quote": "dark",
  "closing-cta": "light",

  "page-hero": "light",
  "usp-feature": "light",
  "brand-face": "dark",
  "service-list": "dark",
  destinations: "light",
  faq: "dark",
  // cream form; its dark invitation panel marks itself data-header-theme="light"
  "booking-form": "dark",
  contact: "dark",
  marquee: "light",
  "text-page": "dark",
};

/**
 * Blocks whose ground changes as they scroll — for these the header goes light
 * whenever an image, video or canvas is actually beneath it, and falls back to
 * the block's theme otherwise.
 */
export const HEADER_FOLLOWS_MEDIA = new Set<BlockType>(["stepper"]);

export function isKnownBlock(block: Block) {
  return block.type in BLOCK_REGISTRY;
}
