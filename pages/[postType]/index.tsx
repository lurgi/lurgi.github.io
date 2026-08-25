import styles from "@/styles/PostListPage.module.css";
import PostPreview from "@/components/preview/PostPreview";
import { posts } from "@/src/data";
import { GetStaticProps } from "next";
import Head from "next/head";
import clsx from "clsx";
import {
  getPagePreviewData,
  NotionPagePreviewData,
} from "@/utils/notionClient";
import {
  getSelectedNotionPosts,
  SelectedNotionPost,
} from "@/utils/getSelectedNotionPosts";
import { sortByDateDesc } from "@/utils/sortByDate";
import { getCanonicalUrl } from "@/src/site";

interface PostListPageProps {
  selectedNotionPosts: SelectedNotionPost[];
  postType: PostType;
  notionData: NotionPagePreviewData[];
}

export default function PostListPage({
  postType,
  notionData,
}: PostListPageProps) {
  const postData = posts[postType];
  const sortedNotionData = sortByDateDesc(notionData);
  const canonicalUrl = getCanonicalUrl(`/${postType}`);

  return (
    <>
      <Head>
        <link key="canonical" rel="canonical" href={canonicalUrl} />
        <meta key="og:url" property="og:url" content={canonicalUrl} />
      </Head>
      <div key={postType} className={clsx(styles.postPartList, "fade-in")}>
        <h1>{postType}</h1>
        <small className={styles.description}>{postData?.description}</small>
        <ul className={styles.postPartList}>
          {sortedNotionData.map(
            ({ uriId, title, author, date }) =>
              title &&
              date && (
                <li key={uriId}>
                  <PostPreview
                    url={`/${postType}/notion/${uriId}`}
                    post={{
                      title,
                      author: author || undefined,
                      date,
                    }}
                  />
                </li>
              )
          )}
          {postData?.contents?.map((post) => (
            <li key={post.fileName}>
              <PostPreview url={`/${post.type}/${post.fileName}`} post={post} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const paths = (Object.keys(posts) as PostType[]).map((postType) => ({
    params: { postType },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps(context: Parameters<GetStaticProps>[0]) {
  const postType = context.params?.postType as PostType;
  if (!postType || !Object.keys(posts).includes(postType)) {
    return { notFound: true };
  }

  const [selectedNotionPosts, notionData] = await Promise.all([
    getSelectedNotionPosts(),
    getPagePreviewData(postType),
  ]);

  return {
    props: {
      selectedNotionPosts,
      postType,
      notionData,
    },
  };
}
