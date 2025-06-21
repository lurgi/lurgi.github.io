/* eslint-disable react/no-unescaped-entities */
import "@/styles/global.css";
import styles from "@/styles/layout.module.css";
import { Noto_Sans_KR } from "next/font/google";
import type { AppProps } from "next/app";
import Head from "next/head";
import Aside from "@/components/aside/Aside";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  preload: true,
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title key="title">박정우(러기) | 프로덕트 중심의 웹 개발자</title>
        <meta
          key="description"
          name="description"
          content="사용자 경험과 비즈니스 가치를 구현하는 풀스택 웹 개발자. 프론트엔드 기술력과 프로덕트 마인드로 디지털 제품을 만듭니다."
        />
        <meta
          key="keywords"
          name="keywords"
          content="웹 개발자, 프로덕트 개발자, 풀스택 개발자, UX 구현, 웹 서비스 개발, 디지털 프로덕트 빌더"
        />

        <meta key="og:title" property="og:title" content="박정우(러기) | 프로덕트 중심의 웹 개발자" />
        <meta
          key="og:description"
          property="og:description"
          content="사용자 경험과 비즈니스 가치를 구현하는 풀스택 웹 개발자. 프론트엔드 기술력과 프로덕트 마인드로 디지털 제품을 만듭니다."
        />
        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:url" property="og:url" content="https://lurgi.github.io/" />
        <meta key="og:image" property="og:image" content="/lurgi.webp" />

        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
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
