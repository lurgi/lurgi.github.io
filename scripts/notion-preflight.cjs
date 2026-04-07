const { appendFile, mkdir } = require("node:fs/promises");
const path = require("node:path");
const { loadEnvConfig } = require("@next/env");
const { Client } = require("@notionhq/client");
const { NotionAPI } = require("notion-client");

const DIAGNOSTICS_PATH = path.join(
  process.cwd(),
  ".artifacts",
  "notion-diagnostics.ndjson"
);

const DATABASE_CONFIGS = [
  { postType: "Development", envKey: "NOTION_DATABASE_DEVELOPMENT_ID" },
  { postType: "YogaLogs", envKey: "NOTION_DATABASE_YOGA_LOGS_ID" },
  { postType: "Insights", envKey: "NOTION_DATABASE_INSIGHTS_ID" },
  { postType: "Reading", envKey: "NOTION_DATABASE_READING_ID" },
];

function getDiagnosticCause(cause) {
  if (!cause) {
    return undefined;
  }

  if (cause instanceof Error) {
    return cause.stack || `${cause.name}: ${cause.message}`;
  }

  return String(cause);
}

async function recordDiagnostic(diagnostic) {
  const message = JSON.stringify({ scope: "notion", ...diagnostic });

  if (diagnostic.severity === "error") {
    console.error(message);
  } else {
    console.log(message);
  }

  await mkdir(path.dirname(DIAGNOSTICS_PATH), { recursive: true });
  await appendFile(DIAGNOSTICS_PATH, `${message}\n`, "utf8");
}

async function failPreflight({
  stage,
  message,
  reason,
  postType,
  databaseId,
  pageId,
  cause,
}) {
  const diagnostic = {
    severity: "error",
    stage,
    message,
    reason,
    postType,
    databaseId,
    pageId,
    cause: getDiagnosticCause(cause),
    timestamp: new Date().toISOString(),
  };

  await recordDiagnostic(diagnostic);
  const error = new Error(message);
  error.diagnostic = diagnostic;
  throw error;
}

function getPlainText(items) {
  const value = (items || []).map((item) => item.plain_text).join("").trim();
  return value || null;
}

function normalizeRecordMapTable(table) {
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
        return [
          key,
          {
            ...entry,
            ...entry.value,
            value: entry.value.value,
            role: entry.value.role || entry.role,
          },
        ];
      }

      return [key, entry];
    })
  );
}

function normalizeRecordMap(recordMap) {
  return {
    ...recordMap,
    block: normalizeRecordMapTable(recordMap.block),
    collection: normalizeRecordMapTable(recordMap.collection),
    collection_view: normalizeRecordMapTable(recordMap.collection_view),
    notion_user: normalizeRecordMapTable(recordMap.notion_user),
    comment: normalizeRecordMapTable(recordMap.comment),
    discussion: normalizeRecordMapTable(recordMap.discussion),
  };
}

async function validatePageProperties(page, { postType, databaseId }) {
  const titleProperty = page.properties["이름"];
  if (!titleProperty || titleProperty.type !== "title") {
    await failPreflight({
      stage: "metadata-parse",
      message: `Missing required "이름" title property on Notion page ${page.id}.`,
      reason: "missing_required_title_property",
      postType,
      databaseId,
      pageId: page.id,
    });
  }

  if (!getPlainText(titleProperty.title)) {
    await failPreflight({
      stage: "metadata-parse",
      message: `Empty "이름" title property on Notion page ${page.id}.`,
      reason: "empty_required_title_property",
      postType,
      databaseId,
      pageId: page.id,
    });
  }

  const dateProperty = page.properties["날짜"];
  if (!dateProperty || dateProperty.type !== "date" || !dateProperty.date?.start) {
    await failPreflight({
      stage: "metadata-parse",
      message: `Missing required "날짜" date property on Notion page ${page.id}.`,
      reason: "missing_required_date_property",
      postType,
      databaseId,
      pageId: page.id,
    });
  }
}

async function main() {
  loadEnvConfig(process.cwd());

  const requiredEnvKeys = [
    "NOTION_SECRET",
    "NOTION_TOKEN_V2",
    "NOTION_USER_ID",
    ...DATABASE_CONFIGS.map(({ envKey }) => envKey),
  ];

  for (const envKey of requiredEnvKeys) {
    if (!process.env[envKey]) {
      await failPreflight({
        stage: "env",
        message: `Missing required environment variable ${envKey}.`,
        reason: "missing_environment_variable",
      });
    }
  }

  const notionOfficialClient = new Client({
    auth: process.env.NOTION_SECRET,
  });
  const notionClient = new NotionAPI({
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

  for (const { postType, envKey } of DATABASE_CONFIGS) {
    const databaseId = process.env[envKey];

    let response;
    try {
      response = await notionOfficialClient.databases.query({
        database_id: databaseId,
        page_size: 20,
      });
    } catch (cause) {
      await failPreflight({
        stage: "database-query",
        message: `Failed to query Notion database for ${postType}.`,
        reason: "database_query_failed",
        postType,
        databaseId,
        cause,
      });
    }

    const publicPages = response.results.filter(
      (page) => "properties" in page && "public_url" in page && page.public_url
    );

    if (publicPages.length === 0) {
      await recordDiagnostic({
        severity: "info",
        stage: "preflight",
        message: `No public Notion pages found for ${postType}. Skipping representative page fetch.`,
        postType,
        databaseId,
        timestamp: new Date().toISOString(),
      });
      continue;
    }

    const representativePage = publicPages[0];
    let fullPage;
    try {
      fullPage = await notionOfficialClient.pages.retrieve({
        page_id: representativePage.id,
      });
    } catch (cause) {
      await failPreflight({
        stage: "page-retrieve",
        message: `Failed to retrieve Notion page metadata for representative ${postType} page ${representativePage.id}.`,
        reason: "page_retrieve_failed",
        postType,
        databaseId,
        pageId: representativePage.id,
        cause,
      });
    }

    if (!fullPage || !("properties" in fullPage)) {
      await failPreflight({
        stage: "page-retrieve",
        message: `Received a partial Notion page response for representative ${postType} page ${representativePage.id}.`,
        reason: "partial_page_response",
        postType,
        databaseId,
        pageId: representativePage.id,
      });
    }

    await validatePageProperties(fullPage, { postType, databaseId });

    try {
      const recordMap = normalizeRecordMap(
        await notionClient.getPage(representativePage.id)
      );

      if (!recordMap.block?.[representativePage.id]?.value?.id) {
        await failPreflight({
          stage: "record-map-fetch",
          message: `Normalized Notion record map is missing the root page block for representative ${postType} page ${representativePage.id}.`,
          reason: "invalid_record_map_shape",
          postType,
          databaseId,
          pageId: representativePage.id,
        });
      }
    } catch (cause) {
      await failPreflight({
        stage: "record-map-fetch",
        message: `Failed to fetch Notion record map for representative ${postType} page ${representativePage.id}.`,
        reason: "record_map_fetch_failed",
        postType,
        databaseId,
        pageId: representativePage.id,
        cause,
      });
    }
  }

  await recordDiagnostic({
    severity: "info",
    stage: "preflight",
    message: "Notion preflight checks passed.",
    timestamp: new Date().toISOString(),
  });
}

main().catch((error) => {
  if (!error?.diagnostic) {
    console.error(error);
  }
  process.exit(1);
});
