import { BLOCK_REGISTRY, HEADER_FOLLOWS_MEDIA, HEADER_THEME } from "@/components/blocks/registry";
import type { Block } from "@/lib/blocks/types";

/**
 * Walks the stored block array and draws each one. Unknown types are skipped
 * rather than thrown on, so a page authored against a newer schema still
 * renders everything this build understands.
 */
export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block) => {
        if (block.hidden) return null;
        const Component = BLOCK_REGISTRY[block.type];
        if (!Component) {
          if (process.env.NODE_ENV !== "production") {
            console.warn(`[BlockRenderer] no component registered for "${block.type}"`);
          }
          return null;
        }
        // The wrapper is a plain block box so the fixed header can hit-test
        // which theme sits beneath it. It adds no styling, so sticky pins inside
        // the block still resolve against the block's own root.
        return (
          <div
            key={block.id}
            data-header-theme={block.headerTheme ?? HEADER_THEME[block.type]}
            data-header-media={HEADER_FOLLOWS_MEDIA.has(block.type) ? "" : undefined}
          >
            <Component block={block} />
          </div>
        );
      })}
    </>
  );
}
