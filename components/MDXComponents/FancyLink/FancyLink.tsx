/* eslint-disable @next/next/no-img-element */
import { AnchorHTMLAttributes } from "react";
import styles from "./FancyLink.module.css";

interface FancyLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  linkMetadata?: { title?: string; description?: string; image?: string };
}

export default function FancyLink({
  href,
  children,
  linkMetadata,
}: FancyLinkProps) {
  if (!linkMetadata || Object.keys(linkMetadata).length === 0)
    return (
      <span className={styles.noMetadataLink}>
        <a href={href} target={"_blank"} rel={"noopener noreferrer"}>
          🔗 {children}
        </a>
      </span>
    );

  return (
    <a
      href={href}
      target={"_blank"}
      rel={"noopener noreferrer"}
      className={styles.link}
    >
      {linkMetadata?.image && /^https?:\/\//.test(linkMetadata.image) && (
        <span className={styles.image}>
          <img src={linkMetadata.image} alt="링크 미리보기 이미지" />
        </span>
      )}
      <span className={styles.textLayout}>
        {linkMetadata?.title && (
          <span className={styles.title}>{linkMetadata?.title}</span>
        )}
        {linkMetadata?.description && (
          <span className={styles.description}>
            {linkMetadata?.description}
          </span>
        )}
      </span>
    </a>
  );
}
