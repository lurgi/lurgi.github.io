type PostType = "Development" | "Reading" | "Insights" | "Driply";
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
  }
}
