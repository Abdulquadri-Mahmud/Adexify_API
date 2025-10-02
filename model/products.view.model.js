// models/ProductView.js
import mongoose from "mongoose";

const ProductViewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // optional for guests
    },
    cartToken: {
      type: String, // for guests
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ProductView", ProductViewSchema);