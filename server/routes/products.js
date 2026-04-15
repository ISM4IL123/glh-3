import express from "express";
import { Product } from "../db.js";
import { z } from "zod";
import { validateBody } from "../middleware/validate.js";

const router = express.Router();

const createProductSchema = z.object({
  name: z.string().trim().min(1).max(120),
  price: z.number().finite().nonnegative(),
  stock: z.number().int().nonnegative(),
  category: z.string().trim().max(120).optional(),
  description: z.string().trim().max(2000).optional(),
  producer: z.string().trim().max(120).optional()
});

// GET all products
router.get("/", async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
});

// POST new product
router.post("/", validateBody(createProductSchema), async (req, res) => {
  const { name, price, stock, category, description, producer } = req.body;
  const newProduct = await Product.save({
    name,
    price,
    stock,
    category: category || "",
    description: description || "",
    producer: producer || ""
  });
  res.status(201).json({ success: true, product: newProduct });
});

export default router;