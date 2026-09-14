import SiteHeader from "@/components/SiteHeader";
import BlockRenderer from "@/components/BlockRenderer";
import { FOOTER } from "@/content/site";

/** A missing page still gets the full treatment — the dust spells out LOST. */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="content">
        <BlockRenderer
          blocks={[
            {
              id: "not-found",
              type: "page-hero",
              eyebrow: "404",
              heading: "This reflection _is missing._",
              body: "The page you were looking for has moved or never existed.",
              scene: "particles",
              sceneWords: ["LOST"],
              cta: { label: "Back to THE MIRROR", href: "/" },
              secondaryCta: { label: "Book an appointment", href: "/book" },
            },
          ]}
        />
      </main>
      <BlockRenderer blocks={[FOOTER]} />
    </>
  );
}
