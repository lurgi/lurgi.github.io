import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";
import { Client } from "@notionhq/client";

const { loadEnvConfig } = nextEnv;

const SITE_URL = "https://lurgi.github.io";
const FEED_PATH = path.join(process.cwd(), "out", "feed.xml");

const DATABASE_CONFIGS = [
  { postType: "Development", envKey: "NOTION_DATABASE_DEVELOPMENT_ID" },
  { postType: "YogaLogs", envKey: "NOTION_DATABASE_YOGA_LOGS_ID" },
  { postType: "Insights", envKey: "NOTION_DATABASE_INSIGHTS_ID" },
  { postType: "Reading", envKey: "NOTION_DATABASE_READING_ID" },
];

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getPlainText(items) {
  return (items || [])
    .map((item) => item?.plain_text || "")
    .join("")
    .trim();
}

function getTitleFromPage(page) {
  const titleProperty = page?.properties?.["이름"];
  if (!titleProperty || titleProperty.type !== "title") {
    return "";
  }

  return getPlainText(titleProperty.title);
}

function getDescriptionFromPage(page) {
  const descriptionProperty = page?.properties?.["설명"];
  if (!descriptionProperty) {
    return "";
  }

  if (descriptionProperty.type === "rich_text") {
    return getPlainText(descriptionProperty.rich_text);
  }

  if (descriptionProperty.type === "title") {
    return getPlainText(descriptionProperty.title);
  }

  return "";
}

function getDateFromPage(page) {
  const dateProperty = page?.properties?.["날짜"];
  if (
    !dateProperty ||
    dateProperty.type !== "date" ||
    !dateProperty.date?.start
  ) {
    return "";
  }

  return dateProperty.date.start;
}

function isPublicPage(page) {
  return "public_url" in page && Boolean(page.public_url);
}

function isFullPage(page) {
  return page && typeof page === "object" && "properties" in page;
}

async function queryAllPages(notionClient, databaseId) {
  const allResults = [];
  let nextCursor = undefined;

  do {
    const response = await notionClient.databases.query({
      database_id: databaseId,
      page_size: 100,
      start_cursor: nextCursor,
    });

    allResults.push(...response.results);
    nextCursor = response.has_more ? response.next_cursor : undefined;
  } while (nextCursor);

  return allResults;
}

function buildRssXml(items) {
  const itemsXml = items
    .map((item) => {
      return [
        "    <item>",
        `      <title>${escapeXml(item.title)}</title>`,
        `      <link>${escapeXml(item.link)}</link>`,
        `      <guid>${escapeXml(item.link)}</guid>`,
        `      <pubDate>${escapeXml(item.pubDate)}</pubDate>`,
        `      <description>${escapeXml(item.description)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "  <channel>",
    "    <title>Lurgi's blog</title>",
    `    <link>${SITE_URL}/</link>`,
    "    <description>사용자 경험과 비즈니스 가치를 구현하는 풀스택 웹 개발자 박정우(러기)의 블로그</description>",
    "    <language>ko-KR</language>",
    `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    itemsXml,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}

async function main() {
  loadEnvConfig(process.cwd());

  if (!process.env.NOTION_SECRET) {
    throw new Error("Missing required environment variable NOTION_SECRET.");
  }

  const notionClient = new Client({
    auth: process.env.NOTION_SECRET,
  });

  const feedItems = [];

  for (const { postType, envKey } of DATABASE_CONFIGS) {
    const databaseId = process.env[envKey];
    if (!databaseId) {
      throw new Error(`Missing required environment variable ${envKey}.`);
    }

    const pages = await queryAllPages(notionClient, databaseId);
    const publicPages = pages.filter(
      (page) => isFullPage(page) && isPublicPage(page)
    );

    for (const page of publicPages) {
      const title = getTitleFromPage(page);
      const dateStart = getDateFromPage(page);
      const parsedDate = new Date(dateStart);
      if (!title || !dateStart || Number.isNaN(parsedDate.getTime())) {
        continue;
      }

      const pageId = page.id;
      const link = `${SITE_URL}/${postType}/notion/${pageId}`;
      const description = getDescriptionFromPage(page);

      feedItems.push({
        dateValue: parsedDate.getTime(),
        title,
        link,
        description,
        pubDate: parsedDate.toUTCString(),
      });
    }
  }

  const sortedFeedItems = feedItems.sort((a, b) => b.dateValue - a.dateValue);
  const xml = buildRssXml(sortedFeedItems);

  await mkdir(path.dirname(FEED_PATH), { recursive: true });
  await writeFile(FEED_PATH, xml, "utf8");

  console.log(
    `[feed] Generated ${FEED_PATH} (${sortedFeedItems.length} items)`
  );
}

main().catch((error) => {
  console.error(`[feed] Failed to generate feed.xml: ${error.message}`);
  process.exit(1);
});
