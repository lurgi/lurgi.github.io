import { ComponentType, lazy, Suspense } from "react";
import { useParams } from "react-router";

function dynamicImportMDX(type: PostType, fileName: string) {
  const modules = (() => {
    switch (type) {
      case "Writing":
        return import.meta.glob("../../statics/writing/*.mdx");
      case "Reading":
        return import.meta.glob("../../statics/reading/*.mdx");
    }
  })() as Record<string, () => Promise<{ default: ComponentType<unknown> }>>;

  const path = Object.keys(modules).find((v) => v.includes(fileName));
  if (!path) throw new Error("라우트 설정을 제대로 해야지!");
  return lazy(modules[path]);
}

export default function PostDetail() {
  const { postFileName, postType } = useParams() as { postFileName: string; postType: PostType };
  if (!postFileName || !postType) throw new Error("라우트 설정을 제대로 해야지!");

  const MDX = dynamicImportMDX(postType, postFileName);

  return <Suspense fallback={<div>Loading...</div>}>{<MDX />}</Suspense>;
}
