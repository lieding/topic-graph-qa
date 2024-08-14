import { createBrowserRouter } from "react-router-dom";
import IndexPage from "./pages/indexPage/index";
import EditorPage from './pages/editor';
import Knowledge from "./pages/knowledge";

export const routes = [
  {
    path: "/",
    element: <IndexPage />,
  },
  {
    path: '/knowledge',
    element: <Knowledge />
  },
  {
    path: "/editor/:topic/:subTopic",
    element: (<EditorPage />),
  }
];

const router = createBrowserRouter(routes);

export default router;