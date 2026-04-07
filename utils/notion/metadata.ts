import {
  type PageObjectResponse,
  type PartialPageObjectResponse,
  type RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { format } from "date-fns";
import { createNotionBuildError } from "@/utils/notionDiagnostics";
import { type NotionPageMetadata, type NotionRequestContext } from "./types";

export function isFullPageObjectResponse(
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

export async function getMetadataFromPage(
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
