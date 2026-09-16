import styles from "@/styles/PostPartList.module.css";
import Head from "next/head";
import Link from "next/link";

import Introduce from "@/components/introduce/Introduce";
import PostPreview from "@/components/preview/PostPreview";

import { postTypes } from "@/src/data";
import {
  getPagePreviewData,
  NotionPagePreviewData,
} from "@/utils/notionClient";
import { DATABASE_KEYS } from "@/src/notion";
import {
  getSelectedNotionPosts,
  SelectedNotionPost,
} from "@/utils/getSelectedNotionPosts";
import { sortByDateDesc } from "@/utils/sortByDate";
import { getCanonicalUrl } from "@/src/site";

interface HomeProps {
  selectedNotionPosts: SelectedNotionPost[];
  notionData: Record<PostType, NotionPagePreviewData[]>;
}

export default function Home({ notionData }: HomeProps) {
  return (
    <>
      <Head>
        <link key="canonical" rel="canonical" href={getCanonicalUrl()} />
      </Head>
      <div className="fade-in">
        <Introduce />

        <div className={styles.postList}>
          {postTypes.map((type) => (
            <div className={styles.postPartList} key={type}>
              <Link href={`/${type}`}>
                <h2>{type}</h2>
              </Link>
              {sortByDateDesc(notionData[type])
                .filter(({ title, date }) => title && date)
                .slice(0, 5)
                .map(({ uriId, title, author, date }) => (
                  <PostPreview
                    url={`/${type}/notion/${uriId}`}
                    post={{
                      title,
                      author: author || undefined,
                      date,
                    }}
                    key={`notion-${uriId}`}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export async function getStaticProps() {
  const selectedNotionPosts = await getSelectedNotionPosts();
  const notionData = await Promise.all(
    DATABASE_KEYS.map(async (key) => {
      const data = await getPagePreviewData(key);
      return { [key as PostType]: data || [] };
    })
  ).then((data) => Object.assign({}, ...data));

  return { props: { notionData, selectedNotionPosts } };
}
