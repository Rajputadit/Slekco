import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { ApiError } from "../middleware/errorHandler.js";

// GET /api/products
// Query params: q, category (slug), brand, minPrice, maxPrice, sort, page, limit
export async function listProducts(req, res, next) {
  try {
    const {
      q,
      category,
      brand,
      minPrice,
      maxPrice,
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { isActive: true };

    if (q) {
      filter.$text = { $search: q };
    }

    if (brand) {
      filter.brand = { $in: brand.split(",") };
    }

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) filter.category = cat._id;
      else return res.json({ items: [], total: 0, page: Number(page), pages: 0 });
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortMap = {
      newest: { createdAt: -1 },
      priceAsc: { price: 1 },
      priceDesc: { price: -1 },
      rating: { rating: -1 },
    };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(48, Math.max(1, Number(limit)));

    const [items, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort(sortMap[sort] || sortMap.newest)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:slug
export async function getProductBySlug(req, res, next) {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate(
      "category",
      "name slug"
    );
    if (!product) throw new ApiError(404, "Product not found");

    // naive "related products" - same category, excluding self
    const related = await Product.find({
      category: product.category?._id,
      _id: { $ne: product._id },
      isActive: true,
    }).limit(4);

    res.json({ product, related });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/featured
export async function getFeaturedProducts(req, res, next) {
  try {
    const items = await Product.find({ isFeatured: true, isActive: true })
      .populate("category", "name slug")
      .limit(8);
    res.json({ items });
  } catch (err) {
    next(err);
  }
}
