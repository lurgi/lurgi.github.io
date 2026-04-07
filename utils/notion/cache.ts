import { type QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import { type ExtendedRecordMap } from "notion-types";
import { type NotionPageMetadata, type PageWithMetadata } from "./types";

export const databaseQueryCache = new Map<string, QueryDatabaseResponse>();
export const databaseQueryPromiseCache = new Map<
  string,
  Promise<QueryDatabaseResponse>
>();
export const pageMetadataCache = new Map<string, NotionPageMetadata>();
export const pageMetadataPromiseCache = new Map<
  string,
  Promise<NotionPageMetadata>
>();
export const pageRecordMapCache = new Map<string, ExtendedRecordMap>();
export const pageRecordMapPromiseCache = new Map<
  string,
  Promise<ExtendedRecordMap>
>();
export const pageQueryCache = new Map<string, PageWithMetadata>();
export const pageQueryPromiseCache = new Map<string, Promise<PageWithMetadata>>();
