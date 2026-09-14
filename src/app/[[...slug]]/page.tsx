import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlockRenderer from "@/components/BlockRenderer";
import FloatingActions from "@/components/FloatingActions";
import Preloader from "@/components/Preloader";
import SiteHeader from "@/components/SiteHeader";
import ScrollProgress from "@/components/motion/ScrollProgress";
import { getPage, PAGES } from "@/content/pages";
import { SITE } from "@/content/site";

/**
 * One route renders every page. It contains no layout of its own: it looks up
 * the stored PageDoc for the URL and hands its block array to the renderer.
 * Swapping `getPage` for a CMS query is the only change needed once Payload
 * is in place.
 *
 * Footer blocks are lifted out of <main> so the document keeps a correct
 * landmark structure however the editor reorders things.
 */

type Props = { params: Promise<{ slug?: string[] }> };

const toSlug = (parts?: string[]) => `/${(parts ?? []).join("/")}`;

// Every page is known at build time; anything else is a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return PAGES.map((p) => ({ slug: p.slug === "/" ? [] : p.slug.slice(1).split("/") }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getPage(toSlug((await params).slug));
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.slug },
    openGraph: {
      title: page.title,
      description: page.description,
      siteName: SITE.name,
      locale: "en_IN",
      type: "website",
    },
  };
}

export default async function Page({ params }: Props) {
  const page = getPage(toSlug((await params).slug));
  if (!page) notFound();

  const footer = page.blocks.filter((b) => b.type === "footer");
  const body = page.blocks.filter((b) => b.type !== "footer" && b.type !== "header");

  return (
    <>
      {page.preloader && <Preloader line={page.preloader} />}
      <ScrollProgress />
      <SiteHeader home={page.slug === "/"} delay={page.headerDelay} />
      <main id="content">
        <BlockRenderer blocks={body} />
      </main>
      <BlockRenderer blocks={footer} />
      <FloatingActions whatsapp={SITE.whatsapp} />
    </>
  );
}
