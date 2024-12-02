import { Fragment } from "react/jsx-runtime";
import styles from "./PostList.module.css";
import { posts, postTypes } from "../../data";

interface PostPreviewProps {
  title: string;
  date: string;
}

function PostPreview({ title, date }: PostPreviewProps) {
  return (
    <div className={styles.postPreview}>
      <h3>{title}</h3>
      <p>{date}</p>
    </div>
  );
}

interface PostListPart {
  type: PostType;
  posts: PostPreview[];
}

function PostPartList({ type, posts }: PostListPart) {
  return (
    <div className={styles.postPartList}>
      <h2>{type}</h2>
      {posts.map((post) => (
        <PostPreview key={post.id} title={post.title} date={post.date} />
      ))}
    </div>
  );
}

export default function PostList() {
  return (
    <div className={styles.postList}>
      {postTypes.map((key) => (
        <Fragment key={key}>
          <PostPartList type={key} posts={posts[key]} />
        </Fragment>
      ))}
    </div>
  );
}
