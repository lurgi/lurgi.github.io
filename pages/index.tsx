import styles from "@/styles/PostPartList.module.css";
import Link from "next/link";

import Introduce from "@/components/introduce/Introduce";
import PhotoList from "@/components/photoList/PhotoList";
import PostPreview from "@/components/preview/PostPreview";

import { getMediaDetail, getMediaIds, MediaDetail } from "@/src/api/instagram";
import { posts, postTypes } from "@/src/data";
import { getPagePreviewData, NotionPageMetadata } from "@/utils/notionClient";
import { DATABASE_KEYS } from "@/src/notion";
import { sortByDateDesc } from "@/utils/sortByDate";

interface HomeProps {
  photos: MediaDetail[];
  notionData: Record<PostType, ({ id: string } & NotionPageMetadata)[]>;
}

export default function Home({ photos, notionData }: HomeProps) {
  return (
    <div className="fade-in">
      <Introduce />

      <div className={styles.postList}>
        {postTypes.map((type) => (
          <div className={styles.postPartList} key={type}>
            <Link href={`/${type}`}>
              <h2>{type}</h2>
            </Link>
            {[
              ...sortByDateDesc(notionData[type]).map(
                ({ id, title, author, date }) =>
                  title &&
                  date && (
                    <PostPreview
                      url={`/${type}/notion/${id}`}
                      post={{
                        title,
                        author: author || undefined,
                        date,
                      }}
                      key={`notion-${id}`}
                    />
                  )
              ),
              ...(posts[type].contents || []).map((post) => (
                <PostPreview
                  url={`/${post.type}/${post.fileName}`}
                  key={`post-${post.fileName}`}
                  post={post}
                />
              )),
            ].slice(0, 5)}
          </div>
        ))}

        <PhotoList photos={photos} />
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const mediaIds = await getMediaIds();
  const instagramIds = mediaIds.map(({ id }) => id);

  const results = await Promise.all(
    instagramIds
      .slice(0, 20)
      .map((instagramId) => getMediaDetail({ instagramId }))
  );
  const photos = results.flatMap((v) => v).filter((v) => !!v);

  const notionData = await Promise.all(
    DATABASE_KEYS.map(async (key) => {
      const data = await getPagePreviewData(key);
      return { [key as PostType]: data || [] };
    })
  ).then((data) => Object.assign({}, ...data));

  return { props: { photos, notionData } };
}
