import { hydrateRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import routes from "./routes.jsx";
import "./index.css";

const router = createBrowserRouter(routes, {
  hydrationData: window.__STATIC_ROUTER_HYDRATION_DATA__ || undefined,
});

hydrateRoot(
  document.getElementById("root"),
  <HelmetProvider>
    <RouterProvider router={router} />
  </HelmetProvider>
);
