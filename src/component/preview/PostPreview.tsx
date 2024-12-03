import { Link } from "react-router";
import styles from "./PostPreview.module.css";

interface PostPreviewProps {
  url: string;
  title: string;
  date: string;
}

export default function PostPreview({ url, title, date }: PostPreviewProps) {
  return (
    <div className={styles.postPreview}>
      <Link to={url}>
        <h3>{title}</h3>
      </Link>
      <p>{date}</p>
    </div>
  );
}
