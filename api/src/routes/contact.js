import { Router } from "express";
import { createLead } from "../controllers/contactController.js";

const router = Router();
router.post("/", createLead);

export default router;
