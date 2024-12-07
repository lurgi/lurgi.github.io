import { createHashRouter, RouterProvider } from "react-router";
import Layout from "./component/layout/Layout";
import Home from "./component/home/Home";
import PostList from "./component/postList/PostList";
import PostDetail from "./component/postDetail/PostDetail";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function App() {
  const router = createHashRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { path: "/", element: <Home /> },
        {
          path: "/:postType",
          element: <PostList />,
        },
        {
          path: "/:postType/:postFileName",
          element: <PostDetail />,
        },
      ],
    },
  ]);

  return (
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
