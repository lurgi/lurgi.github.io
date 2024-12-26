import styles from "@/styles/PostDetailPage.module.css";

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import { GetStaticProps } from "next";

import { posts } from "@/src/data";
import Giscus from "@/components/customGiscus/CustomGiscus";
import FancyLink from "@/components/MDXComponents/FancyLink/FancyLink";
import FancyCode from "@/components/MDXComponents/FancyCode/FancyCode";
import FancyImage from "@/components/MDXComponents/FancyImage/FancyImage";

import fs from "fs";
import path from "path";

interface PostProps {
  mdxSource: MDXRemoteSerializeResult;
  postFileName: string;
  postType: PostType;
}

export default function PostDetailPage({ mdxSource, postFileName }: PostProps) {
  return (
    <div className={styles.postDetailContainer}>
      <div className={styles["fade-in"]}>
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
  const { postType, postFileName } = context.params as { postType: string; postFileName: string };

  if (!postType || !postFileName) {
    return { notFound: true };
  }

  const filePath = path.join(process.cwd(), "src", "statics", postType.toLowerCase(), `${postFileName}.mdx`);
  const fileContents = fs.readFileSync(filePath, "utf-8");

  if (!fileContents) {
    return { notFound: true };
  }

  const mdxSource = await serialize(fileContents);

  return {
    props: { mdxSource, postFileName, postType },
  };
}
