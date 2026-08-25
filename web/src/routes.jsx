import App from "./App.jsx";
import Home, { loader as homeLoader } from "./pages/Home.jsx";
import Shop, { loader as shopLoader } from "./pages/Shop.jsx";
import ProductDetail, { loader as productLoader } from "./pages/ProductDetail.jsx";
import CartPage from "./pages/CartPage.jsx";
import OrderConfirmed, { loader as orderLoader } from "./pages/OrderConfirmed.jsx";
import Contact from "./pages/Contact.jsx";
import NotFound from "./pages/NotFound.jsx";

const routes = [
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home />, loader: homeLoader },
      { path: "shop", element: <Shop />, loader: shopLoader },
      { path: "product/:slug", element: <ProductDetail />, loader: productLoader },
      { path: "cart", element: <CartPage /> },
      { path: "order-confirmed/:id", element: <OrderConfirmed />, loader: orderLoader },
      { path: "contact", element: <Contact /> },
      { path: "*", element: <NotFound /> },
    ],
  },
];

export default routes;
