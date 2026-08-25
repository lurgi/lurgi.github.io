import { type PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { createNotionBuildError } from "@/utils/notionDiagnostics";
import { type NotionPageIdentity, type NotionRequestContext } from "./types";

export async function getNotionPageIdentity(
  page: PageObjectResponse,
  context: NotionRequestContext = {}
): Promise<NotionPageIdentity> {
  const idProperty = page.properties["ID"];

  if (!idProperty || idProperty.type !== "unique_id") {
    throw await createNotionBuildError({
      severity: "error",
      stage: "identity-parse",
      message: `Missing required "ID" unique_id property on Notion page ${page.id}.`,
      postType: context.postType,
      databaseId: context.databaseId,
      pageId: page.id,
      reason: "missing_required_unique_id_property",
    });
  }

  const prefix = idProperty.unique_id.prefix?.trim();
  const number = idProperty.unique_id.number;

  if (!prefix || number === null || !Number.isSafeInteger(number)) {
    throw await createNotionBuildError({
      severity: "error",
      stage: "identity-parse",
      message: `Invalid "ID" unique_id value on Notion page ${page.id}.`,
      postType: context.postType,
      databaseId: context.databaseId,
      pageId: page.id,
      reason: "invalid_unique_id_value",
    });
  }

  return {
    pageId: page.id,
    uriId: `${prefix.toLowerCase()}-${number}`,
  };
}

export async function getNotionPageIdentities(
  pages: PageObjectResponse[],
  context: NotionRequestContext = {}
) {
  const identities = await Promise.all(
    pages.map((page) => getNotionPageIdentity(page, context))
  );
  const pageIdByUriId = new Map<string, string>();

  for (const identity of identities) {
    const existingPageId = pageIdByUriId.get(identity.uriId);
    if (existingPageId) {
      throw await createNotionBuildError({
        severity: "error",
        stage: "identity-parse",
        message: `Duplicate Notion URI ID "${identity.uriId}" on pages ${existingPageId} and ${identity.pageId}.`,
        postType: context.postType,
        databaseId: context.databaseId,
        pageId: identity.pageId,
        reason: "duplicate_uri_id",
      });
    }

    pageIdByUriId.set(identity.uriId, identity.pageId);
  }

  return identities;
}
