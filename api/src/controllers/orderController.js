import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { ApiError } from "../middleware/errorHandler.js";

// POST /api/orders
// body: { customer: {name, email, phone}, shippingAddress, items: [{productId, quantity, variant}] }
export async function createOrder(req, res, next) {
  try {
    const { customer, shippingAddress, items } = req.body;

    if (!customer?.name || !customer?.email) {
      throw new ApiError(400, "Customer name and email are required");
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, "Order must contain at least one item");
    }

    // Re-price every line server-side using current DB data. Never trust
    // prices sent from the client - this is the single most important
    // security rule for any cart/checkout API.
    const ids = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: ids }, isActive: true });
    const byId = new Map(products.map((p) => [p._id.toString(), p]));

    const orderItems = [];
    let subtotal = 0;

    for (const line of items) {
      const product = byId.get(line.productId);
      if (!product) throw new ApiError(400, `Product ${line.productId} is unavailable`);
      const quantity = Math.max(1, Number(line.quantity) || 1);
      if (product.stock < quantity) {
        throw new ApiError(400, `Insufficient stock for "${product.title}"`);
      }
      const lineTotal = product.price * quantity;
      subtotal += lineTotal;
      orderItems.push({
        product: product._id,
        title: product.title,
        price: product.price,
        quantity,
        variant: line.variant || "",
      });
    }

    const shippingFee = subtotal > 100 ? 0 : subtotal > 0 ? 9.99 : 0;
    const total = subtotal + shippingFee;

    const order = await Order.create({
      customer,
      shippingAddress,
      items: orderItems,
      subtotal,
      shippingFee,
      total,
    });

    // Decrement stock (best-effort; a production system would use a
    // transaction / reservation system to avoid race conditions).
    await Promise.all(
      orderItems.map((i) =>
        Product.updateOne({ _id: i.product }, { $inc: { stock: -i.quantity } })
      )
    );

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
}

// GET /api/orders/:id
export async function getOrder(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new ApiError(400, "Invalid order id");
    }
    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, "Order not found");
    res.json({ order });
  } catch (err) {
    next(err);
  }
}
