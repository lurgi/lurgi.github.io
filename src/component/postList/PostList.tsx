import { Fragment } from "react/jsx-runtime";
import styles from "./PostList.module.css";
import { posts, postTypes } from "../../data";
import { Link, useParams } from "react-router";

interface PostPreviewProps {
  url: string;
  title: string;
  date: string;
}

function PostPreview({ url, title, date }: PostPreviewProps) {
  return (
    <div className={styles.postPreview}>
      <Link to={url}>
        <h3>{title}</h3>
      </Link>
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
        <PostPreview url={`/${post.type}/${post.fileName}`} key={post.id} title={post.title} date={post.date} />
      ))}
    </div>
  );
}

export default function PostList() {
  const { postType } = useParams() as { postType: PostType };

  return (
    <div className={styles.postList}>
      {postType ? (
        <PostPartList type={postType} posts={posts[postType]} />
      ) : (
        postTypes.map((key) => (
          <Fragment key={key}>
            <PostPartList type={key} posts={posts[key]} />
          </Fragment>
        ))
      )}
    </div>
  );
}
