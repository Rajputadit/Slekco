import { useState } from "react";
import { useLoaderData } from "react-router-dom";
import { api } from "../api/client.js";
import Seo from "../seo/Seo.jsx";
import Rating from "../components/Rating.jsx";
import QuantityStepper from "../components/QuantityStepper.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { useCart } from "../context/CartContext.jsx";

export async function loader({ params }) {
  const data = await api.getProduct(params.slug);
  return data; // { product, related }
}

export default function ProductDetail() {
  const { product, related } = useLoaderData();
  const { addItem } = useCart();

  const sizeOptions = [...new Set(product.variants.filter((v) => v.label === "Size").map((v) => v.value))];
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0] || "");
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;

  function handleAddToCart() {
    addItem(product, qty, selectedSize);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  }

  return (
    <>
      <Seo
        title={product.seo?.metaTitle || product.title}
        description={product.seo?.metaDescription || product.shortDescription}
        path={`/product/${product.slug}`}
        image={product.images?.[0]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          image: product.images,
          description: product.description,
          brand: { "@type": "Brand", name: product.brand },
          sku: product.sku,
          offers: {
            "@type": "Offer",
            priceCurrency: product.currency,
            price: product.price,
            availability:
              product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          },
          aggregateRating: product.reviewCount
            ? {
                "@type": "AggregateRating",
                ratingValue: product.rating,
                reviewCount: product.reviewCount,
              }
            : undefined,
        }}
      />

      <div className="container-page py-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {/* Gallery */}
          <div>
            <div className="overflow-hidden rounded-2xl bg-ink/5">
              <img
                src={product.images[activeImage]}
                alt={product.title}
                className="aspect-square w-full object-cover"
              />
            </div>
            <div className="mt-3 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded-xl border-2 ${
                    i === activeImage ? "border-ink" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink/45">{product.brand}</p>
            <h1 className="mt-1 text-3xl">{product.title}</h1>
            <div className="mt-2">
              <Rating value={product.rating} count={product.reviewCount} size="md" />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-semibold">${product.price.toFixed(2)}</span>
              {onSale && (
                <span className="text-base text-ink/40 line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>

            <p className="mt-5 max-w-md text-sm leading-relaxed text-ink/70">{product.description}</p>

            {sizeOptions.length > 0 && (
              <div className="mt-6">
                <div className="label">Size</div>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-10 min-w-10 rounded-lg border px-3 text-sm font-medium ${
                        selectedSize === size
                          ? "border-ink bg-ink text-paper"
                          : "border-ink/15 text-ink/70 hover:border-ink/40"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-7 flex items-center gap-4">
              <QuantityStepper value={qty} onChange={setQty} />
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {product.stock === 0 ? "Out of stock" : justAdded ? "Added ✓" : "Add to cart"}
              </button>
            </div>

            <p className="mt-3 text-xs text-ink/45">
              {product.stock > 0 ? `${product.stock} in stock` : "Currently unavailable"} · SKU {product.sku}
            </p>
          </div>
        </div>

        {related?.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl">You may also like</h2>
            <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
