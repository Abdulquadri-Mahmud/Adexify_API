import mongoose from "mongoose";
import User from "../model/user_model.js";
import WishList from "../model/wishlist.model.js";

// ==================== Add to Cart ====================
export const addToWishList = async (req, res) => {
  const { userId, product } = req.body;

  // Validate input
  if (!userId || !product || !product.productId) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  // Check if user exists
  const findUser = await User.findById(userId);
  if (!findUser) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  try {
    let wishlist = await WishList.findOne({ userId });

    if (!wishlist) {
      // Create new wishlist
      wishlist = new WishList({
        userId: new mongoose.Types.ObjectId(userId),
        products: [product],
      });
    } else {
      // Check if product already exists in wishlist
      const alreadyExists = wishlist.products.some(
        (p) =>
          p.productId === product.productId &&
          p.selectedSize === product.selectedSize
      );

      if (alreadyExists) {
        return res.status(400).json({
          success: false,
          message: 'Product already exists in wishlist',
        });
      }

      // Add product to wishlist
      wishlist.products.push(product);
    }

    const saved = await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      wishlist: saved,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ==================== Get Wish List ====================
export const getWishlist = async (req, res) => {
  const { userId } = req.body;

  try {
    const wishlist = await WishList.findOne({ userId }).populate('userId', '-password -avatar');

    if (!wishlist) return res.status(404).json({ success: false, message: "Wishlist not found" });

    res.status(200).json({ success: true, wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};


// ==================== Remove From Wish List ====================
export const removeFromWishlist = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    // 1. Find the wishlist for the user
    const wishlist = await WishList.findOne({ userId });

    // 2. If not found, return 404
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    // 3. Check if product exists in the wishlist
    const initialLength = wishlist.products.length;

    wishlist.products = wishlist.products.filter(
      item => String(item.productId) !== String(productId)
    );

    // 4. If nothing was removed, the product was not in the wishlist
    if (wishlist.products.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    // 5. Save the updated wishlist
    const updated = await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Item removed from wishlist",
      wishlist: updated,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// Merge guest wishlist with user's wishlist
export const mergeWishlist = async (req, res) => {
  try {
    const { userId, products } = req.body;

    if (!userId || !Array.isArray(products)) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    // Find user wishlist
    let userWishlist = await Wishlist.findOne({ userId });

    if (!userWishlist) {
      // If user has no wishlist, create new with guest wishlist items
      userWishlist = await Wishlist.create({ userId, products });
    } else {
      // Merge products (avoid duplicates in wishlist)
      products.forEach((guestItem) => {
        const exists = userWishlist.products.some(
          (p) => p.productId.toString() === guestItem.productId
        );

        if (!exists) {
          userWishlist.products.push(guestItem); // add only if not already in wishlist
        }
      });

      await userWishlist.save();
    }

    return res
      .status(200)
      .json({ message: "Wishlist merged successfully", wishlist: userWishlist });
  } catch (error) {
    console.error("Merge Wishlist Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
