import "@/styles/global.css";
import styles from "@/styles/layout.module.css";
import { Noto_Sans_KR } from "next/font/google";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import Aside from "@/components/aside/Aside";
import ExternalLinks from "@/components/externalLinks/ExternalLinks";
import { SelectedNotionPost } from "@/utils/getSelectedNotionPosts";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  preload: true,
});

interface SharedPageProps {
  selectedNotionPosts?: SelectedNotionPost[];
}

export default function MyApp({
  Component,
  pageProps,
}: AppProps<SharedPageProps>) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title key="title">박정우(러기) | 사람을 이해하는 웹 개발자</title>
        <meta
          key="description"
          name="description"
          content="사람이 기술을 이해하고 자신의 의도대로 사용할 수 있는 웹을 만듭니다. 기술과 사람 사이에서 생기는 문제를 고민합니다."
        />
        <meta
          key="og:title"
          property="og:title"
          content="박정우(러기) | 사람을 이해하는 웹 개발자"
        />
        <meta
          key="og:description"
          property="og:description"
          content="사람이 기술을 이해하고 자신의 의도대로 사용할 수 있는 웹을 만듭니다. 기술과 사람 사이에서 생기는 문제를 고민합니다."
        />
        <meta key="og:type" property="og:type" content="website" />
        <meta
          key="og:url"
          property="og:url"
          content="https://lurgi.github.io/"
        />
        <meta key="og:image" property="og:image" content="/lurgi.webp" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="박정우(러기) RSS"
          href="https://lurgi.github.io/feed.xml"
        />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>

      <div className={`${notoSansKr.className} ${styles.layout}`}>
        <Aside selectedNotionPosts={pageProps.selectedNotionPosts} />
        <main className={styles.main}>
          <Component key={router.asPath} {...pageProps} />
        </main>
        <footer className={styles.footer} aria-label="외부 링크">
          <ExternalLinks />
        </footer>
      </div>
    </>
  );
}
