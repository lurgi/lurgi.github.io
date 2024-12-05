import { useState } from "react";
import styles from "./FancyImage.module.css";

interface FancyImageProps {
  alt: string;
  src: string;
}

export default function FancyImage(props: FancyImageProps) {
  const [isLoading, setIsLoading] = useState(!!props.src);
  const [isError, setIsError] = useState(false);

  return (
    isError || (
      <span className={styles["image-container"]}>
        <img
          className={`${styles["responsive-image"]} ${isLoading && styles["image-loading"]}`}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsError(true)}
          {...props}
        />
      </span>
    )
  );
}
