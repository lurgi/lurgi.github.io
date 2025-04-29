import { type ExtendedRecordMap } from "notion-types";
import { NotionRenderer } from "react-notion-x";
import TweetEmbed from "react-tweet-embed";
import styles from "./notion.module.css";

function Tweet({ id }: { id: string }) {
  return <TweetEmbed tweetId={id} />;
}

export function NotionPage({
  recordMap,
}: {
  recordMap: ExtendedRecordMap;
  previewImagesEnabled?: boolean;
  rootPageId?: string;
  rootDomain?: string;
}) {
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
        components={{
          Tweet,
        }}
      />
    </div>
  );
}
