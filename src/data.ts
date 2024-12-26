import DEVELOPMENT from "@/src/statics/Development/_data";
import INSIGHTS from "@/src/statics/Insights/_data";
import READING from "@/src/statics/Reading/_data";

interface Post {
  description: string;
  contents: PostPreview[];
}

export const posts: Record<PostType, Post> = {
  Development: { description: "프로그래밍 학습 과정에서 배운 지식과 경험을 기록합니다.", contents: DEVELOPMENT },
  Insights: { description: "삶에서 얻은 지혜와 통찰을 다양한 관점에서 풀어냅니다", contents: INSIGHTS },
  Reading: {
    description: "읽은 책에서 얻은 핵심 내용을 정리하고, 개인적인 생각과 배움을 공유합니다.",
    contents: READING,
  },
};

export const postTypes = Object.keys(posts) as PostType[];
