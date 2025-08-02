import { Client } from "@notionhq/client";
import { PageObjectResponse, QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import { NotionAPI } from "notion-client";
import { type ExtendedRecordMap } from "notion-types";
import { getPageImageUrls, getPageProperty, getPageTitle } from "notion-utils";
import { format } from "date-fns";
import { DATABASE_ID, DatabaseKey } from "@/src/notion";

export const notionOfficialClient = new Client({
  auth: process.env.NOTION_SECRET,
});

export const notionClient = new NotionAPI({
  authToken: process.env.NOTION_TOKEN_V2,
  activeUser: process.env.NOTION_USER_ID,
});

/* database에 따른 각 페이지 id를 가져오는 함수*/
const databaseQueryCache = new Map();

export async function queryDatabaseWithCache(database_id: string): Promise<QueryDatabaseResponse> {
  if (databaseQueryCache.has(database_id)) {
    return databaseQueryCache.get(database_id);
  }

  const result = await notionOfficialClient.databases.query({
    database_id,
  });

  databaseQueryCache.set(database_id, result);
  return result;
}

/* 개별 페이지에 대한 RecordMap과 Metadata를 가져오는 함수*/
export interface NotionPageMetadata {
  title: string;
  description: string | null;
  date: string;
  keywords: string | null;
  author: string | null;
}
const pageQueryCache = new Map();

export async function getPageWithCache(pageId: string): Promise<{
  recordMap: ExtendedRecordMap;
  metadata: NotionPageMetadata;
}> {
  if (pageQueryCache.has(pageId)) {
    return pageQueryCache.get(pageId);
  }

  const recordMap = await notionClient.getPage(pageId);
  pageQueryCache.set(pageId, { recordMap, metadata: getMetadata({ recordMap, pageId }) });
  return { recordMap, metadata: getMetadata({ recordMap, pageId }) };
}

function getMetadata({ recordMap, pageId }: { recordMap: ExtendedRecordMap; pageId: string }) {
  const title = getPageTitle(recordMap);
  const description = getPageProperty("설명", recordMap.block[pageId]?.value, recordMap);
  const date = format(new Date(getPageProperty("날짜", recordMap.block[pageId]?.value, recordMap)), "yyyy-MM-dd");
  const keywords = getPageProperty("키워드", recordMap.block[pageId]?.value, recordMap);
  const author = getPageProperty("저자", recordMap.block[pageId]?.value, recordMap);
  const image = getImageUrl(recordMap);

  return {
    title,
    description,
    date,
    keywords,
    author,
    image,
  } as NotionPageMetadata;
}

export async function getPagePreviewData(postType: PostType) {
  const notionDatabaseId = await queryDatabaseWithCache(DATABASE_ID[postType as DatabaseKey]);
  if (!notionDatabaseId) return;
  const dbIds = notionDatabaseId.results
    .filter((page): page is PageObjectResponse => "public_url" in page && !!page.public_url)
    .map((page) => page.id);
  const metadataList = await Promise.all(
    dbIds.map(async (id) => {
      const res = await getPageWithCache(id);
      return { ...res.metadata, id };
    })
  );

  return metadataList;
}

function getImageUrl(recordMap: ExtendedRecordMap) {
  const image = getPageImageUrls(recordMap, {
    mapImageUrl: (url, block) => `https://www.notion.so/image/${url}?table=block&id=${block.id}&cache=v2`,
  })[0];
  return image || null;
}
