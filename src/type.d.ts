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
