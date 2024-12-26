import styles from "./Bat.module.scss";

export default function Bat() {
  return (
    <div className={styles["bat-container"]}>
      <div className={styles.bat} />
    </div>
  );
}
