import ContactLead from "../models/ContactLead.js";
import { ApiError } from "../middleware/errorHandler.js";

export async function createLead(req, res, next) {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      throw new ApiError(400, "Name, email and message are required");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError(400, "Invalid email address");
    }
    const lead = await ContactLead.create({ name, email, subject, message });
    res.status(201).json({ lead });
  } catch (err) {
    next(err);
  }
}
