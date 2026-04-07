import { type ExtendedRecordMap } from "notion-types";

export function normalizeRecordMapTable<
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

export function normalizeRecordMap(recordMap: ExtendedRecordMap) {
  return {
    ...recordMap,
    block: normalizeRecordMapTable(recordMap.block),
    collection: normalizeRecordMapTable(recordMap.collection),
    collection_view: normalizeRecordMapTable(recordMap.collection_view),
    notion_user: normalizeRecordMapTable(recordMap.notion_user),
  } as ExtendedRecordMap;
}
