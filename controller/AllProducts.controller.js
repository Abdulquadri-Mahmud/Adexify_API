import Products from "../model/products_models.js";
import { errorHandler } from "../utils/errorHandler.js";

export const getAllProducts = async (req, res, next) => {
  try {
    const category = req.query.category || req.params.category;

    const filter = category ? { category } : {};
    const products = await Products.find(filter);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(errorHandler(500, "Failed to fetch products"));
  }
};
