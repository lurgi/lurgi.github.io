import { DATABASE_KEYS } from "@/src/notion";
import { getPagePreviewData, NotionPageMetadata } from "@/utils/notionClient";
import { sortByDateDesc } from "@/utils/sortByDate";

export type SelectedNotionPost = Pick<
  NotionPageMetadata,
  "title" | "date" | "author"
> & {
  uriId: string;
  postType: PostType;
};

export async function getSelectedNotionPosts(): Promise<SelectedNotionPost[]> {
  const posts = await Promise.all(
    DATABASE_KEYS.map(async (postType) => {
      const data = await getPagePreviewData(postType);

      return (data || []).map(({ uriId, title, date, author }) => ({
        uriId,
        title,
        date,
        author,
        postType,
      }));
    })
  ).then((results) => results.flat());

  return sortByDateDesc(posts).slice(0, 5);
}
