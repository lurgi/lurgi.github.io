import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "./component/layout/Layout";
import Home from "./component/home/Home";
import PostList from "./component/postList/PostList";
import PostDetail from "./component/postDetail/PostDetail";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function App() {
  const router = createBrowserRouter(
    [
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
    ],
    {
      basename: import.meta.env.BASE_URL,
    }
  );

  return (
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: {
              throwOnError: true,
            },
          },
        })
      }
    >
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
