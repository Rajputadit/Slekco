import { Router } from "express";
import { listProducts, getProductBySlug, getFeaturedProducts } from "../controllers/productController.js";

const router = Router();

router.get("/featured", getFeaturedProducts);
router.get("/:slug", getProductBySlug);
router.get("/", listProducts);

export default router;
