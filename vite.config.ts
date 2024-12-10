import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import svgr from "vite-plugin-svgr";
import remarkGfm from "remark-gfm";

import path from "path";
import fs from "fs";

const generateDynamicRoutes = async () => {
  const { posts } = await import("./src/data");

  const routes: { url: string; lastmod: string }[] = [];
  Object.entries(posts).forEach(([type, postList]) => {
    postList.forEach((post) => {
      routes.push({
        url: `/post/${type}/${post.fileName}`,
        lastmod: post.date,
      });
    });
  });
  return routes;
};

/**
 * siteMap의 priority를 계산합니다.
 * STALE_DAY일 이내의 글은 priority를 0.9로, 이 전의 글은 0.7로 설정합니다.
 */
const calculatePriority = (date: string): string => {
  const STALE_DAY = 50;
  const postDate = new Date(date);
  const currentDate = new Date();
  const timeDifference = (currentDate.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24);

  return timeDifference <= STALE_DAY ? "0.9" : "0.7";
};

const generateSiteMap = (routes: { url: string; lastmod: string }[]) => {
  const baseUrl = "https://lurgi.github.io";
  const changefreq = "monthly";

  const urls = routes.map(
    (route) => `
  <url>
    <loc>${baseUrl}${route.url}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${calculatePriority(route.lastmod)}</priority>
  </url>`
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.join("")}
  </urlset>`;
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mdx({ remarkPlugins: [remarkGfm] }),
    svgr(),
    {
      name: "generate-sitemap",
      async closeBundle() {
        const routes = await generateDynamicRoutes();
        const sitemap = generateSiteMap(routes);

        const outputPath = path.resolve(__dirname, "dist", "sitemap.xml");
        fs.writeFileSync(outputPath, sitemap, "utf-8");
        console.log("✅ sitemap.xml 생성 완료");
      },
    },
  ],
});
