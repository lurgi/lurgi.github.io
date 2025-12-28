export const DATABASE_KEYS: readonly PostType[] = [
  "Development",
  "YogaLogs",
  "Insights",
  "Reading",
];

export type DatabaseKey = (typeof DATABASE_KEYS)[number];

export const DATABASE_ID: Record<DatabaseKey, string> = {
  Development: process.env.NOTION_DATABASE_DEVELOPMENT_ID,
  YogaLogs: process.env.NOTION_DATABASE_YOGA_LOGS_ID,
  Insights: process.env.NOTION_DATABASE_INSIGHTS_ID,
  Reading: process.env.NOTION_DATABASE_READING_ID,
  // Study: process.env.NOTION_DATABASE_STUDY_ID,
};
