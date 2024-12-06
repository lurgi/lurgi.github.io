import styles from "./Home.module.css";
import { posts, postTypes } from "../../data";
import PostPreview from "../preview/PostPreview";
import Introduce from "../introduce/Introduce";
import { Link } from "react-router";

interface PostListPart {
  type: PostType;
  posts: PostPreview[];
}

function PostPartList({ type, posts }: PostListPart) {
  return (
    <div className={styles.postPartList}>
      <Link to={`/${type}`}>
        <h2>{type}</h2>
      </Link>
      {posts.map((post) => (
        <PostPreview url={`/${post.type}/${post.fileName}`} key={post.fileName} title={post.title} date={post.date} />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Introduce />

      <div className={styles.postList}>
        {postTypes.map((key) => (
          <PostPartList type={key} key={key} posts={posts[key].slice(0, 5)} />
        ))}
      </div>
    </>
  );
}
