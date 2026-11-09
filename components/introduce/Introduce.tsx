import AppleHero from "./AppleHero";
import styles from "./Introduce.module.scss";

export default function Introduce() {
  return (
    <div className={styles["introduce-container"]}>
      <AppleHero />
    </div>
  );
}
