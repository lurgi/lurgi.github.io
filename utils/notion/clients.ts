import { Client } from "@notionhq/client";
import { NotionAPI } from "notion-client";

export const notionOfficialClient = new Client({
  auth: process.env.NOTION_SECRET,
});

export const notionClient = new NotionAPI({
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
