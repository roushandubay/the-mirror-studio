import BlockRenderer from "@/components/BlockRenderer";
import FloatingActions from "@/components/FloatingActions";
import Preloader from "@/components/Preloader";
import ScrollProgress from "@/components/motion/ScrollProgress";
import { landingPage } from "@/content/landing";

/**
 * The homepage renders nothing of its own — it hands the stored block array to
 * the renderer. Swapping `landingPage` for a CMS fetch is the only change
 * needed once Payload is in place.
 *
 * Footer blocks are lifted out of <main> so the document keeps a correct
 * landmark structure however the editor reorders things. There is no header
 * block on this page: navigation lives in the hero's glass MENU pill.
 */
export default function Home() {
  const { blocks } = landingPage;
  const footer = blocks.filter((b) => b.type === "footer");
  const body = blocks.filter((b) => b.type !== "footer" && b.type !== "header");

  return (
    <>
      <Preloader line="Making every _reflection_ UNFORGETTABLE." />
      <ScrollProgress />
      <main id="content">
        <BlockRenderer blocks={body} />
      </main>
      <BlockRenderer blocks={footer} />
      <FloatingActions />
    </>
  );
}
