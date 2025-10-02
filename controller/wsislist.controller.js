// controllers/cartController.js
import { v4 as uuidv4 } from "uuid";
import wishlistModel from "../model/wishlist.model.js";

// Add to Cart
export const addToWishlist = async (req, res) => {
  try {
    const { userId, cartToken, product } = req.body;

    let token = cartToken || null;
    if (!userId && !token) token = uuidv4();

    let cart;
    if (userId) cart = await wishlistModel.findOne({ userId });
    else cart = await wishlistModel.findOne({ cartToken: token });

    if (!cart) {
      cart = new wishlistModel({
        userId: userId || undefined,
        cartToken: userId ? undefined : token,
        products: [product],
      });
    } else {
      const existingIndex = wishlistModel.products.findIndex(
        (p) =>
          p.productId === product.productId &&
          p.selectedSize === product.selectedSize
      );

      if (existingIndex >= 0) {
        wishlistModel.products[existingIndex].quantity += product.quantity || 1;
      } else {
        wishlistModel.products.push(product);
      }
    }

    await wishlistModel.save();

    res.json({ success: true, cart, cartToken: token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Cart
export const getWishlist = async (req, res) => {
  try {
    const { userId, cartToken } = req.query;

    let cart;
    if (userId) cart = await wishlistModel.findOne({ userId });
    else if (cartToken) cart = await wishlistModel.findOne({ cartToken });

    if (!cart) return res.json({ success: true, cart: null });

    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete item by productId + size
export const removeWishlistItem = async (req, res) => {
  try {
    const { userId, cartToken, productId, selectedSize } = req.body;

    let cart;
    if (userId) cart = await wishlistModel.findOne({ userId });
    else cart = await wishlistModel.findOne({ cartToken });

    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    wishlistModel.products = wishlistModel.products.filter(
      (p) => !(p.productId === productId && p.selectedSize === selectedSize)
    );

    await wishlistModel.save();
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Merge Guest Cart into User Cart
export const mergeGuestWishlist = async (req, res) => {
  try {
    const { userId, cartToken } = req.body;

    const guestWishlist = await wishlistModel.findOne({ cartToken });
    if (!guestCart) return res.json({ success: true, message: "No guest cart found" });

    let userCart = await wishlistModel.findOne({ userId });

    if (!userCart) {
      guestWishlist.userId = userId;
      guestWishlist.cartToken = undefined;
      await guestWishlist.save();
      return res.json({ success: true, cart: guestCart });
    }

    guestWishlist.products.forEach((g) => {
      const existingIndex = guestWishlist.products.findIndex(
        (p) => p.productId === g.productId && p.selectedSize === g.selectedSize
      );
      if (existingIndex >= 0) {
        guestWishlist.products[existingIndex].quantity += g.quantity;
      } else {
        guestWishlist.products.push(g);
      }
    });

    await guestWishlist.save();
    await guestWishlist.deleteOne();

    res.json({ success: true, cart: userCart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
