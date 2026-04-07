import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export interface NotionBuildDiagnostic {
  severity: "info" | "error";
  stage:
    | "env"
    | "database-query"
    | "page-retrieve"
    | "metadata-parse"
    | "record-map-fetch"
    | "preflight";
  message: string;
  timestamp: string;
  postType?: PostType;
  databaseId?: string;
  pageId?: string;
  reason?: string;
  cause?: string;
}

const DIAGNOSTICS_DIR = path.join(process.cwd(), ".artifacts");
export const NOTION_DIAGNOSTICS_PATH = path.join(
  DIAGNOSTICS_DIR,
  "notion-diagnostics.ndjson"
);

export class NotionBuildError extends Error {
  diagnostic: NotionBuildDiagnostic;

  constructor(diagnostic: NotionBuildDiagnostic, options?: { cause?: unknown }) {
    super(diagnostic.message, {
      cause: options?.cause instanceof Error ? options.cause : undefined,
    });
    this.name = "NotionBuildError";
    this.diagnostic = diagnostic;
  }
}

export function getDiagnosticCause(cause: unknown) {
  if (!cause) {
    return undefined;
  }

  if (cause instanceof Error) {
    return cause.stack || `${cause.name}: ${cause.message}`;
  }

  return String(cause);
}

export async function recordNotionDiagnostic(
  diagnostic: NotionBuildDiagnostic
) {
  const message = JSON.stringify({ scope: "notion", ...diagnostic });

  if (diagnostic.severity === "error") {
    console.error(message);
  } else {
    console.log(message);
  }

  try {
    await mkdir(DIAGNOSTICS_DIR, { recursive: true });
    await appendFile(NOTION_DIAGNOSTICS_PATH, `${message}\n`, "utf8");
  } catch (error) {
    console.error(
      JSON.stringify({
        scope: "notion",
        severity: "error",
        stage: "preflight",
        message: "Failed to persist Notion diagnostics artifact.",
        timestamp: new Date().toISOString(),
        cause: getDiagnosticCause(error),
      })
    );
  }
}

export async function createNotionBuildError(
  diagnostic: Omit<NotionBuildDiagnostic, "timestamp" | "cause"> & {
    cause?: unknown;
  }
) {
  const normalizedDiagnostic: NotionBuildDiagnostic = {
    ...diagnostic,
    cause: getDiagnosticCause(diagnostic.cause),
    timestamp: new Date().toISOString(),
  };

  await recordNotionDiagnostic(normalizedDiagnostic);

  return new NotionBuildError(normalizedDiagnostic, {
    cause: diagnostic.cause,
  });
}
