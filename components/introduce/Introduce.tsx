import styles from "./Introduce.module.scss";

export default function Introduce() {
  return (
    <div className={styles["introduce-container"]}>
      <picture>
        <img src="lurgi.webp" alt="lurgi" width={230} height={329} />
      </picture>

      <div className={styles.copy}>
        <p className={styles.p}>
          기술과 사람 사이에서 생기는 문제에 관심을 가집니다.
        </p>
        <p className={styles.p}>
          사람이 기술을 어떻게 이해하고 자신의 의도대로 사용할 수 있는지
          고민합니다.
        </p>
        <p className={styles.p}>
          최근에는 AI가 우리의 판단과 상호작용 방식을 어떻게 바꾸는지 탐구하고
          있습니다.
        </p>
      </div>
    </div>
  );
}
