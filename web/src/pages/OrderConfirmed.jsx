import { Link, useLoaderData } from "react-router-dom";
import Seo from "../seo/Seo.jsx";
import { api } from "../api/client.js";

export async function loader({ params }) {
  const data = await api.getOrder(params.id);
  return data; // { order }
}

export default function OrderConfirmed() {
  const { order } = useLoaderData();

  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <Seo title="Order confirmed" path={`/order-confirmed/${order._id}`} noindex />
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600">
        ✓
      </div>
      <h1 className="mt-5 text-3xl">Order confirmed</h1>
      <p className="mt-2 max-w-md text-ink/60">
        Thanks, {order.customer.name.split(" ")[0]}. A confirmation has been recorded for order{" "}
        <span className="font-medium text-ink">#{order._id.slice(-8).toUpperCase()}</span>.
      </p>
      <p className="mt-1 text-sm font-semibold">Total: ${order.total.toFixed(2)}</p>
      <Link to="/shop" className="btn-primary mt-8">Continue shopping</Link>
    </div>
  );
}
