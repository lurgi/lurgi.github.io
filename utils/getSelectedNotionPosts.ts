import { SELECTED_NOTION_TITLES } from "@/src/selectedNotionTitles";
import { DATABASE_KEYS } from "@/src/notion";
import { getPagePreviewData, NotionPageMetadata } from "@/utils/notionClient";
import { sortByDateDesc } from "@/utils/sortByDate";

export type SelectedNotionPost = Pick<
  NotionPageMetadata,
  "title" | "date" | "author"
> & {
  id: string;
  postType: PostType;
};

export async function getSelectedNotionPosts() {
  if (!SELECTED_NOTION_TITLES.length) {
    return [] as SelectedNotionPost[];
  }

  const selectedTitles = new Set(SELECTED_NOTION_TITLES);
  const posts = await Promise.all(
    DATABASE_KEYS.map(async (postType) => {
      const data = await getPagePreviewData(postType);

      return (data || [])
        .filter(({ title }) => selectedTitles.has(title))
        .map(({ id, title, date, author }) => ({
          id,
          title,
          date,
          author,
          postType,
        }));
    })
  ).then((results) => results.flat());

  return sortByDateDesc(posts) as SelectedNotionPost[];
}
