import { AnchorHTMLAttributes } from "react";
import styles from "./FancyLink.module.css";

export default function FancyLink({ href, children }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <span className={styles.link}>
      <a href={href} target={"_blank"} rel={"noopener noreferrer"}>
        🔗 {children}
      </a>
    </span>
  );
}
