// controllers/cartController.js
import { v4 as uuidv4 } from "uuid";
import Cart from "../model/cart_model.js";

// Add to Cart
export const addToCart = async (req, res) => {
  try {
    const { userId, cartToken, product } = req.body;

    let token = cartToken || null;
    if (!userId && !token) token = uuidv4();

    let cart;
    if (userId) cart = await Cart.findOne({ userId });
    else cart = await Cart.findOne({ cartToken: token });

    if (!cart) {
      cart = new Cart({
        userId: userId || undefined,
        cartToken: userId ? undefined : token,
        products: [product],
      });
    } else {
      const existingIndex = cart.products.findIndex(
        (p) =>
          p.productId === product.productId &&
          p.selectedSize === product.selectedSize
      );

      if (existingIndex >= 0) {
        cart.products[existingIndex].quantity += product.quantity || 1;
      } else {
        cart.products.push(product);
      }
    }

    await cart.save();

    res.json({ success: true, cart, cartToken: token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Cart
export const getCart = async (req, res) => {
  try {
    const { userId, cartToken } = req.query;

    let cart;
    if (userId) cart = await Cart.findOne({ userId });
    else if (cartToken) cart = await Cart.findOne({ cartToken });

    if (!cart) return res.json({ success: true, cart: null });

    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Cart (quantity or size)
export const updateCartItem = async (req, res) => {
  try {
    const { userId, cartToken, productId, oldSize, newSize, quantity } = req.body;

    const cart = userId
      ? await Cart.findOne({ userId })
      : await Cart.findOne({ cartToken });

    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const product = cart.products.find(
      (p) => p.productId === productId && p.selectedSize === oldSize
    );

    if (!product) return res.status(404).json({ success: false, message: "Product not in cart" });

    product.selectedSize = newSize;   // 🔑 update size
    product.quantity = quantity;      // update quantity too

    await cart.save();
    res.json({ success: true, cart });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete item by productId + size
export const removeCartItem = async (req, res) => {
  try {
    const { userId, cartToken, productId, selectedSize } = req.body;

    let cart;
    if (userId) cart = await Cart.findOne({ userId });
    else cart = await Cart.findOne({ cartToken });

    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    cart.products = cart.products.filter(
      (p) => !(p.productId === productId && p.selectedSize === selectedSize)
    );

    await cart.save();
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete Entire Cart
export const clearCart = async (req, res) => {
  try {
    const { userId, cartToken } = req.body;

    let cart;
    if (userId) cart = await Cart.findOneAndDelete({ userId });
    else cart = await Cart.findOneAndDelete({ cartToken });

    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Merge Guest Cart into User Cart
export const mergeGuestCart = async (req, res) => {
  const { userId, cartToken } = req.body;

  if (!userId || !cartToken) return res.status(400).json({ success: false, message: "Missing fields" });

  try {
    const guestCart = await Cart.findOne({ cartToken });
    const userCart = await Cart.findOne({ userId });

    if (!guestCart) return res.json({ success: true, cart: userCart });

    if (userCart) {
      // Merge items
      guestCart.products.forEach((item) => {
        const existing = userCart.products.find((p) => p.productId.toString() === item.productId.toString());
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          userCart.products.push(item);
        }
      });
      await userCart.save();
      await Cart.deleteOne({ cartToken }); // remove guest cart
      return res.json({ success: true, cart: userCart });
    } else {
      // Assign guest cart to user
      guestCart.userId = userId;
      guestCart.cartToken = null; // optional
      await guestCart.save();
      return res.json({ success: true, cart: guestCart });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
