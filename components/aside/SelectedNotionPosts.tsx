import Link from "next/link";
import { useRouter } from "next/router";

import styles from "./SelectedNotionPosts.module.scss";
import { SelectedNotionPost } from "@/utils/getSelectedNotionPosts";

interface SelectedNotionPostsProps {
  posts?: SelectedNotionPost[];
}

export default function SelectedNotionPosts({
  posts = [],
}: SelectedNotionPostsProps) {
  const router = useRouter();
  const currentPostType = router.query.postType;
  const currentUriId = router.query.uriId;

  if (!posts.length) {
    return null;
  }

  return (
    <section className={styles.section} aria-label="선택 글">
      <ul className={styles.list}>
        {posts.map(({ uriId, postType, title, date }) => {
          const isCurrentPost =
            currentPostType === postType && currentUriId === uriId;

          return (
            <li key={`${postType}-${uriId}`} className={styles.item}>
              <Link
                href={`/${postType}/notion/${uriId}`}
                className={`${styles.link} ${isCurrentPost ? styles.active : ""}`}
                aria-current={isCurrentPost ? "page" : undefined}
              >
                <span className={styles.title}>{title}</span>
                <span className={styles.meta}>
                  <span className={styles.date}>{date}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
