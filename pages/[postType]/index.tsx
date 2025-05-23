import styles from "@/styles/PostListPage.module.css";
import PostPreview from "@/components/preview/PostPreview";
import { posts } from "@/src/data";
import { GetStaticProps } from "next";
import clsx from "clsx";
import { DATABASE_ID, DatabaseKey } from "@/src/notion";
import { getPageWithCache, NotionPageMetadata, queryDatabaseWithCache } from "@/utils/notionClient";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

interface PostListPageProps {
  postType: PostType;
  notionData: ({ id: string } & NotionPageMetadata)[];
}

export default function PostListPage({ postType, notionData }: PostListPageProps) {
  const postData = posts[postType];

  return (
    <div key={postType} className={clsx(styles.postPartList, "fade-in")}>
      <h1>{postType}</h1>
      <small className={styles.description}>{postData?.description}</small>
      <ul className={styles.postPartList}>
        {notionData.map(
          ({ id, title, author, date }) =>
            title &&
            date && (
              <li key={id}>
                <PostPreview
                  url={`/${postType}/notion/${id}`}
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

  const notionDatabaseId = await queryDatabaseWithCache(DATABASE_ID[postType as DatabaseKey]);
  if (!notionDatabaseId)
    return {
      props: {
        postType,
      },
    };
  const dbIds = notionDatabaseId.results
    .filter((page): page is PageObjectResponse => "public_url" in page && !!page.public_url)
    .map((page) => page.id);
  const metadataList = await Promise.all(
    dbIds.map(async (id) => {
      const res = await getPageWithCache(id);
      return { ...res.metadata, id };
    })
  );

  return {
    props: {
      postType,
      notionData: metadataList,
    },
  };
}
