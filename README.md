# Slekco — Multipurpose E-Commerce Storefront

A full-stack MERN e-commerce experience for **Slekco**, a multi-brand,
multi-category retailer (footwear, apparel, audio, home, accessories,
wearables). Built as a technical assessment; see [AI-assisted development](#ai-assisted-development)
below for how AI tools were used.

**Live site:** _add your deployed URL here_
**API:** _add your deployed API URL here_

---

## 1. Tech stack

| Layer      | Choice                                                                 |
|------------|-------------------------------------------------------------------------|
| Frontend   | React 18, React Router 6 (data routers), custom **server-side rendering**, Tailwind CSS |
| SSR host   | Express + Vite (dev: Vite middleware mode; prod: pre-built SSR bundle) |
| Backend    | Node.js + Express (REST API)                                          |
| Database   | MongoDB + Mongoose                                                     |
| SEO        | True HTML SSR, `react-helmet-async`, JSON-LD structured data, dynamic `sitemap.xml` / `robots.txt` |

This is deliberately **not** Next.js. The brief asked for MERN, and Next.js
quietly swaps out the "R" for a meta-framework with its own routing/data
conventions. Instead, the `web/` app is a plain React SPA that is
**server-rendered by hand** using Vite's official SSR guide + React Router's
`createStaticHandler` / `StaticRouterProvider` data APIs, so every page is
fully-formed HTML on first response (view-source shows real content, not an
empty `<div id="root">`), and the client then hydrates and takes over as an
SPA. This was the most technically demanding option of the three we
discussed, and the one that best demonstrates understanding of how SSR
actually works under the hood rather than relying on a framework to hide it.

## 2. Architecture

```
slekco/
├── api/                    Express REST API (port 5000)
│   └── src/
│       ├── models/         Mongoose schemas: Product, Category, User, Order, ContactLead
│       ├── controllers/    Route handlers (search/filter, order pricing, etc.)
│       ├── routes/         /api/products, /api/categories, /api/orders, /api/contact
│       ├── middleware/     Error handling
│       ├── config/db.js    MongoDB connection
│       └── seed/seed.js    Populates demo catalog data
│
└── web/                     React SSR storefront (port 3000)
    ├── server.js            Custom Express host: Vite middleware (dev) / built bundle (prod)
    ├── src/
    │   ├── entry-server.jsx  Renders a request to HTML using React Router's static data APIs
    │   ├── entry-client.jsx  Hydrates the server markup, takes over client-side routing
    │   ├── routes.jsx        Shared route table (used by both entries) with per-page loaders
    │   ├── pages/             Home, Shop, ProductDetail, CartPage, Contact, OrderConfirmed...
    │   ├── components/        Navbar, ProductCard, FilterSidebar, QuantityStepper...
    │   ├── context/CartContext.jsx  Client cart state, persisted to localStorage
    │   ├── api/client.js       Isomorphic fetch wrapper (resolves the right base URL server vs. browser)
    │   └── seo/Seo.jsx         react-helmet-async wrapper (title/meta/OG/Twitter/JSON-LD)
    └── index.html             Shell template with SSR injection markers
```

**Request flow (SSR):**
1. Browser (or crawler) requests `/product/aero-runner-sneakers`.
2. `web/server.js` matches the URL against `routes.jsx`, calls
   `entry-server.jsx`'s `render()`.
3. React Router's `createStaticHandler` runs the matched route's `loader()`
   — which calls the API (`GET /api/products/:slug`) — **on the server**,
   before any HTML is produced.
4. `renderToString` produces full HTML for that exact product, `Seo.jsx`
   contributes title/meta/JSON-LD via Helmet, and the result is injected
   into `index.html`.
5. The server also serializes the loader's data into
   `window.__STATIC_ROUTER_HYDRATION_DATA__` so the client doesn't
   re-fetch the same data on load.
6. `entry-client.jsx` hydrates using `createBrowserRouter` with that
   hydration data, and the app behaves as a normal client-routed SPA from
   then on (no page reloads when navigating the catalog).

**Why the frontend never embeds product data directly:** every page's data
comes from a `loader()` function that calls `src/api/client.js`, which in
turn calls the Express API. The API is the single source of truth; the
React app is a pure consumer of it, whether it's rendering on the server or
in the browser.

## 3. Database structure

MongoDB via Mongoose. Four core collections:

**Users** (`api/src/models/User.js`)
```
name, email (unique), passwordHash, role [customer|admin], addresses[]
```
_No password/JWT auth flow is wired up in this assessment (out of scope per
the brief's "complete checkout/payment system is not required" spirit —
same logic applies to full auth). The schema exists to show the intended
shape; see [Authentication approach](#authentication-approach-not-implemented) for how it would be added._

**Categories** (`api/src/models/Category.js`)
```
name, slug (unique), description, image, brand, featured
```

**Products** (`api/src/models/Product.js`)
```
title, slug (unique), brand, description, price, compareAtPrice,
category (ref Category), images[], variants[{label, value}],
stock, sku (unique), rating, reviewCount, tags[], isFeatured, isActive,
seo: { metaTitle, metaDescription }
```
Indexed with a MongoDB text index on `title/description/brand/tags` for
search, plus indexes on `slug`, `category`, and `brand` for fast filtering.

**Orders** (`api/src/models/Order.js`)
```
user (ref User, nullable — guest checkout supported),
customer: { name, email, phone },
shippingAddress: { line1, line2, city, state, postalCode, country },
items: [{ product (ref), title, price, quantity, variant }],  // price snapshot at order time
subtotal, shippingFee, total,
status [pending|confirmed|shipped|delivered|cancelled],
paymentStatus [unpaid|paid]
```

**ContactLead** — a small extra collection backing the `/api/contact`
endpoint (the "lead API" option from the brief).

Entity relationships: `Product.category → Category._id`,
`Order.items[].product → Product._id`, `Order.user → User._id` (optional).

## 4. API endpoints

| Method | Path                     | Description                                      |
|--------|--------------------------|---------------------------------------------------|
| GET    | `/api/products`          | List products — supports `q`, `category`, `brand`, `minPrice`, `maxPrice`, `sort`, `page`, `limit` |
| GET    | `/api/products/featured` | Featured products for the homepage                |
| GET    | `/api/products/:slug`    | Single product + related products                 |
| GET    | `/api/categories`        | All categories                                     |
| POST   | `/api/orders`            | Create an order. **Server re-prices every line from the DB** — client-sent prices are never trusted |
| GET    | `/api/orders/:id`        | Fetch an order (used by the confirmation page)     |
| POST   | `/api/contact`           | Submit a contact/lead form                         |
| GET    | `/api/health`            | Health check                                       |

## 5. SEO implementation

- **True SSR**, not client-only meta tag injection — crawlers receive fully
  rendered HTML on the first response for every route.
- Per-page `<title>`, meta description, canonical URL, Open Graph and
  Twitter Card tags via `react-helmet-async` (`src/seo/Seo.jsx`).
- `Product` and `Organization` **JSON-LD structured data** on the relevant
  pages, for rich results.
- Dynamic `/sitemap.xml` (built live from the product catalog) and
  `/robots.txt`, served directly by `web/server.js`.
- Semantic HTML (`<nav>`, `<main>`, `<footer>`, one `<h1>` per page,
  `alt` text on all product images).
- `noindex` applied to transient/private pages (cart, order confirmation).

## 6. Setup instructions

**Requirements:** Node 18+, a MongoDB instance (local or Atlas).

```bash
# 1. API
cd api
cp .env.example .env        # edit MONGO_URI if needed
npm install
npm run seed                 # populates categories + demo products
npm run dev                   # http://localhost:5000

# 2. Web (in a second terminal)
cd web
cp .env.example .env
npm install
npm run dev                   # http://localhost:3000
```

Visit `http://localhost:3000`. The web SSR server calls the API server at
`API_URL` (server-side) / `VITE_API_URL` (browser-side) — see `.env.example`
in each folder.

**Production build:**
```bash
cd web
npm run build      # builds dist/client (browser bundle) and dist/server (SSR bundle)
NODE_ENV=production npm start
```

## 7. Deployment

This app needs a **long-running Node process** for the web app (custom SSR
isn't a static site or a serverless function in this setup), so:

- **API** → Render / Railway / a small VPS. Set `MONGO_URI` (MongoDB Atlas
  connection string) and `CLIENT_ORIGIN` (the deployed web app's URL, for
  CORS) as environment variables. Start command: `npm start`.
- **Web** → Render / Railway / a VPS running `npm run build && npm start`.
  Set `API_URL` and `VITE_API_URL` to the deployed API's URL.
- **MongoDB** → MongoDB Atlas free tier, whitelist the API host's IP (or
  `0.0.0.0/0` for simplicity in a demo).

(Vercel is a great fit for Next.js but is awkward for a hand-rolled
long-lived SSR Express process — that's part of why we called this out as
a tradeoff of the "true MERN + custom SSR" choice up front.)

## 8. Authentication approach (not implemented)

Out of scope for this assessment, but the `User` model is already shaped
for it. The intended approach: `bcrypt` for password hashing, short-lived
JWT access tokens returned from `POST /api/auth/login` and verified by an
Express middleware (`req.user`), with `Order.user` populated when a
logged-in user checks out instead of staying `null` (guest checkout).

## 9. Security notes

- Order totals are **always recalculated server-side** from the current
  product prices in MongoDB — the client cannot manipulate the price paid.
- `helmet` for HTTP security headers, `express-rate-limit` on the API,
  strict CORS via `CLIENT_ORIGIN`.
- Inline hydration JSON is escaped (`<` → `\u003c`) before being embedded
  in a `<script>` tag to prevent script-breakout XSS.
- All form input is validated both client-side (immediate feedback) and
  server-side (the actual security boundary).

## 10. AI-assisted development

- **Tool used:** Claude (Anthropic), used conversationally to scaffold
  this project end-to-end from the assessment brief.
- **Where it helped:** initial architecture decisions (weighing Next.js vs.
  hand-rolled Express+Vite SSR for a MERN brief), generating the Mongoose
  schemas and REST controllers, the React Router SSR wiring
  (`entry-server.jsx` / `entry-client.jsx`), and first-draft Tailwind UI
  for each page.
- **Example of AI output that was modified:** the initial `server.js`
  suggestion served the client bundle but didn't escape the JSON injected
  into the hydration `<script>` tag — a real XSS risk if any loader data
  ever included user-controlled strings (e.g. an order confirmation page
  echoing a customer-submitted name). That was corrected by adding
  `.replace(/</g, "\\u003c")` before interpolating the hydration payload,
  and by making sure `/api/orders` recalculates prices server-side rather
  than trusting whatever the client cart sends.

## 11. What's intentionally out of scope

- Payment processing (per the brief).
- Full authentication/authorization (see §8).
- Automated test suite — given the 24-hour window, effort went into a
  working, explainable full-stack implementation over test coverage.
# Slekco
