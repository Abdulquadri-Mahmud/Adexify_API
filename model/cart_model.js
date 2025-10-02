// models/Cart.js
import mongoose from "mongoose";

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // make optional for guests
    },
    cartToken: {
      type: String, // for guest carts
      required: false,
    },
    products: [
      {
        productId: {
         type: String, required: true 
      },
        name: {
         type: String, required: true 
      },
        stock: {
         type: Number, required: false 
      },
        price: {
         type: Number, required: true 
      },
        discount: {
         type: Number 
      },
        oldprice: {
         type: Number 
      },
        deal: {
         type: String, required: false 
      },
      category: {
         type: String, required: true 
      },
        image: {
         type: [String], required: true 
      },
        description: {
         type: String, required: true 
      },
        discountType: {
         type: String 
      },
        trackingId: {
         type: String, required: false 
      },
        size: {
         type: [String], required: true 
      },
        gender: {
         type: String, required: true 
      },
        selectedSize: {
         type: String 
      },
        quantity: {
         type: Number, default: 1 
      },
      },
    ],
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", CartSchema);
export default Cart;
