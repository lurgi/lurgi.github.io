/* eslint-disable @next/next/no-img-element */
import { AnchorHTMLAttributes } from "react";
import styles from "./FancyLink.module.css";

interface FancyLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  linkMetadata?: { title?: string; description?: string; image?: string };
}

export default function FancyLink({ href, children, linkMetadata }: FancyLinkProps) {
  if (!linkMetadata || Object.keys(linkMetadata).length === 0)
    return (
      <span className={styles.noMetadataLink}>
        <a href={href} target={"_blank"} rel={"noopener noreferrer"}>
          🔗 {children}
        </a>
      </span>
    );

  return (
    <a href={href} target={"_blank"} rel={"noopener noreferrer"} className={styles.link}>
      {linkMetadata?.image && (
        <span className={styles.image}>
          <img src={linkMetadata?.image} alt={"image"} />
        </span>
      )}
      <span className={styles.textLayout}>
        <span className={styles.title}>{linkMetadata?.title}</span>
        <span className={styles.description}>{linkMetadata?.description}</span>
      </span>
    </a>
  );
}
