/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from "@/styles/PostDetailPage.module.scss";

import clsx from "clsx";
import { GetStaticProps } from "next";
import Head from "next/head";
import { ExtendedRecordMap } from "notion-types";
import { getPageWithCache, NotionPageMetadata, queryDatabaseWithCache } from "@/utils/notionClient";
import { NotionPage } from "@/components/MDXComponents/NotionPage/NotionPage";
import Giscus from "@/components/customGiscus/CustomGiscus";
import { DATABASE_ID, DATABASE_KEYS } from "@/src/notion";

interface MetaInfo {
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  url?: string | null;
  date?: string | null;
  image?: string | null;
}

function CustomHead({ title, description, keywords, url, date, image }: MetaInfo) {
  return (
    <Head>
      {title && <title key="title">{title}</title>}

      {description && <meta key="description" name="description" content={description} />}
      {keywords?.length && <meta key="keywords" name="keywords" content={keywords} />}
      <meta key="author" name="author" content="lurgi" />
      <meta key="robots" name="robots" content="index, follow" />
      {date && <meta key="date" name="date" content={date} />}

      {title && <meta key="og:title" property="og:title" content={title} />}
      {description && <meta key="og:description" property="og:description" content={description} />}
      <meta key="og:type" property="og:type" content="article" />
      {url && <meta key="og:url" property="og:url" content={url} />}
      <meta key="og:site_name" property="og:site_name" content="Lurgi's blog" />
      {image && <meta key="og:image" property="og:image" content={image} />}
    </Head>
  );
}

interface PostProps {
  recordMap: ExtendedRecordMap;
  pageId: string;
  metadata: NotionPageMetadata;
}

export default function PostDetailPage({ recordMap, metadata, pageId }: PostProps) {
  return (
    <>
      <CustomHead {...metadata} url={`https://lurgi.github.io/notion/${pageId}`} />
      <div className={clsx(styles.postDetailContainer, "fade-in")}>
        <NotionPage recordMap={recordMap} />
        <Giscus postFileName={metadata.title || pageId} />
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const paths = [];

  for (const key of DATABASE_KEYS) {
    const pages = await queryDatabaseWithCache(DATABASE_ID[key]);

    const newPaths = pages.results.map((page) => ({
      params: {
        postType: key,
        pageId: page.id,
      },
    }));

    paths.push(...newPaths);
  }

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps(context: Parameters<GetStaticProps>[0]): Promise<{ props: PostProps }> {
  const { pageId } = context.params as { pageId: string };
  const { recordMap, metadata } = await getPageWithCache(pageId);

  return {
    props: {
      recordMap,
      pageId,
      metadata,
    },
  };
}
