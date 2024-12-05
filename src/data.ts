export const posts: Record<PostType, PostPreview[]> = {
  Writing: [
    {
      id: "1",
      type: "Writing",
      title: "Paint 이전 Macro Task가 실행될 가능성과 React의 useEffect",
      fileName: "Possibility-of-Macro-Tasks-Being-Executed-Before-Paint-and-React-useEffect",
      date: "2024-11-28",
    },
    {
      id: "2",
      type: "Writing",
      title: "옵저버 패턴과 Tanstack Query에서의 옵저버 패턴",
      fileName: "Observer-Pattern-and-the-Use-of-Observer-Pattern-in-TanStack-Query",
      date: "2024-04-08",
    },
  ],
  Reading: [
    // { id: "1", type: "Reading", title: "용서할 줄 안다는 것", date: "2024-9-15" }
  ],
};

export const postTypes = Object.keys(posts) as PostType[];
