import fetch from "node-fetch";
import dotenv from "dotenv";
import Order from "../../model/order/order.model.js";

dotenv.config();

// ==============================
// Helper: Generate unique transaction reference
// ==============================
const generateTransactionRef = () =>
  `REF_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

// ==============================
// CREATE ORDER CONTROLLER
// ==============================
export const createOrder = async (req, res) => {
  try {
    const {
      userId,
      userInfo,
      address,
      items,
      paymentMethod,
      total,
      deliveryFee = 0,
    } = req.body;

    // 1. Basic validation
    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ message: "Missing user or items data" });
    }

    // 2. Generate total amount in kobo (Paystack uses kobo)
    const totalAmount = (total + deliveryFee) * 100;

    // 3. Prepare order data
    let orderData = {
      userId,
      userInfo,
      address,
      items,
      paymentMethod,
      total,
      deliveryFee,
      paymentStatus: "unpaid",
      orderStatus: "pending",
    };

    // ==============================
    // 💳 PAY ONLINE → Initialize Paystack Transaction
    // ==============================
    if (paymentMethod === "Pay Online") {
      const transactionRef = generateTransactionRef();

      // Initialize Paystack transaction
      const paystackResponse = await fetch(
        "https://api.paystack.co/transaction/initialize",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userInfo.email,
            amount: totalAmount,
            reference: transactionRef,
            callback_url: `${process.env.CLIENT_URL}/payment/verify?reference=${transactionRef}`,
          }),
        }
      );

      const paystackData = await paystackResponse.json();

      if (!paystackData.status) {
        return res.status(400).json({
          message: "Paystack initialization failed",
          error: paystackData.message,
        });
      }

      // Attach Paystack details to order
      orderData.transactionRef = transactionRef;
      orderData.paymentUrl = paystackData.data.authorization_url;
      orderData.paymentStatus = "unpaid";
    }

    // ==============================
    // 4. SAVE ORDER TO DATABASE
    // ==============================
    const newOrder = await Order.create(orderData);

    // 5. If payment method is Pay Online, return Paystack redirect URL
    if (paymentMethod === "Pay Online") {
      return res.status(201).json({
        success: true,
        message: "Order created successfully. Redirect to Paystack.",
        paymentUrl: newOrder.paymentUrl,
        order: newOrder,
      });
    }

    // 6. Otherwise (Pay on Delivery)
    return res.status(201).json({
      success: true,
      message: "Order placed successfully (Cash on Delivery).",
      order: newOrder,
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating order",
      error: error.message,
    });
  }
};

// ==============================
// VERIFY PAYMENT CONTROLLER
// ==============================
export const verifyPaystackPayment = async (req, res) => {
  const { reference } = req.query;

  try {
    // 1. Verify transaction with Paystack API
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const result = await verifyResponse.json();

    if (!result.status) {
      return res.status(400).json({ message: "Verification failed" });
    }

    // 2. Check if transaction was successful
    if (result.data.status !== "success") {
      return res.status(400).json({ message: "Payment not successful yet" });
    }

    // 3. Update order payment + status
    const updatedOrder = await Order.findOneAndUpdate(
      { transactionRef: reference },
      {
        paymentStatus: "paid",
        orderStatus: "processing",
        paymentVerifiedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 4. Return updated order
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


// ==========================
// GET USER ORDERS CONTROLLER
// ==========================
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
      error: error.message,
    });
  }
};

// ==========================================
// 📦 Get Single Order (by Query) – Konga Style
// ==========================================
export const getSingleOrder = async (req, res) => {
  try {
    const { orderId, userId } = req.query;

    if (!orderId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing orderId or userId in query",
      });
    }

    // Find order that matches both ID and user
    const order = await Order.findOne({ _id: orderId, userId })
      .populate("userId", "firstname lastname email")
      .populate("items.product", "name price image");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or doesn't belong to this user",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error fetching single order:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch single order",
      error: error.message,
    });
  }
};
