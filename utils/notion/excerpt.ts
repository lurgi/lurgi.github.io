import { getTextContent } from "notion-utils";
import {
  type Block,
  type BlockType,
  type Decoration,
  type ExtendedRecordMap,
  type ID,
} from "notion-types";

const DEFAULT_EXCERPT_MAX_LENGTH = 150;

const EXCERPT_BLOCK_TYPES = new Set<BlockType>([
  "text",
  "bulleted_list",
  "numbered_list",
  "quote",
  "callout",
  "toggle",
  "to_do",
  "header",
  "sub_header",
  "sub_sub_header",
]);

interface GetExcerptFromRecordMapOptions {
  maxLength?: number;
}

function getBlock(recordMap: ExtendedRecordMap, blockId: ID) {
  return recordMap.block[blockId]?.value || null;
}

function getRootPageBlock(recordMap: ExtendedRecordMap) {
  const firstBlockId = Object.keys(recordMap.block)[0];
  if (!firstBlockId) {
    return null;
  }

  return getBlock(recordMap, firstBlockId);
}

function hasTitleProperty(
  block: Block
): block is Block & { properties: { title: Decoration[] } } {
  return Array.isArray(
    (block.properties as { title?: unknown } | undefined)?.title
  );
}

function normalizeExcerptText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function truncateExcerpt(text: string, maxLength: number) {
  const characters = Array.from(text);
  if (characters.length <= maxLength) {
    return text;
  }

  return characters.slice(0, maxLength).join("");
}

export function getExcerptFromRecordMap(
  recordMap: ExtendedRecordMap,
  {
    maxLength = DEFAULT_EXCERPT_MAX_LENGTH,
  }: GetExcerptFromRecordMapOptions = {}
) {
  const rootPageBlock = getRootPageBlock(recordMap);
  const contentBlockIds = rootPageBlock?.content || [];

  const text = contentBlockIds
    .map((blockId) => getBlock(recordMap, blockId))
    .filter(
      (block): block is Block =>
        !!block &&
        EXCERPT_BLOCK_TYPES.has(block.type) &&
        hasTitleProperty(block)
    )
    .map((block) => getTextContent(block.properties.title))
    .join(" ");

  const normalizedText = normalizeExcerptText(text);
  if (!normalizedText) {
    return null;
  }

  return truncateExcerpt(normalizedText, maxLength);
}
