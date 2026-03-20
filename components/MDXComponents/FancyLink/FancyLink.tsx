/* eslint-disable @next/next/no-img-element */
import { AnchorHTMLAttributes, useEffect, useState } from "react";
import styles from "./FancyLink.module.css";

interface FancyLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  linkMetadata?: { title?: string; description?: string; image?: string };
}

export default function FancyLink({
  href,
  children,
  linkMetadata,
}: FancyLinkProps) {
  const imageUrl = linkMetadata?.image;
  const hasValidImageUrl = !!imageUrl && /^https?:\/\//.test(imageUrl);
  const [loadedImageUrl, setLoadedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!hasValidImageUrl || !imageUrl) {
      setLoadedImageUrl(null);
      return;
    }

    let isCancelled = false;
    const preloadImage = new window.Image();

    const handleLoad = () => {
      if (!isCancelled) {
        setLoadedImageUrl(imageUrl);
      }
    };

    const handleError = () => {
      if (!isCancelled) {
        setLoadedImageUrl(null);
      }
    };

    preloadImage.onload = handleLoad;
    preloadImage.onerror = handleError;
    preloadImage.src = imageUrl;

    return () => {
      isCancelled = true;
      preloadImage.onload = null;
      preloadImage.onerror = null;
    };
  }, [hasValidImageUrl, imageUrl]);

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
      {loadedImageUrl === imageUrl && imageUrl && (
        <span className={styles.image}>
          <img
            className={styles.previewImage}
            src={imageUrl}
            alt={linkMetadata.title || "링크 미리보기 이미지"}
            onError={() => setLoadedImageUrl(null)}
          />
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
