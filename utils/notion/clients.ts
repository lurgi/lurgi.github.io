import { Client } from "@notionhq/client";
import { NotionAPI } from "notion-client";

export const notionOfficialClient = new Client({
  auth: process.env.NOTION_SECRET,
});

export const notionClient = new NotionAPI({
  authToken: process.env.NOTION_TOKEN_V2,
  activeUser: process.env.NOTION_USER_ID,
});
