import { Link } from "react-router-dom";

export default function CategoryStrip({ categories = [] }) {
  return (
    <section className="container-page mt-16">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl">Shop by category</h2>
        <Link to="/shop" className="text-sm font-medium text-ink/60 hover:text-ink">
          View all →
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            to={`/shop?category=${cat.slug}`}
            className="group overflow-hidden rounded-2xl bg-ink/5"
          >
            <div className="relative aspect-square">
              <img
                src={cat.image}
                alt={cat.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0" />
              <span className="absolute bottom-3 left-3 text-sm font-medium text-white">
                {cat.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
