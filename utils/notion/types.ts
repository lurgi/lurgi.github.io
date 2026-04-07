import { type ExtendedRecordMap } from "notion-types";

export interface NotionRequestContext {
  postType?: PostType;
  databaseId?: string;
  pageId?: string;
}

export interface NotionPageMetadata {
  title: string;
  description: string | null;
  date: string;
  keywords: string | null;
  author: string | null;
  image: string | null;
}

export interface PageWithMetadata {
  recordMap: ExtendedRecordMap;
  metadata: NotionPageMetadata;
}
