/* eslint-disable @typescript-eslint/no-require-imports */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  staticPageGenerationTimeout: 300,
  basePath: "",
  assetPrefix: "/",
  reactStrictMode: true,
  transpilePackages: ["react-syntax-highlighter"],
  experimental: {
    mdxRs: true,
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            icon: true,
          },
        },
      ],
    });

    return config;
  },
};

export default nextConfig;
