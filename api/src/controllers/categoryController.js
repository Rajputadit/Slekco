import Category from "../models/Category.js";

export async function listCategories(req, res, next) {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ items: categories });
  } catch (err) {
    next(err);
  }
}
