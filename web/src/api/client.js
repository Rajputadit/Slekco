// On the server, we need an absolute URL (Node's fetch has no concept of a
// "current origin"). In the browser, a relative /api path is proxied by the
// Express host in dev and by your reverse proxy / hosting config in prod.
function baseUrl() {
  if (typeof window === "undefined") {
    // eslint-disable-next-line no-undef
    return (typeof process !== "undefined" && process.env.API_URL) || "http://localhost:5000/api";
  }
  return import.meta.env.VITE_API_URL || "/api";
}

async function request(path, options = {}) {
  const res = await fetch(`${baseUrl()}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.message || `Request failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export const api = {
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
    ).toString();
    return request(`/products${qs ? `?${qs}` : ""}`);
  },
  getProduct: (slug) => request(`/products/${slug}`),
  getFeatured: () => request(`/products/featured`),
  getCategories: () => request(`/categories`),
  createOrder: (payload) =>
    request(`/orders`, { method: "POST", body: JSON.stringify(payload) }),
  sendContactLead: (payload) =>
    request(`/contact`, { method: "POST", body: JSON.stringify(payload) }),
};
