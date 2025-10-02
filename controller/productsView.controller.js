// controllers/productsViewModelController.js

import productsViewModel from "../model/products.view.model.js";

export const recordAndGetproductsViewModels = async (req, res) => {
  try {
    const { productId, cartToken } = req.body;
    const userId = req.user?._id; // assuming user is attached via auth middleware

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    // Check if this user/cart has already viewed today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const alreadyViewed = await productsViewModel.findOne({
      productId,
      $or: [{ userId }, { cartToken }],
      createdAt: { $gte: todayStart },
    });

    if (!alreadyViewed) {
      // Create a new view record
      await productsViewModel.create({ productId, userId, cartToken });
    }

    // Get total views
    const totalViews = await productsViewModel.countDocuments({ productId });

    res.json({ productId, views: totalViews });
  } catch (err) {
    console.error("Error recording product view:", err);
    res.status(500).json({ message: "Server error" });
  }
};
