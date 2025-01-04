/* eslint-disable @next/next/no-img-element */
import styles from "./PhotoList.module.css";
import { MediaDetail } from "@/src/api/instagram";

interface PhotoListProps {
  photos: MediaDetail[];
}

export default function PhotoList({ photos }: PhotoListProps) {
  return (
    <div className={styles.photoPartList}>
      <h2>Photos</h2>

      <div className={styles["photos_container"]}>
        {photos.slice(0, 15).map(({ id, media_url }) => (
          <div key={id} className={styles["photo_wrapper"]}>
            <img src={media_url} className={styles.photo} alt="instagram photo" />
          </div>
        ))}
      </div>
    </div>
  );
}
