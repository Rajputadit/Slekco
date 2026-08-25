import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "../seo/Seo.jsx";
import QuantityStepper from "../components/QuantityStepper.jsx";
import { useCart } from "../context/CartContext.jsx";
import { api } from "../api/client.js";

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Enter a valid email";
  if (!form.line1.trim()) errors.line1 = "Address is required";
  if (!form.city.trim()) errors.city = "City is required";
  if (!form.postalCode.trim()) errors.postalCode = "Postal code is required";
  return errors;
}

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const shippingFee = subtotal > 100 || subtotal === 0 ? 0 : 9.99;
  const total = subtotal + shippingFee;

  function handleField(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleCheckout(e) {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setServerError("");
    try {
      const { order } = await api.createOrder({
        customer: { name: form.name, email: form.email, phone: form.phone },
        shippingAddress: {
          line1: form.line1, line2: form.line2, city: form.city,
          state: form.state, postalCode: form.postalCode, country: form.country,
        },
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, variant: i.variant })),
      });
      clearCart();
      navigate(`/order-confirmed/${order._id}`);
    } catch (err) {
      setServerError(err.message || "Something went wrong placing your order.");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-page flex flex-col items-center py-24 text-center">
        <Seo title="Your cart" path="/cart" noindex />
        <h1 className="text-2xl">Your cart is empty</h1>
        <p className="mt-2 text-ink/60">Find something you love and it'll show up here.</p>
        <Link to="/shop" className="btn-primary mt-6">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <Seo title="Your cart" path="/cart" noindex />
      <h1 className="text-2xl">Your cart</h1>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <ul className="divide-y divide-ink/5">
            {items.map((item) => (
              <li key={item.key} className="flex gap-4 py-5">
                <img src={item.image} alt={item.title} className="h-24 w-24 rounded-xl object-cover" />
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link to={`/product/${item.slug}`} className="font-medium hover:underline">
                        {item.title}
                      </Link>
                      {item.variant && <p className="mt-0.5 text-xs text-ink/50">Size: {item.variant}</p>}
                    </div>
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <QuantityStepper value={item.quantity} onChange={(q) => updateQuantity(item.key, q)} />
                    <button
                      onClick={() => removeItem(item.key)}
                      className="text-xs font-medium text-ink/50 underline hover:text-ink"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary + checkout form */}
        <div className="card h-fit p-6">
          <h2 className="text-lg font-medium">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-ink/70">
              <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-ink/70">
              <span>Shipping</span><span>{shippingFee === 0 ? "Free" : `$${shippingFee.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-semibold">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleCheckout} className="mt-6 space-y-3" noValidate>
            <h3 className="text-sm font-semibold">Shipping details</h3>

            <div>
              <input className="input" placeholder="Full name" value={form.name} onChange={handleField("name")} />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div>
              <input className="input" placeholder="Email" value={form.email} onChange={handleField("email")} />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>
            <input className="input" placeholder="Phone (optional)" value={form.phone} onChange={handleField("phone")} />
            <div>
              <input className="input" placeholder="Address line 1" value={form.line1} onChange={handleField("line1")} />
              {errors.line1 && <p className="mt-1 text-xs text-red-600">{errors.line1}</p>}
            </div>
            <input className="input" placeholder="Address line 2 (optional)" value={form.line2} onChange={handleField("line2")} />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input className="input" placeholder="City" value={form.city} onChange={handleField("city")} />
                {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
              </div>
              <input className="input" placeholder="State/Province" value={form.state} onChange={handleField("state")} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input className="input" placeholder="Postal code" value={form.postalCode} onChange={handleField("postalCode")} />
                {errors.postalCode && <p className="mt-1 text-xs text-red-600">{errors.postalCode}</p>}
              </div>
              <input className="input" placeholder="Country" value={form.country} onChange={handleField("country")} />
            </div>

            {serverError && <p className="text-sm text-red-600">{serverError}</p>}

            <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-50">
              {submitting ? "Placing order…" : "Place order"}
            </button>
            <p className="text-center text-[11px] text-ink/40">
              Demo checkout — no payment is collected.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
