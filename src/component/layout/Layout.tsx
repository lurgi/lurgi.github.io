import styles from "./Layout.module.css";
import Aside from "../aside/Aside";
import Main from "../main/Main";

export default function Layout() {
  return (
    <div className={styles.layout}>
      <Aside />
      <Main />
    </div>
  );
}
