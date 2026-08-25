import { Link } from "react-router-dom";
import Rating from "./Rating.jsx";

export default function ProductCard({ product }) {
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-ink/5">
        <img
          src={product.images?.[0]}
          alt={product.title}
          width={800}
          height={800}
          loading="lazy"
          className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {onSale && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-500 px-2.5 py-1 text-[11px] font-semibold text-white">
            Sale
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-medium text-ink/70">
            Out of stock
          </span>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink/45">{product.brand}</p>
        <h3 className="text-sm font-medium leading-snug text-ink group-hover:underline">
          {product.title}
        </h3>
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-sm font-semibold">${product.price.toFixed(2)}</span>
          {onSale && (
            <span className="text-xs text-ink/40 line-through">
              ${product.compareAtPrice.toFixed(2)}
            </span>
          )}
        </div>
        <Rating value={product.rating} count={product.reviewCount} />
      </div>
    </Link>
  );
}
