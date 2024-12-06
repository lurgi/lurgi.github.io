import { Link } from "react-router";
import styles from "./PostPreview.module.scss";

interface PostPreviewProps {
  url: string;
  title: string;
  date: string;
}

export default function PostPreview({ url, title, date }: PostPreviewProps) {
  return (
    <div className={styles.postPreview}>
      <Link to={url}>
        <div className={styles["preview-title"]}>{title}</div>
      </Link>

      <small className={styles["preview-date"]}>{date}</small>
    </div>
  );
}
