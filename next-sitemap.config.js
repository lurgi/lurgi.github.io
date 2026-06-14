/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://lurgi.github.io",
  generateRobotsTxt: true,
  outDir: "./out",
  generateIndexSitemap: false,
  sitemapSize: 7000,
  changefreq: "weekly",
  priority: 0.7,
  exclude: ["/api/*"],
  transform: async (config, path) => {
    const notionPath = "notion/";
    const isNotionPath = path.includes(notionPath);

    if (isNotionPath) {
      return { loc: path, priority: 0.8, changefreq: "weekly" };
    }
    return { loc: path, priority: 0.7, changefreq: "weekly" };
  },
};
