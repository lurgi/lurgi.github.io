/* eslint-disable react/no-unescaped-entities */
import "@/styles/global.css";
import styles from "@/styles/layout.module.css";
import { Noto_Sans_KR } from "next/font/google";
import type { AppProps } from "next/app";
import Head from "next/head";
import Aside from "@/components/aside/Aside";

import "react-notion-x/src/styles.css";
import "prismjs/themes/prism-tomorrow.css";
import "katex/dist/katex.min.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name="description"
          content="개발자 박정우(러기)의 개인 블로그. 개발, 인사이트, 독서, 사진등 일상을 공유합니다."
        />
        <title>Lurgi's blog</title>
      </Head>
      <div className={`${notoSansKr.className} ${styles.layout}`}>
        <Aside />
        <main className={styles.main}>
          <Component {...pageProps} />
        </main>
      </div>
    </>
  );
}
