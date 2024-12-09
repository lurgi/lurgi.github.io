import { ComponentType, lazy, Suspense } from "react";
import { useParams } from "react-router";
import styles from "./PostDetail.module.css";

import type { MDXComponents } from "mdx/types.js";
import FancyLink from "../MDXComponents/FancyLink/FancyLink";
import FancyCode from "../MDXComponents/FancyCode/FancyCode";
import FancyImage from "../MDXComponents/FancyImage/FancyImage";
import Bat from "../loading/bat/Bat";
import CustomGiscus from "../customGiscus/CustomGiscus";

function dynamicImportMDX(type: PostType, fileName: string) {
  const modules = (() => {
    switch (type) {
      case "Development":
        return import.meta.glob("../../statics/development/*.mdx");
      case "Reading":
        return import.meta.glob("../../statics/reading/*.mdx");
      case "Insights":
        return import.meta.glob("../../statics/insights/*.mdx");
    }
  })() as Record<string, () => Promise<{ default: ComponentType<MDXComponents> }>>;

  const path = Object.keys(modules).find((v) => v.includes(fileName));
  if (!path) throw new Error("라우트 설정을 제대로 해야지!");
  return lazy(modules[path]);
}

export default function PostDetail() {
  const { postFileName, postType } = useParams() as { postFileName: string; postType: PostType };
  if (!postFileName || !postType) throw new Error("라우트 설정을 제대로 해야지!");

  const MDX = dynamicImportMDX(postType, postFileName);

  return (
    <div className={styles.postDetailContainer}>
      <Suspense
        fallback={
          <div className={styles["loading-container"]}>
            <Bat />
          </div>
        }
      >
        <div className={styles["fade-in"]}>
          <MDX components={{ a: FancyLink, code: FancyCode, img: FancyImage }} />
        </div>
      </Suspense>
      <CustomGiscus />
    </div>
  );
}
