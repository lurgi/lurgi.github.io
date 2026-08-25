import styles from "@/styles/PostDetailPage.module.scss";

import clsx from "clsx";
import { GetStaticProps, GetStaticPropsResult } from "next";
import Head from "next/head";
import { ExtendedRecordMap } from "notion-types";
import {
  getPageWithCache,
  getPagePreviewData,
  NotionPageMetadata,
} from "@/utils/notionClient";
import {
  getSelectedNotionPosts,
  SelectedNotionPost,
} from "@/utils/getSelectedNotionPosts";
import { NotionPage } from "@/components/MDXComponents/NotionPage/NotionPage";
import Giscus from "@/components/customGiscus/CustomGiscus";
import { DATABASE_ID, DATABASE_KEYS } from "@/src/notion";

interface MetaInfo {
  title?: string | null;
  description?: string | null;
  url?: string | null;
  date?: string | null;
  image?: string | null;
}

function CustomHead({ title, description, url, date, image }: MetaInfo) {
  return (
    <Head>
      {title && <title key="title">{title}</title>}

      {description && (
        <meta key="description" name="description" content={description} />
      )}
      <meta key="author" name="author" content="lurgi" />
      <meta key="robots" name="robots" content="index, follow" />
      {date && <meta key="date" name="date" content={date} />}

      {title && <meta key="og:title" property="og:title" content={title} />}
      {description && (
        <meta
          key="og:description"
          property="og:description"
          content={description}
        />
      )}
      <meta key="og:type" property="og:type" content="article" />
      {url && <meta key="og:url" property="og:url" content={url} />}
      {url && <link key="canonical" rel="canonical" href={url} />}
      <meta key="og:site_name" property="og:site_name" content="Lurgi's blog" />
      {image && <meta key="og:image" property="og:image" content={image} />}
    </Head>
  );
}

interface PostProps {
  selectedNotionPosts: SelectedNotionPost[];
  recordMap: ExtendedRecordMap;
  pageId: string;
  uriId: string;
  metadata: NotionPageMetadata;
  postType: string;
}

export default function PostDetailPage({
  recordMap,
  metadata,
  pageId,
  uriId,
  postType,
}: PostProps) {
  return (
    <>
      <CustomHead
        {...metadata}
        url={`https://lurgi.github.io/${postType}/notion/${uriId}`}
      />
      <div className={clsx(styles.postDetailContainer, "fade-in")}>
        <NotionPage
          recordMap={recordMap}
          title={metadata.title}
          date={metadata.date}
        />
        <Giscus postFileName={metadata.title || pageId} />
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const paths = [];

  for (const key of DATABASE_KEYS) {
    const pages = await getPagePreviewData(key);
    const newPaths = pages.map(({ uriId }) => ({
      params: {
        postType: key,
        uriId,
      },
    }));

    paths.push(...newPaths);
  }

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps(
  context: Parameters<GetStaticProps>[0]
): Promise<GetStaticPropsResult<PostProps>> {
  const { uriId, postType } = context.params as {
    uriId: string;
    postType: string;
  };
  const previewPages = await getPagePreviewData(postType as PostType);
  const pageIdentity = previewPages.find((page) => page.uriId === uriId);

  if (!pageIdentity) {
    return { notFound: true };
  }

  const { pageId } = pageIdentity;
  const selectedNotionPosts = await getSelectedNotionPosts();
  const { recordMap, metadata } = await getPageWithCache(pageId, {
    pageId,
    postType: postType as PostType,
    databaseId:
      postType in DATABASE_ID
        ? DATABASE_ID[postType as keyof typeof DATABASE_ID]
        : undefined,
  });

  return {
    props: {
      selectedNotionPosts,
      recordMap,
      pageId,
      uriId,
      metadata,
      postType,
    },
  };
}
