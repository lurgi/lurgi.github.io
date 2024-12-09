import DEVELOPMENT from "./statics/development/_data";
import INSIGHTS from "./statics/insights/_data";
import READING from "./statics/reading/_data";

export const posts: Record<PostType, PostPreview[]> = {
  Development: DEVELOPMENT,
  Insights: INSIGHTS,
  Reading: READING,
};

export const postTypes = Object.keys(posts) as PostType[];
