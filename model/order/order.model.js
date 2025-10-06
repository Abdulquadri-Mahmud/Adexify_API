import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    userInfo: {
      firstname: String,
      lastname: String,
      email: String,
      phone: String,
    },

    address: {
      addressId: mongoose.Schema.Types.ObjectId,
      street: String,
      city: String,
      state: String,
      postalCode: String,
      type: { type: String, default: "Home" },
      notes: String,
    },

    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        image: String,
        quantity: Number,
        selectedSize: String,
        selectedColor: String,
      },
    ],

    paymentMethod: {
      type: String,
      enum: ["Pay Online", "Pay on Delivery"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "pending", "failed"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    total: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    transactionRef: String,
    paymentUrl: String,
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
