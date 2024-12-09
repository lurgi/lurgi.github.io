import { useParams } from "react-router";
import Giscus from "@giscus/react";

export default function CustomGiscus() {
  const theme = "light";
  const { postFileName } = useParams() as { postFileName: string };

  return (
    <Giscus
      id="comments"
      repo="lurgi/lurgi.github.io"
      repoId="R_kgDONXhXsQ"
      category="General"
      categoryId="DIC_kwDONXhXsc4ClDdL"
      mapping="specific"
      term={postFileName}
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="bottom"
      theme={theme}
      lang="ko"
      loading="lazy"
    />
  );
}
