// controllers/checkoutController.js
import Paystack from "paystack-api";
import orderModel from "../model/order.model.js";

const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY);

// @desc Create Checkout Order
// @route POST /api/checkout
export const createCheckout = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      phone,
      email,
      address,
      deliveryMethod,
      paymentMethod,
      items,
    } = req.body;

    if (!firstname || !lastname || !phone || !email || !address || !items) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // calculate total price (assuming each item has quantity and price)
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    let orderData = {
      firstname,
      lastname,
      phone,
      email,
      address,
      deliveryMethod,
      paymentMethod,
      items,
      totalAmount,
      orderStatus: "pending",
      paymentStatus: paymentMethod === "Pay on Delivery" ? "pending" : "initiated",
    };

    // 1️⃣ If COD
    if (paymentMethod === "Pay on Delivery") {
      const order = await orderModel.create(orderData);
      return res.status(201).json({
        success: true,
        message: "Order placed successfully with Cash on Delivery",
        order,
      });
    }

    // 2️⃣ If Pay Online
    if (paymentMethod === "Pay Online") {
      const response = await paystack.transaction.initialize({
        email,
        amount: totalAmount * 100, // Paystack accepts kobo
      });

      if (!response.status) {
        return res.status(400).json({
          success: false,
          message: "Paystack initialization failed",
        });
      }

      // save order with "initiated" status
      orderData.paymentReference = response.data.reference;
      const order = await orderModel.create(orderData);

      return res.status(201).json({
        success: true,
        message: "Payment initialized",
        authorization_url: response.data.authorization_url,
        reference: response.data.reference,
        order,
      });
    }

    return res.status(400).json({ message: "Invalid payment method" });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Verify Paystack Payment
// @route GET /api/checkout/verify/:reference
export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await paystack.transaction.verify({ reference });

    if (response.data.status === "success") {
      // update order status
      await Order.findOneAndUpdate(
        { paymentReference: reference },
        { paymentStatus: "paid", orderStatus: "processing" },
        { new: true }
      );

      return res.json({
        success: true,
        message: "Payment verified successfully",
        data: response.data,
      });
    }

    res.status(400).json({
      success: false,
      message: "Payment not successful",
      data: response.data,
    });
  } catch (error) {
    console.error("Verify error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
