import styles from "@/styles/PostPartList.module.css";
import Introduce from "@/components/introduce/Introduce";
// import PhotoList from "@/components/photoList/PhotoList";
import PostPreview from "@/components/preview/PostPreview";

import { posts, postTypes } from "@/src/data";
import Link from "next/link";

interface PostListPart {
  type: PostType;
  posts: PostPreview[];
}

export default function Home() {
  return (
    <div className="fade-in">
      <Introduce />

      <div className={styles.postList}>
        {postTypes.map((key) => (
          <PostPartList type={key} key={key} posts={posts[key].contents.slice(0, 5)} />
        ))}
        {/* 임시 코드 삭제 */}
        {/* <PhotoList /> */}
      </div>
    </div>
  );
}

function PostPartList({ type, posts }: PostListPart) {
  return (
    <div className={styles.postPartList}>
      <Link href={`/${type}`}>
        <h2>{type}</h2>
      </Link>
      {posts.map((post) => (
        <PostPreview url={`/${post.type}/${post.fileName}`} key={post.fileName} post={post} />
      ))}
    </div>
  );
}
