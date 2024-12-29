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

interface MetaInfo {
  title: string;
  description: string;
  keywords: string;
  url: string;
}

function CustomHead({ title, description, keywords, url }: MetaInfo) {
  return (
    <Head>
      <title>{title}</title>

      {description && <meta name="description" content={description} />}
      {keywords?.length && <meta name="keywords" content={keywords} />}
      <meta name="author" content="lurgi" />
      <meta name="robots" content="index, follow" />

      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Lurgi's blog" />
    </Head>
  );
}

interface PostProps {
  mdxSource: MDXRemoteSerializeResult;
  postFileName: string;
  metaInfo: MetaInfo;
}

export default function PostDetailPage({ mdxSource, postFileName, metaInfo }: PostProps) {
  return (
    <>
      <CustomHead {...metaInfo} />
      <div className={clsx(styles.postDetailContainer, "fade-in")}>
        <div className={styles.mdx}>
          <MDXRemote
            {...mdxSource}
            components={{
              a: FancyLink,
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
    posts[postType as keyof typeof posts].contents.map((content) => ({
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

  const mdxSource = await serialize(fileContents, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
    },
  });

  const articleData = posts[postType].contents.find(({ fileName }) => fileName === postFileName);
  if (!articleData) {
    return { notFound: true };
  }

  const metaInfo: MetaInfo = {
    title: articleData.title,
    description: articleData?.description || "",
    keywords: articleData.keywords?.join(", ") || "",
    url: `https://lurgi.github.io/${postType}/${postFileName}`,
  };

  return {
    props: { mdxSource, postFileName, metaInfo },
  };
}
