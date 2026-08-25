import { type Block, type ExtendedRecordMap } from "notion-types";
import { defaultMapImageUrl, getBlockValue } from "notion-utils";

type MapImageUrl = (
  url: string | undefined,
  block: Block
) => string | undefined;

function getRenderedImageSource(recordMap: ExtendedRecordMap, block: Block) {
  const sourceProperty =
    "properties" in block ? block.properties?.source?.[0]?.[0] : undefined;
  let source = recordMap.signed_urls?.[block.id] || sourceProperty;

  if (!source) {
    return undefined;
  }

  if (!source.includes(".gif") && source.includes("file.notion.so")) {
    source = sourceProperty;
  }

  if (!source) {
    return undefined;
  }

  if (block.space_id) {
    const url = new URL(source);
    url.searchParams.set("spaceId", block.space_id);
    source = url.toString();
  }

  return source;
}

export function getNotionImageAspectRatios(
  recordMap: ExtendedRecordMap,
  mapImageUrl: MapImageUrl = defaultMapImageUrl
) {
  const aspectRatios = new Map<string, number>();

  for (const entry of Object.values(recordMap.block)) {
    const block = getBlockValue(entry);

    if (!block || block.type !== "image") {
      continue;
    }

    const notionAspectRatio = block.format?.block_aspect_ratio;

    if (
      typeof notionAspectRatio !== "number" ||
      !Number.isFinite(notionAspectRatio) ||
      notionAspectRatio <= 0
    ) {
      continue;
    }

    const source = getRenderedImageSource(recordMap, block);
    const renderedUrl = source ? mapImageUrl(source, block) : undefined;

    if (renderedUrl) {
      // Notion stores height / width; CSS aspect-ratio expects width / height.
      aspectRatios.set(renderedUrl, 1 / notionAspectRatio);
    }
  }

  return aspectRatios;
}
