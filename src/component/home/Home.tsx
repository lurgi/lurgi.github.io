import styles from "./Home.module.css";
import { posts, postTypes } from "../../data";
import PostPreview from "../preview/PostPreview";
import Bat from "../loading/bat/Bat";

interface PostListPart {
  type: PostType;
  posts: PostPreview[];
}

function PostPartList({ type, posts }: PostListPart) {
  return (
    <div className={styles.postPartList}>
      <h2>{type}</h2>
      {posts.map((post) => (
        <PostPreview url={`/${post.type}/${post.fileName}`} key={post.fileName} title={post.title} date={post.date} />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <div style={{ margin: "10rem 0rem" }}>
        <Bat />
        🐶안녕하세요!✋ 나중에 이곳에 소개가 들어갈거에요!
        <br />
        이곳에 깃헙 링크 링크드인 링크가 들어갈거에요!
      </div>
      <div className={styles.postList}>
        {postTypes.slice(0, 5).map((key) => (
          <PostPartList type={key} key={key} posts={posts[key]} />
        ))}
      </div>
    </>
  );
}
