import useIsMobile from "@/src/hooks/useIsMobile";
import styles from "./PostPreview.module.scss";
import Link from "next/link";

interface PostPreviewProps {
  url: string;
  post: Pick<PostPreview, "title" | "date" | "author">;
}

export default function PostPreview({ url, post: { title, date, author } }: PostPreviewProps) {
  const isMobile = useIsMobile();

  return (
    <div className={styles.preview}>
      <Link href={url}>
        <div className={styles.detail}>
          <div className={styles.title}>{title}</div>
          {author && <small className={styles.author}>{author}</small>}
        </div>
      </Link>

      <small className={styles.date}>{isMobile ? date.split("").slice(2).join("") : date}</small>
    </div>
  );
}
