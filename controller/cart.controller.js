import Cart from "../model/cart_model.js";
import mongoose from "mongoose";
import User from "../model/user_model.js";

// ==================== Add to Cart ====================
export const addToCart = async (req, res) => {
  const { userId, product } = req.body;

  // Validate user
  const findUser = await User.findById(userId);
  if (!findUser) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (!userId || !product || !product.productId) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        userId: new mongoose.Types.ObjectId(userId),
        products: [product],
      });
    } else {
      // Check if product already exists
      const alreadyExists = cart.products.some(
        (p) =>
          p.productId === product.productId &&
          p.selectedSize === product.selectedSize
      );

      if (alreadyExists) {
        return res.status(400).json({
          success: false,
          message: 'Product already exists in cart',
        });
      }

      // Add new product to cart
      cart.products.push(product);
    }

    const saved = await cart.save();

    res.status(200).json({
      success: true,
      message: 'Product added to cart',
      cart: saved,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ==================== Get User Cart ====================
export const getUserCart = async (req, res) => {
  const { userId } = req.body;

  try {
    const findUser = await User.findById(userId);

    if (!findUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cart = await Cart.findOne({ userId }).populate('userId', '-password -avatar -resetPasswordExpires -resetPasswordToken');

    // Check if cart exists
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      cart,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// ==================== Update Cart Item ====================
export const updateCartItem = async (req, res) => {
  const { userId, productId, quantity, selectedSize } = req.body;

  try {
    const findUser = await User.findById(userId);
    if (!findUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    console.log('Cart before update:', cart.products);

    const item = cart.products.find(item => String(item.productId) === String(productId));
    if (!item) return res.status(404).json({ success: false, message: "Product not found in cart" });

    if (quantity !== undefined) item.quantity = quantity;
    if (selectedSize !== undefined) item.selectedSize = selectedSize;

    const updated = await cart.save();

    console.log('Cart after update:', updated.products);

    if (!updated) return res.status(500).json({ success: false, message: "Failed to update cart" });

    res.status(200).json({ success: true, message: "Cart updated", cart: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==================== Delete Cart Item ====================
export const deleteCartItem = async (req, res) => {
  const { userId, productId, selectedSize } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    // Filter out the item that matches BOTH productId and selectedSize
    cart.products = cart.products.filter(
      (item) => !(item.productId === productId && item.selectedSize === selectedSize)
    );

    const updated = await cart.save();
    res.status(200).json({ success: true, message: "Item removed", cart: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Merge guest cart with user's cart
export const mergeCart = async (req, res) => {
  try {
    const { userId, products } = req.body;

    if (!userId || !Array.isArray(products)) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    // Find user cart
    let userCart = await Cart.findOne({ userId });

    if (!userCart) {
      // If user has no cart, just create new with guest cart items
      userCart = await Cart.create({ userId, products });
    } else {
      // Merge products
      products.forEach((guestItem) => {
        const existing = userCart.products.find(
          (p) => p.productId.toString() === guestItem.productId
        );
        if (existing) {
          existing.quantity += guestItem.quantity; // increment if exists
        } else {
          userCart.products.push(guestItem); // add new product
        }
      });

      await userCart.save();
    }

    return res.status(200).json({ message: "Cart merged successfully", cart: userCart });
  } catch (error) {
    console.error("Merge Cart Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
