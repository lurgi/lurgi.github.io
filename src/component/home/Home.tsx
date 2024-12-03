import { Fragment } from "react";
import styles from "./Home.module.css";
import { posts, postTypes } from "../../data";
import PostPreview from "../preview/PostPreview";

interface PostListPart {
  type: PostType;
  posts: PostPreview[];
}

function PostPartList({ type, posts }: PostListPart) {
  return (
    <div className={styles.postPartList}>
      <h2>{type}</h2>
      {posts.map((post) => (
        <PostPreview url={`/${post.type}/${post.fileName}`} key={post.id} title={post.title} date={post.date} />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <div style={{ margin: "10rem 0rem" }}>🐶안녕하세요!✋ 나중에 이곳에 소개가 들어갈거에요!</div>
      <div className={styles.postList}>
        {postTypes.map((key) => (
          <Fragment key={key}>
            <PostPartList type={key} posts={posts[key]} />
          </Fragment>
        ))}
      </div>
    </>
  );
}
