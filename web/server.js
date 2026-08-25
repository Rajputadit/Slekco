import fs from "node:fs/promises";
import express from "express";
import compression from "compression";

const isProduction = process.env.NODE_ENV === "production";
const port = process.env.PORT || 3000;
const base = process.env.BASE || "/";
const apiUrl = process.env.API_URL || "http://localhost:5000/api";

const templateHtml = isProduction
  ? await fs.readFile("./dist/client/index.html", "utf-8")
  : "";

const app = express();
app.disable("x-powered-by");

let vite;
if (!isProduction) {
  const { createServer } = await import("vite");
  vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
    base,
  });
  app.use(vite.middlewares);
} else {
  app.use(compression());
  const sirv = (await import("sirv")).default;
  app.use(base, sirv("./dist/client", { extensions: [] }));
}

// --- SEO: robots.txt + a live sitemap.xml built from the product API ---
app.get("/robots.txt", (req, res) => {
  const origin = `${req.protocol}://${req.get("host")}`;
  res.type("text/plain").send(`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
});

app.get("/sitemap.xml", async (req, res) => {
  const origin = `${req.protocol}://${req.get("host")}`;
  const staticUrls = ["/", "/shop", "/contact"];

  let productUrls = [];
  try {
    const r = await fetch(`${apiUrl}/products?limit=48`);
    const data = await r.json();
    productUrls = (data.items || []).map((p) => `/product/${p.slug}`);
  } catch {
    // API unreachable - still return a sitemap with static routes
  }

  const urls = [...staticUrls, ...productUrls]
    .map((u) => `  <url><loc>${origin}${u}</loc></url>`)
    .join("\n");

  res.type("application/xml").send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`
  );
});

// --- SSR handler for every other route ---
app.use("*", async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, "/");

    let template;
    let render;
    if (!isProduction) {
      template = await fs.readFile("./index.html", "utf-8");
      template = await vite.transformIndexHtml(url, template);
      render = (await vite.ssrLoadModule("/src/entry-server.jsx")).render;
    } else {
      template = templateHtml;
      render = (await import("./dist/server/entry-server.js")).render;
    }

    const { html: appHtml, head, hydrationData, redirect, statusCode } = await render(
      url,
      new Headers(req.headers)
    );

    if (redirect) {
      const location = redirect.headers.get("location") || "/";
      return res.redirect(redirect.status || 302, location);
    }

    // Escape "</" so a payload can't break out of the inline <script> tag.
    const safeData = JSON.stringify(hydrationData).replace(/</g, "\\u003c");

    const html = template
      .replace("<!--app-head-->", head ?? "")
      .replace("<!--app-html-->", appHtml ?? "")
      .replace(
        "window.__STATIC_ROUTER_HYDRATION_DATA__ = /*app-hydration-data*/ null;",
        `window.__STATIC_ROUTER_HYDRATION_DATA__ = ${safeData};`
      );

    res.status(statusCode || 200).set({ "Content-Type": "text/html" }).send(html);
  } catch (e) {
    vite?.ssrFixStacktrace(e);
    console.error(e.stack);
    res.status(500).end(e.stack);
  }
});

app.listen(port, () => {
  console.log(`[web] Slekco storefront (SSR) running on http://localhost:${port}`);
});
