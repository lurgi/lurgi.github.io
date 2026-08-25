import "react-notion-x/src/styles.css";
import "prismjs/themes/prism-tomorrow.css";
import "katex/dist/katex.min.css";

import { useCallback, useMemo } from "react";
import { type ExtendedRecordMap } from "notion-types";
import { defaultMapImageUrl } from "notion-utils";
import { NotionRenderer } from "react-notion-x";
import TweetEmbed from "react-tweet-embed";
import styles from "./notion.module.css";
import { Code } from "react-notion-x/build/third-party/code";
import CustomImage, { type CustomImageProps } from "./CustomImage";
import { getNotionImageAspectRatios } from "./getNotionImageAspectRatios";

function Tweet({ id }: { id: string }) {
  return <TweetEmbed tweetId={id} />;
}

export function NotionPage({
  recordMap,
  title,
  date,
}: {
  recordMap: ExtendedRecordMap;
  title: string;
  date: string;
  previewImagesEnabled?: boolean;
  rootPageId?: string;
  rootDomain?: string;
}) {
  const imageAspectRatios = useMemo(
    () => getNotionImageAspectRatios(recordMap, defaultMapImageUrl),
    [recordMap]
  );
  const RendererImage = useCallback(
    (props: CustomImageProps) => (
      <CustomImage
        {...props}
        aspectRatio={props.src ? imageAspectRatios.get(props.src) : undefined}
      />
    ),
    [imageAspectRatios]
  );

  if (!recordMap) {
    return null;
  }

  return (
    <div className={styles["notion-container"]}>
      <NotionRenderer
        disableHeader
        recordMap={recordMap}
        fullPage={true}
        darkMode={false}
        forceCustomImages={true}
        mapImageUrl={defaultMapImageUrl}
        pageTitle={
          <span className={styles["notion-page-title-wrapper"]}>
            <span className={styles["notion-page-title-text"]}>{title}</span>
            <small className={styles["notion-page-date"]}>{date}</small>
          </span>
        }
        components={{
          Tweet,
          Code,
          Image: RendererImage,
        }}
      />
    </div>
  );
}
