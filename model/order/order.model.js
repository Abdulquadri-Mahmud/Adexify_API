import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // Reference to user placing the order
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Embedded user info (snapshot at time of order)
    userInfo: {
      firstname: String,
      lastname: String,
      email: String,
      phone: String,
    },

    // Shipping / Delivery address
    address: {
      addressId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      street: String,
      city: String,
      state: String,
      postalCode: String,
      type: { type: String, default: "Home" },
      notes: String, // also used as delivery/order notes
    },

    // Items purchased
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: String,
        price: Number,
        quantity: Number,
        selectedSize: String,
        selectedColor: String,
      },
    ],

    // Payment information
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

    // Order processing state
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    // Computed totals
    total: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },

    // Paystack Transaction reference
    transactionRef: String,
    paymentUrl: String, // Paystack redirect URL for online payments
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;