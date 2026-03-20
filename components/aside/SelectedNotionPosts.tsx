import Link from "next/link";

import styles from "./SelectedNotionPosts.module.scss";
import { SelectedNotionPost } from "@/utils/getSelectedNotionPosts";

interface SelectedNotionPostsProps {
  posts?: SelectedNotionPost[];
}

export default function SelectedNotionPosts({
  posts = [],
}: SelectedNotionPostsProps) {
  if (!posts.length) {
    return null;
  }

  return (
    <section className={styles.section} aria-label="선택 글">
      <ul className={styles.list}>
        {posts.map(({ id, postType, title, date }) => (
          <li key={`${postType}-${id}`} className={styles.item}>
            <Link href={`/${postType}/notion/${id}`} className={styles.link}>
              <span className={styles.title}>{title}</span>
              <span className={styles.meta}>
                <span className={styles.date}>{date}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
