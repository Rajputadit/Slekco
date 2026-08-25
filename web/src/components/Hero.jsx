import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="container-page pt-10 md:pt-16">
      <div className="relative overflow-hidden rounded-3xl bg-ink text-paper">
        <div className="grid gap-8 px-6 py-14 md:grid-cols-2 md:px-14 md:py-20">
          <div className="flex flex-col justify-center">
            <span className="eyebrow text-brand-300">New season, six categories</span>
            <h1 className="mt-3 text-4xl leading-[1.05] md:text-5xl">
              Everything you wear, hear, and live in — elevated.
            </h1>
            <p className="mt-4 max-w-md text-paper/70">
              Slekco brings together footwear, apparel, audio, home and wearables
              under one considered catalog. Designed well. Priced fairly.
            </p>
            <div className="mt-7 flex gap-3">
              <Link to="/shop" className="btn bg-brand-500 text-white hover:bg-brand-400">
                Shop all products
              </Link>
              <Link to="/shop?category=footwear" className="btn border border-paper/25 text-paper hover:border-paper/50">
                Explore footwear
              </Link>
            </div>
          </div>
          <div className="relative hidden md:block">
            <img
              src="https://picsum.photos/seed/slekco-hero/900/900"
              alt="Slekco product lineup"
              className="h-full w-full rounded-2xl object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
