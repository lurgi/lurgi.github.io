export const DATABASE_KEYS = ["Development", "Insights", "Reading"] as const;

export type DatabaseKey = (typeof DATABASE_KEYS)[number];

export const DATABASE_ID: Record<DatabaseKey, string> = {
  Development: process.env.NOTION_DATABASE_DEVELOPMENT_ID,
  Insights: process.env.NOTION_DATABASE_INSIGHTS_ID,
  Reading: process.env.NOTION_DATABASE_READING_ID,
};
