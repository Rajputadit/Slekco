import { useLoaderData } from "react-router-dom";
import { api } from "../api/client.js";
import Seo from "../seo/Seo.jsx";
import Hero from "../components/Hero.jsx";
import CategoryStrip from "../components/CategoryStrip.jsx";
import ProductCard from "../components/ProductCard.jsx";

export async function loader() {
  const [{ items: featured }, { items: categories }] = await Promise.all([
    api.getFeatured(),
    api.getCategories(),
  ]);
  return { featured, categories };
}

export default function Home() {
  const { featured, categories } = useLoaderData();

  return (
    <>
      <Seo
        path="/"
        description="Slekco is a multipurpose e-commerce brand spanning footwear, apparel, audio, home and wearables."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Slekco",
          url: typeof window !== "undefined" ? window.location.origin : "",
        }}
      />

      <Hero />
      <CategoryStrip categories={categories} />

      <section className="container-page mt-16 mb-20">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl">Featured products</h2>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}
