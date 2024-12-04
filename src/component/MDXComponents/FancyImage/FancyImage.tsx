import styles from "./FancyImage.module.css";

interface FancyImageProps {
  alt: string;
  src: string;
}

export default function FancyImage(props: FancyImageProps) {
  return (
    <div className={styles["image-container"]}>
      <img className={styles["responsive-image"]} {...props} />
    </div>
  );
}
