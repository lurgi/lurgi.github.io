import styles from "./PostList.module.css";
import { posts } from "../../data";
import { useParams } from "react-router";
import PostPreview from "../preview/PostPreview";

export default function PostList() {
  const { postType } = useParams() as { postType: PostType };

  return (
    <div className={styles.postPartList}>
      <h1>{postType}</h1>
      {posts[postType]?.map((post) => (
        <PostPreview url={`/${post.type}/${post.fileName}`} key={post.fileName} post={post} />
      ))}
    </div>
  );
}
