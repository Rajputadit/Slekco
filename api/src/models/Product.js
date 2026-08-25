import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    label: { type: String, required: true }, // e.g. "Size" / "Color"
    value: { type: String, required: true }, // e.g. "M" / "Black"
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    brand: { type: String, required: true, index: true },
    description: { type: String, required: true },
    shortDescription: { type: String, default: "" },

    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null }, // original price, for "sale" display
    currency: { type: String, default: "USD" },

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },

    images: [{ type: String }],
    variants: [variantSchema],

    stock: { type: Number, required: true, default: 0 },
    sku: { type: String, required: true, unique: true },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    tags: [{ type: String, index: true }],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // SEO fields - lets each product own its own meta description/title
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text", brand: "text", tags: "text" });

export default mongoose.model("Product", productSchema);
