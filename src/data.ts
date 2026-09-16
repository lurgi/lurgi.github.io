interface Post {
  description: string;
}

export const posts: Record<PostType, Post> = {
  Development: {
    description: "프로그래밍 학습 과정에서 배운 지식과 경험을 기록합니다.",
  },
  Reading: {
    description: "읽은 책에서 얻은 배움을 통한 생각을 이야기합니다.",
  },
  Insights: {
    description: "삶에서 얻은 지혜와 통찰을 다양한 관점에서 풀어냅니다.",
  },
};

export const postTypes = Object.keys(posts) as PostType[];
