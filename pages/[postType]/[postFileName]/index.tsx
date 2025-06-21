import styles from "@/styles/PostDetailPage.module.scss";

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import { GetStaticProps } from "next";
import remarkGfm from "remark-gfm";

import { posts } from "@/src/data";
import Giscus from "@/components/customGiscus/CustomGiscus";
import FancyLink from "@/components/MDXComponents/FancyLink/FancyLink";
import FancyCode from "@/components/MDXComponents/FancyCode/FancyCode";
import FancyImage from "@/components/MDXComponents/FancyImage/FancyImage";

import fs from "fs";
import path from "path";
import clsx from "clsx";
import Head from "next/head";
import { extractLinksFromMDX } from "@/utils/extractLinksFromMDX";
import { fetchMetadata } from "@/utils/fetchMetaData";

interface MetaInfo {
  title: string;
  description: string;
  keywords: string;
  url: string;
  date: string;
}

function CustomHead({ title, description, keywords, url, date }: MetaInfo) {
  return (
    <Head>
      <title key="title">{title}</title>

      {description && <meta key="description" name="description" content={description} />}
      {keywords?.length && <meta key="keywords" name="keywords" content={keywords} />}
      <meta key="author" name="author" content="lurgi" />
      <meta key="robots" name="robots" content="index, follow" />
      <meta key="date" name="date" content={date} />

      {title && <meta key="og:title" property="og:title" content={title} />}
      {description && <meta key="og:description" property="og:description" content={description} />}
      <meta key="og:type" property="og:type" content="article" />
      <meta key="og:url" property="og:url" content={url} />
      <meta key="og:site_name" property="og:site_name" content="Lurgi's blog" />
    </Head>
  );
}

interface PostProps {
  mdxSource: MDXRemoteSerializeResult;
  postFileName: string;
  metaInfo: MetaInfo;
  linkMetadata: { url: string; metadata: { title?: string; description?: string; image?: string } }[];
}

export default function PostDetailPage({ mdxSource, postFileName, metaInfo, linkMetadata }: PostProps) {
  return (
    <>
      <CustomHead {...metaInfo} />
      <div className={clsx(styles.postDetailContainer, "fade-in")}>
        <div className={styles.mdx}>
          <MDXRemote
            {...mdxSource}
            components={{
              a: (props) => (
                <FancyLink {...props} linkMetadata={linkMetadata.find((link) => link.url === props.href)?.metadata} />
              ),
              code: FancyCode,
              img: FancyImage,
            }}
          />
        </div>
        <Giscus postFileName={postFileName} />
      </div>
    </>
  );
}

export function getStaticPaths() {
  const paths = Object.keys(posts).flatMap((postType) =>
    (posts[postType as keyof typeof posts].contents ?? []).map((content) => ({
      params: { postType, postFileName: content.fileName },
    }))
  );

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps(context: Parameters<GetStaticProps>[0]) {
  const { postType, postFileName } = context.params as { postType: PostType; postFileName: string };
  if (!postType || !postFileName) {
    return { notFound: true };
  }

  const filePath = path.join(process.cwd(), "src", "statics", postType.toLowerCase(), `${postFileName}.mdx`);
  const fileContents = fs.readFileSync(filePath, "utf-8");
  if (!fileContents) {
    return { notFound: true };
  }

  const links = extractLinksFromMDX(fileContents);
  const linkMetadata = await Promise.all(links.map(async (url) => ({ url, metadata: await fetchMetadata(url) })));

  const mdxSource = await serialize(fileContents, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
    },
  });

  const articleData = posts[postType].contents?.find(({ fileName }) => fileName === postFileName);
  if (!articleData) {
    return { notFound: true };
  }

  const metaInfo: MetaInfo = {
    title: articleData.title,
    description: articleData?.description || "",
    keywords: articleData.keywords?.join(", ") || "",
    date: articleData.date,
    url: `https://lurgi.github.io/${postType}/${postFileName}`,
  };

  return {
    props: { mdxSource, postFileName, metaInfo, linkMetadata },
  };
}
