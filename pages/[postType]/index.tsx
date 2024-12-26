import styles from "@/styles/PostListPage.module.css";
import PostPreview from "@/components/preview/PostPreview";

import { posts } from "@/src/data";
import { GetStaticProps } from "next";
import clsx from "clsx";

export default function PostListPage({ postType }: { postType: PostType }) {
  const postData = posts[postType];

  return (
    <div className={clsx(styles.postPartList, "fade-in")}>
      <h1>{postType}</h1>
      <small className={styles.description}>{postData?.description}</small>
      <ul className={styles.postPartList}>
        {postData?.contents.map((post) => (
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

  return {
    props: { postType },
  };
}
