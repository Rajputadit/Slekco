import "dotenv/config";
import mongoose from "mongoose";
import slugify from "slugify";
import { connectDB } from "../config/db.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

const categoriesData = [
  { name: "Footwear", brand: "Slekco Sport", featured: true, description: "Running, training and lifestyle shoes." },
  { name: "Apparel", brand: "Slekco Wear", featured: true, description: "Everyday and performance clothing." },
  { name: "Audio", brand: "Slekco Tech", featured: true, description: "Headphones, earbuds and speakers." },
  { name: "Home & Living", brand: "Slekco Home", featured: false, description: "Furniture and decor for modern spaces." },
  { name: "Accessories", brand: "Slekco Wear", featured: false, description: "Bags, belts and everyday carry." },
  { name: "Wearables", brand: "Slekco Tech", featured: true, description: "Smartwatches and fitness trackers." },
];

const img = (seed) => `https://picsum.photos/seed/${seed}/800/800`;

function buildProducts(categoryMap) {
  const raw = [
    // Footwear
    { title: "Aero Runner Sneakers", brand: "Slekco Sport", category: "Footwear", price: 89.99, compareAtPrice: 109.99, stock: 42, tags: ["running", "sneakers", "sport"], featured: true },
    { title: "Trailblaze Hiking Boots", brand: "Slekco Sport", category: "Footwear", price: 129.0, stock: 18, tags: ["hiking", "boots", "outdoor"] },
    { title: "Court Classic Sneakers", brand: "Slekco Sport", category: "Footwear", price: 74.5, stock: 60, tags: ["sneakers", "lifestyle"] },
    { title: "Featherlite Training Shoes", brand: "Slekco Sport", category: "Footwear", price: 95.0, stock: 33, tags: ["training", "gym"] },

    // Apparel
    { title: "Everyday Merino Tee", brand: "Slekco Wear", category: "Apparel", price: 34.0, stock: 80, tags: ["tshirt", "basics"], featured: true },
    { title: "Performance Zip Hoodie", brand: "Slekco Wear", category: "Apparel", price: 68.0, compareAtPrice: 82.0, stock: 25, tags: ["hoodie", "outerwear"] },
    { title: "FlexFit Joggers", brand: "Slekco Wear", category: "Apparel", price: 54.0, stock: 40, tags: ["joggers", "bottoms"] },
    { title: "Windshell Packable Jacket", brand: "Slekco Wear", category: "Apparel", price: 89.0, stock: 15, tags: ["jacket", "outdoor"] },

    // Audio
    { title: "Pulse ANC Wireless Earbuds", brand: "Slekco Tech", category: "Audio", price: 119.0, compareAtPrice: 149.0, stock: 50, tags: ["earbuds", "wireless", "anc"], featured: true },
    { title: "Resonance Over-Ear Headphones", brand: "Slekco Tech", category: "Audio", price: 179.0, stock: 20, tags: ["headphones", "studio"] },
    { title: "Orb Mini Bluetooth Speaker", brand: "Slekco Tech", category: "Audio", price: 49.0, stock: 70, tags: ["speaker", "portable"] },

    // Home & Living
    { title: "Nimbus Lounge Chair", brand: "Slekco Home", category: "Home & Living", price: 249.0, stock: 8, tags: ["furniture", "chair"] },
    { title: "Drift Ceramic Table Lamp", brand: "Slekco Home", category: "Home & Living", price: 59.0, stock: 22, tags: ["lighting", "decor"] },
    { title: "Woven Storage Basket Set", brand: "Slekco Home", category: "Home & Living", price: 39.0, stock: 35, tags: ["storage", "decor"] },

    // Accessories
    { title: "Transit Commuter Backpack", brand: "Slekco Wear", category: "Accessories", price: 79.0, stock: 28, tags: ["backpack", "bag"], featured: true },
    { title: "Reversible Leather Belt", brand: "Slekco Wear", category: "Accessories", price: 29.0, stock: 55, tags: ["belt"] },
    { title: "Fold Cardholder Wallet", brand: "Slekco Wear", category: "Accessories", price: 24.0, stock: 65, tags: ["wallet"] },

    // Wearables
    { title: "Pulse Fit Smartwatch", brand: "Slekco Tech", category: "Wearables", price: 199.0, compareAtPrice: 229.0, stock: 30, tags: ["smartwatch", "fitness"], featured: true },
    { title: "TrackBand Activity Tracker", brand: "Slekco Tech", category: "Wearables", price: 59.0, stock: 45, tags: ["fitness", "tracker"] },
  ];

  return raw.map((p, idx) => {
    const slug = slugify(p.title, { lower: true, strict: true });
    return {
      title: p.title,
      slug,
      brand: p.brand,
      description: `${p.title} by ${p.brand}. Designed for everyday performance with premium materials, considered detailing, and a fit that works as hard as you do.`,
      shortDescription: `${p.title} — a Slekco favorite.`,
      price: p.price,
      compareAtPrice: p.compareAtPrice || null,
      category: categoryMap[p.category],
      images: [img(slug + "-1"), img(slug + "-2"), img(slug + "-3")],
      variants: [
        { label: "Size", value: "S" },
        { label: "Size", value: "M" },
        { label: "Size", value: "L" },
      ],
      stock: p.stock,
      sku: `SLK-${1000 + idx}`,
      rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
      reviewCount: Math.floor(Math.random() * 200) + 5,
      tags: p.tags,
      isFeatured: !!p.featured,
      seo: {
        metaTitle: `${p.title} | Slekco`,
        metaDescription: `Shop the ${p.title} from ${p.brand} at Slekco. Fast shipping, easy returns.`,
      },
    };
  });
}

async function run() {
  await connectDB();

  console.log("[seed] clearing existing data...");
  await Promise.all([Category.deleteMany({}), Product.deleteMany({})]);

  console.log("[seed] inserting categories...");
  const categories = await Category.insertMany(
    categoriesData.map((c) => ({
      ...c,
      slug: slugify(c.name, { lower: true, strict: true }),
      image: img(slugify(c.name, { lower: true, strict: true })),
    }))
  );

  const categoryMap = Object.fromEntries(categories.map((c) => [c.name, c._id]));

  console.log("[seed] inserting products...");
  const products = buildProducts(categoryMap);
  await Product.insertMany(products);

  console.log(`[seed] done: ${categories.length} categories, ${products.length} products`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
