import fetch from "node-fetch"; // Paystack API call
import dotenv from "dotenv";
import Order from "../../model/order/order.model.js";
dotenv.config();

//Helper to generate unique transaction reference
const generateTransactionRef = () => `REF_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

// ==========================
// CREATE ORDER CONTROLLER
// ==========================
export const createOrder = async (req, res) => {
  try {
    const {
      userId,
      userInfo,
      address,
      items,
      paymentMethod,
      total,
      deliveryFee,
      orderStatus,
      paymentStatus,
    } = req.body;

    // Validate required fields
    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ message: "Missing user or items data" });
    }

    // Generate total amount in kobo (Paystack uses kobo)
    const totalAmount = (total + (deliveryFee || 0)) * 100;

    let orderData = {
      userId,
      userInfo,
      address,
      items,
      paymentMethod,
      total,
      deliveryFee,
      orderStatus,
      paymentStatus,
    };

    // ===================================================
    // PAY ONLINE: Initialize Paystack Transaction
    // ===================================================
    if (paymentMethod === "Pay Online") {
      const transactionRef = generateTransactionRef();

      const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userInfo.email,
          amount: totalAmount,
          reference: transactionRef,
          callback_url: `${process.env.CLIENT_URL}/payment/verify`, // redirect after payment
        }),
      });

      const paystackData = await paystackResponse.json();

      if (!paystackData.status) {
        return res.status(400).json({ message: "Paystack initialization failed" });
      }

      // Attach Paystack details to order
      orderData.transactionRef = transactionRef;
      orderData.paymentUrl = paystackData.data.authorization_url;
      orderData.paymentStatus = "unpaid";
    }

    // ===================================================
    // SAVE ORDER TO DATABASE
    // ===================================================
    const newOrder = await Order.create(orderData);

    // If payment method is online, send URL for redirection
    if (paymentMethod === "Pay Online") {
      return res.status(201).json({
        success: true,
        message: "Order created. Redirect to Paystack.",
        paymentUrl: newOrder.paymentUrl,
        order: newOrder,
      });
    }

    // Otherwise (Pay on Delivery), mark as pending
    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating order",
      error: error.message,
    });
  }
};

// ==========================
// VERIFY PAYMENT CONTROLLER
// ==========================
export const verifyPaystackPayment = async (req, res) => {
  const { reference } = req.query;

  try {
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );

    const result = await verifyResponse.json();

    if (!result.status) {
      return res.status(400).json({ message: "Verification failed" });
    }

    // Update order after payment success
    const updatedOrder = await Order.findOneAndUpdate(
      { transactionRef: reference },
      { paymentStatus: "paid", orderStatus: "processing" },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Paystack verification error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};
