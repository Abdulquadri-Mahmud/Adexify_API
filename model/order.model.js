// models/orderModel.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: true,
    },
    deliveryMethod: {
      type: String,
      enum: ["Standard", "Express"],
      default: "Standard",
    },
    paymentMethod: {
      type: String,
      enum: ["Pay on Delivery", "Pay Online"],
      required: true,
    },
    paymentReference: {
      type: String,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "initiated", "paid", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1 },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
