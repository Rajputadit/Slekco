import { useLoaderData, useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import Seo from "../seo/Seo.jsx";
import ProductCard from "../components/ProductCard.jsx";
import FilterSidebar from "../components/FilterSidebar.jsx";

export async function loader({ request }) {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());

  const [productsRes, categoriesRes] = await Promise.all([
    api.getProducts(params),
    api.getCategories(),
  ]);

  return { ...productsRes, categories: categoriesRes.items, filters: params };
}

export default function Shop() {
  const { items, total, page, pages, categories, filters } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();

  function updateFilters(patch) {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    next.delete("page"); // reset pagination on filter change
    setSearchParams(next);
  }

  function goToPage(p) {
    const next = new URLSearchParams(searchParams);
    next.set("page", p);
    setSearchParams(next);
  }

  const activeQuery = filters.q;

  return (
    <>
      <Seo
        title={activeQuery ? `Search: ${activeQuery}` : "Shop all products"}
        path="/shop"
        description="Browse the full Slekco catalog across footwear, apparel, audio, home and wearables."
      />

      <div className="container-page py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl">{activeQuery ? `Results for "${activeQuery}"` : "All products"}</h1>
            <p className="mt-1 text-sm text-ink/50">{total} product{total !== 1 ? "s" : ""}</p>
          </div>
          <select
            value={filters.sort || "newest"}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="input w-auto"
            aria-label="Sort products"
          >
            <option value="newest">Newest</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-[220px_1fr]">
          <FilterSidebar categories={categories} filters={filters} onChange={updateFilters} />

          <div>
            {items.length === 0 ? (
              <p className="py-16 text-center text-ink/50">
                No products match your filters. Try clearing them.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-3">
                {items.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {pages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`h-9 w-9 rounded-full text-sm ${
                      p === page ? "bg-ink text-paper" : "text-ink/60 hover:bg-ink/5"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
