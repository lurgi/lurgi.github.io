import { createHashRouter, RouterProvider } from "react-router";
import Layout from "./component/layout/Layout";
import PostList from "./component/postList/PostList";

function App() {
  const router = createHashRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { path: "/", element: <PostList /> },
        {
          path: "/:postType",
          element: <PostList />,
        },
        // {
        //   path: "/:postType/:id",
        //   element: <Post />,
        // },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
