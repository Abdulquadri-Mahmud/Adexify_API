// controllers/productsViewModelController.js
import { v4 as uuidv4 } from "uuid"; // for generating unique cartToken for guests
import productsViewModel from "../model/products.view.model.js";

export const recordAndGetproductsViewModels = async (req, res) => {
  try {
    let { productId, cartToken } = req.body;
    const userId = req.user?._id || null; // optional if user is logged in

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    // If guest and no cartToken provided, generate one
    if (!userId && !cartToken) {
      cartToken = uuidv4();
    }

    // Always create a view record for this visit
    const newView = await productsViewModel.create({
      productId,
      userId,
      cartToken,
    });

    // Count total views for this product
    const totalViews = await productsViewModel.countDocuments({ productId });

    res.json({
      productId,
      views: totalViews,
      newView,
      cartToken: cartToken, // return to frontend so guest can reuse it
    });
  } catch (err) {
    console.error("Error recording product view:", err);
    res.status(500).json({ message: "Server error" });
  }
};
