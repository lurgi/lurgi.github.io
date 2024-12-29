import styles from "./Introduce.module.scss";

export default function Introduce() {
  return (
    <div className={styles["introduce-container"]}>
      <picture>
        <img src="lurgi.webp" alt="lurgi" width={230} height={329} />
      </picture>

      <p className={styles.p}>
        📖 ☕️
        <br />
        책과 커피를 사랑하는 웹 개발자 박정우입니다.
        <br />
        표준화된 길보단 나만의 길을 추구합니다.
        <br />
        세상에 대한 호기심을 바탕으로 개발을 문제 해결의 도구로 활용합니다.
      </p>
    </div>
  );
}
