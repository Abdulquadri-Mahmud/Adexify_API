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
    const { userId, cartToken } = req.body;

    let cart;
    if (userId) cart = await Cart.findOne({ userId });
    else if (cartToken) cart = await Cart.findOne({ cartToken });

    if (!cart) return res.json({ success: true, cart: null });

    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Cart (quantity)
export const updateCartItem = async (req, res) => {
  try {
    const { userId, cartToken, productId, selectedSize, quantity } = req.body;

    let cart;
    if (userId) cart = await Cart.findOne({ userId });
    else cart = await Cart.findOne({ cartToken });

    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const product = cart.products.find(
      (p) => p.productId === productId && p.selectedSize === selectedSize
    );

    if (!product) return res.status(404).json({ success: false, message: "Product not in cart" });

    product.quantity = quantity;
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
  try {
    const { userId, cartToken } = req.body;

    const guestCart = await Cart.findOne({ cartToken });
    if (!guestCart) return res.json({ success: true, message: "No guest cart found" });

    let userCart = await Cart.findOne({ userId });

    if (!userCart) {
      guestCart.userId = userId;
      guestCart.cartToken = undefined;
      await guestCart.save();
      return res.json({ success: true, cart: guestCart });
    }

    guestCart.products.forEach((g) => {
      const existingIndex = userCart.products.findIndex(
        (p) => p.productId === g.productId && p.selectedSize === g.selectedSize
      );
      if (existingIndex >= 0) {
        userCart.products[existingIndex].quantity += g.quantity;
      } else {
        userCart.products.push(g);
      }
    });

    await userCart.save();
    await guestCart.deleteOne();

    res.json({ success: true, cart: userCart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
