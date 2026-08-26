// On the server, we need an absolute URL (Node's fetch has no concept of a
// "current origin"). In the browser, a relative /api path is proxied by the
// Express host in dev and by your reverse proxy / hosting config in prod.
function baseUrl() {
  let url = "";
  if (typeof window === "undefined") {
    // eslint-disable-next-line no-undef
    url = (typeof process !== "undefined" && process.env.API_URL) || "http://localhost:5000/api";
  } else {
    url = import.meta.env.VITE_API_URL || "/api";
  }

  url = url.trim().replace(/\/+$/, "");
  if ((url.startsWith("http://") || url.startsWith("https://")) && !url.endsWith("/api")) {
    url = `${url}/api`;
  }
  return url;
}

async function request(path, options = {}) {
  const url = `${baseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    if (isJson) {
      const body = await res.json().catch(() => ({}));
      message = body.message || message;
    } else {
      message = `Server responded with status ${res.status} (${contentType || "HTML"}). Check VITE_API_URL setting.`;
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  if (!isJson) {
    throw new Error(
      `Expected JSON from API, but received ${contentType || "HTML"}. Verify that VITE_API_URL is correctly set in Vercel.`
    );
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
