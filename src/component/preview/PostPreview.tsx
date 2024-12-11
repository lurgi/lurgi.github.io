import { Link } from "react-router";
import styles from "./PostPreview.module.scss";
import useIsMobile from "../../hooks/useIsMobile";

interface PostPreviewProps {
  url: string;
  post: PostPreview;
}

export default function PostPreview({ url, post: { title, date, author } }: PostPreviewProps) {
  const isMobile = useIsMobile();
  return (
    <div className={styles.preview}>
      <Link to={url}>
        <div className={styles.detail}>
          <div className={styles.title}>{title}</div>
          {author && <small className={styles.author}>{author}</small>}
        </div>
      </Link>

      <small className={styles.date}>{isMobile ? date.split("").slice(2).join("") : date}</small>
    </div>
  );
}
