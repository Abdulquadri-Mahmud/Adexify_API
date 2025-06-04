import express from "express";
import { getAllProducts } from "../controller/AllProducts.controller.js";

const app = express();

// Example: /api/products or /api/products?category=electronics
app.get("/products", getAllProducts);

// Optional: If using params like /api/products/category/electronics
app.get("/products/category/:category", getAllProducts);

export default app;