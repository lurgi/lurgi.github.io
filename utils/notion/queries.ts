import {
  type PageObjectResponse,
  type QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { DATABASE_ID, DatabaseKey } from "@/src/notion";
import {
  createNotionBuildError,
  NotionBuildError,
} from "@/utils/notionDiagnostics";
import { notionClient, notionOfficialClient } from "./clients";
import {
  databaseQueryCache,
  databaseQueryPromiseCache,
  pageMetadataCache,
  pageMetadataPromiseCache,
  pageQueryCache,
  pageQueryPromiseCache,
  pageRecordMapCache,
  pageRecordMapPromiseCache,
} from "./cache";
import {
  getMetadataFromPage,
  isFullPageObjectResponse,
} from "./metadata";
import { normalizeRecordMap } from "./recordMap";
import { type NotionRequestContext, type PageWithMetadata } from "./types";

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
