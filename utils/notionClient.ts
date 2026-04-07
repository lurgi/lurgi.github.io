import { Client } from "@notionhq/client";
import {
  PageObjectResponse,
  PartialPageObjectResponse,
  QueryDatabaseResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { format } from "date-fns";
import { NotionAPI } from "notion-client";
import { type ExtendedRecordMap } from "notion-types";
import { DATABASE_ID, DatabaseKey } from "@/src/notion";
import {
  createNotionBuildError,
  NotionBuildError,
} from "@/utils/notionDiagnostics";

export const notionOfficialClient = new Client({
  auth: process.env.NOTION_SECRET,
});

export const notionClient = new NotionAPI({
  authToken: process.env.NOTION_TOKEN_V2,
  activeUser: process.env.NOTION_USER_ID,
  kyOptions: {
    hooks: {
      beforeRequest: [
        (request, options) => {
          const url = request.url.toString();

          if (url.includes("/api/v3/syncRecordValues")) {
            return new Request(
              url.replace(
                "/api/v3/syncRecordValues",
                "/api/v3/syncRecordValuesMain"
              ),
              options
            );
          }

          return request;
        },
      ],
    },
  },
});

type NotionRequestContext = {
  postType?: PostType;
  databaseId?: string;
  pageId?: string;
};

const databaseQueryCache = new Map<string, QueryDatabaseResponse>();
const databaseQueryPromiseCache = new Map<
  string,
  Promise<QueryDatabaseResponse>
>();
const pageMetadataCache = new Map<string, NotionPageMetadata>();
const pageMetadataPromiseCache = new Map<string, Promise<NotionPageMetadata>>();
const pageRecordMapCache = new Map<string, ExtendedRecordMap>();
const pageRecordMapPromiseCache = new Map<string, Promise<ExtendedRecordMap>>();
const pageQueryCache = new Map<string, PageWithMetadata>();
const pageQueryPromiseCache = new Map<string, Promise<PageWithMetadata>>();

export interface NotionPageMetadata {
  title: string;
  description: string | null;
  date: string;
  keywords: string | null;
  author: string | null;
  image: string | null;
}

type PageWithMetadata = {
  recordMap: ExtendedRecordMap;
  metadata: NotionPageMetadata;
};

function normalizeRecordMapTable<
  T extends Record<string, { value?: unknown; role?: string } | undefined>,
>(table: T | undefined) {
  if (!table) {
    return table;
  }

  return Object.fromEntries(
    Object.entries(table).map(([key, entry]) => {
      if (
        entry &&
        typeof entry === "object" &&
        entry.value &&
        typeof entry.value === "object" &&
        "value" in entry.value
      ) {
        const nestedEntry = entry.value as {
          value: unknown;
          role?: string;
        };

        return [
          key,
          {
            ...entry,
            ...nestedEntry,
            value: nestedEntry.value,
            role: nestedEntry.role || entry.role,
          },
        ];
      }

      return [key, entry];
    })
  ) as T;
}

function normalizeRecordMap(recordMap: ExtendedRecordMap) {
  return {
    ...recordMap,
    block: normalizeRecordMapTable(recordMap.block),
    collection: normalizeRecordMapTable(recordMap.collection),
    collection_view: normalizeRecordMapTable(recordMap.collection_view),
    notion_user: normalizeRecordMapTable(recordMap.notion_user),
  } as ExtendedRecordMap;
}

function isFullPageObjectResponse(
  page:
    | PageObjectResponse
    | PartialPageObjectResponse
    | Record<string, unknown>
    | null
    | undefined
): page is PageObjectResponse {
  return !!page && typeof page === "object" && "properties" in page;
}

function getPlainText(items: RichTextItemResponse[]) {
  const value = items.map((item) => item.plain_text).join("").trim();
  return value || null;
}

function getRichTextPropertyValue(
  page: PageObjectResponse,
  propertyName: string
) {
  const property = page.properties[propertyName];
  if (!property) {
    return null;
  }

  if (property.type === "rich_text") {
    return getPlainText(property.rich_text);
  }

  if (property.type === "title") {
    return getPlainText(property.title);
  }

  return null;
}

function getAuthorPropertyValue(page: PageObjectResponse) {
  const property = page.properties["저자"];
  if (!property) {
    return null;
  }

  if (property.type === "rich_text") {
    return getPlainText(property.rich_text);
  }

  if (property.type === "title") {
    return getPlainText(property.title);
  }

  if (property.type === "people") {
    const value = property.people
      .map((person) => ("name" in person ? person.name : null))
      .filter(Boolean)
      .join(", ")
      .trim();
    return value || null;
  }

  if (property.type === "select") {
    return property.select?.name || null;
  }

  if (property.type === "multi_select") {
    const value = property.multi_select.map((option) => option.name).join(", ");
    return value || null;
  }

  return null;
}

function getPageImage(page: PageObjectResponse) {
  if (!page.cover) {
    return null;
  }

  if (page.cover.type === "external") {
    return page.cover.external.url;
  }

  return page.cover.file.url;
}

async function getMetadataFromPage(
  page: PageObjectResponse,
  context: NotionRequestContext = {}
) {
  const titleProperty = page.properties["이름"];
  if (!titleProperty || titleProperty.type !== "title") {
    throw await createNotionBuildError({
      severity: "error",
      stage: "metadata-parse",
      message: `Missing required "이름" title property on Notion page ${page.id}.`,
      postType: context.postType,
      databaseId: context.databaseId,
      pageId: page.id,
      reason: "missing_required_title_property",
    });
  }

  const title = getPlainText(titleProperty.title);
  if (!title) {
    throw await createNotionBuildError({
      severity: "error",
      stage: "metadata-parse",
      message: `Empty "이름" title property on Notion page ${page.id}.`,
      postType: context.postType,
      databaseId: context.databaseId,
      pageId: page.id,
      reason: "empty_required_title_property",
    });
  }

  const dateProperty = page.properties["날짜"];
  if (
    !dateProperty ||
    dateProperty.type !== "date" ||
    !dateProperty.date?.start
  ) {
    throw await createNotionBuildError({
      severity: "error",
      stage: "metadata-parse",
      message: `Missing required "날짜" date property on Notion page ${page.id}.`,
      postType: context.postType,
      databaseId: context.databaseId,
      pageId: page.id,
      reason: "missing_required_date_property",
    });
  }

  return {
    title,
    description: getRichTextPropertyValue(page, "설명"),
    date: format(new Date(dateProperty.date.start), "yyyy-MM-dd"),
    keywords: getRichTextPropertyValue(page, "키워드"),
    author: getAuthorPropertyValue(page),
    image: getPageImage(page),
  } satisfies NotionPageMetadata;
}

export async function queryDatabaseWithCache(
  database_id: string,
  context: NotionRequestContext = {}
): Promise<QueryDatabaseResponse> {
  const cachedDatabaseQuery = databaseQueryCache.get(database_id);
  if (cachedDatabaseQuery) {
    return cachedDatabaseQuery;
  }

  const pendingDatabaseQuery = databaseQueryPromiseCache.get(database_id);
  if (pendingDatabaseQuery) {
    return pendingDatabaseQuery;
  }

  const databaseQueryPromise = notionOfficialClient.databases
    .query({
      database_id,
    })
    .then((result) => {
      databaseQueryCache.set(database_id, result);
      return result;
    })
    .catch(async (error) => {
      throw await createNotionBuildError({
        severity: "error",
        stage: "database-query",
        message: `Failed to query Notion database for ${context.postType || database_id}.`,
        postType: context.postType,
        databaseId: database_id,
        pageId: context.pageId,
        reason: "database_query_failed",
        cause: error,
      });
    })
    .finally(() => {
      databaseQueryPromiseCache.delete(database_id);
    });

  databaseQueryPromiseCache.set(database_id, databaseQueryPromise);
  return databaseQueryPromise;
}

async function getPageMetadataWithCache(
  pageId: string,
  context: NotionRequestContext = {}
) {
  const cachedMetadata = pageMetadataCache.get(pageId);
  if (cachedMetadata) {
    return cachedMetadata;
  }

  const pendingMetadata = pageMetadataPromiseCache.get(pageId);
  if (pendingMetadata) {
    return pendingMetadata;
  }

  const pageMetadataPromise = notionOfficialClient.pages
    .retrieve({ page_id: pageId })
    .then(async (page) => {
      if (!isFullPageObjectResponse(page)) {
        throw await createNotionBuildError({
          severity: "error",
          stage: "page-retrieve",
          message: `Received a partial Notion page response for ${pageId}.`,
          postType: context.postType,
          databaseId: context.databaseId,
          pageId,
          reason: "partial_page_response",
        });
      }

      const metadata = await getMetadataFromPage(page, {
        ...context,
        pageId,
      });
      pageMetadataCache.set(pageId, metadata);
      return metadata;
    })
    .catch(async (error) => {
      if (error instanceof NotionBuildError) {
        throw error;
      }

      throw await createNotionBuildError({
        severity: "error",
        stage: "page-retrieve",
        message: `Failed to retrieve Notion page metadata for ${pageId}.`,
        postType: context.postType,
        databaseId: context.databaseId,
        pageId,
        reason: "page_retrieve_failed",
        cause: error,
      });
    })
    .finally(() => {
      pageMetadataPromiseCache.delete(pageId);
    });

  pageMetadataPromiseCache.set(pageId, pageMetadataPromise);
  return pageMetadataPromise;
}

async function getPageRecordMapWithCache(
  pageId: string,
  context: NotionRequestContext = {}
) {
  const cachedRecordMap = pageRecordMapCache.get(pageId);
  if (cachedRecordMap) {
    return cachedRecordMap;
  }

  const pendingRecordMap = pageRecordMapPromiseCache.get(pageId);
  if (pendingRecordMap) {
    return pendingRecordMap;
  }

  const pageRecordMapPromise = notionClient
    .getPage(pageId)
    .then((recordMap) => {
      const normalizedRecordMap = normalizeRecordMap(recordMap);
      pageRecordMapCache.set(pageId, normalizedRecordMap);
      return normalizedRecordMap;
    })
    .catch(async (error) => {
      throw await createNotionBuildError({
        severity: "error",
        stage: "record-map-fetch",
        message: `Failed to fetch Notion record map for ${pageId}.`,
        postType: context.postType,
        databaseId: context.databaseId,
        pageId,
        reason: "record_map_fetch_failed",
        cause: error,
      });
    })
    .finally(() => {
      pageRecordMapPromiseCache.delete(pageId);
    });

  pageRecordMapPromiseCache.set(pageId, pageRecordMapPromise);
  return pageRecordMapPromise;
}

export async function getPageWithCache(
  pageId: string,
  context: NotionRequestContext = {}
): Promise<PageWithMetadata> {
  const cachedPage = pageQueryCache.get(pageId);
  if (cachedPage) {
    return cachedPage;
  }

  const pendingPage = pageQueryPromiseCache.get(pageId);
  if (pendingPage) {
    return pendingPage;
  }

  const pageQueryPromise = Promise.all([
    getPageRecordMapWithCache(pageId, context),
    getPageMetadataWithCache(pageId, context),
  ])
    .then(([recordMap, metadata]) => {
      const pageWithMetadata = { recordMap, metadata };
      pageQueryCache.set(pageId, pageWithMetadata);
      return pageWithMetadata;
    })
    .finally(() => {
      pageQueryPromiseCache.delete(pageId);
    });

  pageQueryPromiseCache.set(pageId, pageQueryPromise);
  return pageQueryPromise;
}

export async function getPagePreviewData(postType: PostType) {
  const databaseId = DATABASE_ID[postType as DatabaseKey];
  if (!databaseId) {
    throw await createNotionBuildError({
      severity: "error",
      stage: "env",
      message: `Missing Notion database ID for ${postType}.`,
      postType,
      reason: "missing_database_id",
    });
  }

  const notionDatabaseId = await queryDatabaseWithCache(databaseId, {
    postType,
    databaseId,
  });

  return Promise.all(
    notionDatabaseId.results
      .filter(
        (page): page is PageObjectResponse =>
          isFullPageObjectResponse(page) &&
          "public_url" in page &&
          !!page.public_url
      )
      .map(async (page) => ({
        ...(await getMetadataFromPage(page, {
          postType,
          databaseId,
          pageId: page.id,
        })),
        id: page.id,
      }))
  );
}
