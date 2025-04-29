type PostType = "Development" | "Reading" | "Insights";
type PostPreview = {
  type: PostType;
  fileName: string;
  title: string;
  date: string;
  author?: string;
  description?: string;
  keywords?: string[];
};

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN: string;
    NEXT_PUBLIC_GA_ID: string;
    NOTION_SECRET: string;
    NOTION_TOKEN_V2: string;
    NOTION_USER_ID: string;
    NOTION_DATABASE_DEVELOPMENT_ID: string;
    NOTION_DATABASE_INSIGHTS_ID: string;
    NOTION_DATABASE_READING_ID: string;
  }
}

// Prism.js 컴포넌트에 대한 타입 선언
declare module "prismjs/components/*" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: any;
  export default content;
}
