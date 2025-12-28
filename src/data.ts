import DEVELOPMENT from "@/src/statics/development/_data";
import INSIGHTS from "@/src/statics/insights/_data";
import READING from "@/src/statics/reading/_data";

interface Post {
  description: string;
  contents?: PostPreview[];
}

export const posts: Record<PostType, Post> = {
  Development: {
    description: "프로그래밍 학습 과정에서 배운 지식과 경험을 기록합니다.",
    contents: DEVELOPMENT,
  },
  YogaLogs: {
    description:
      "요가 수련 기록. 나만의 속도로 성장하는 과정을 담은 월지입니다.",
  },
  Insights: {
    description: "삶에서 얻은 지혜와 통찰을 다양한 관점에서 풀어냅니다.",
    contents: INSIGHTS,
  },
  Reading: {
    description: "읽은 책에서 얻은 배움을 통한 생각을 이야기합니다.",
    contents: READING,
  },
};

export const postTypes = Object.keys(posts) as PostType[];
