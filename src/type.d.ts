/// <reference types="vite-plugin-svgr/client" />

type PostType = "Development" | "Reading" | "Insights";
type PostPreview = { type: PostType; fileName: string; title: string; date: string };
