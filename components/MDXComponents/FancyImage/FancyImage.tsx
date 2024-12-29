import styles from "./FancyImage.module.css";
import clsx from "clsx";

interface FancyImageProps {
  alt: string;
  src: string;
}

export default function FancyImage({ alt, src }: FancyImageProps) {
  return (
    <span className={styles["image-container"]}>
      <picture>
        <img className={clsx(styles["responsive-image"], "image-loading")} alt={alt} src={src} />
      </picture>
    </span>
  );
}
