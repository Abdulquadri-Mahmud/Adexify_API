// controllers/order/paystackWebhook.controller.js
import crypto from "crypto";
import Order from "../../model/order/order.model.js";
import dotenv from "dotenv";
import Products from "../../model/products_models.js";
dotenv.config();

/**
 * 🔔 PAYSTACK WEBHOOK HANDLER
 * This endpoint receives real-time payment events from Paystack
 * such as charge.success, charge.failed, etc.
 */
export const paystackWebhook = async (req, res) => {
  try {
    // Step 1️⃣: Retrieve Paystack signature from header
    const paystackSignature = req.headers["x-paystack-signature"];
    if (!paystackSignature) {
      return res.status(400).send("Missing Paystack signature");
    }

    // Step 2️⃣: Verify webhook came from Paystack
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== paystackSignature) {
      console.error("❌ Invalid Paystack signature");
      return res.status(400).send("Invalid signature");
    }

    // Step 3️⃣: Handle event type
    const event = req.body.event;
    const data = req.body.data;

    if (event === "charge.success") {
      const reference = data.reference;
      const amountPaid = data.amount / 100; // convert kobo to naira

      // Step 4️⃣: Update the corresponding order
      const order = await Order.findOneAndUpdate(
        { transactionRef: reference },
        {
          paymentStatus: "paid",
          orderStatus: "processing",
          "paymentDetails.paidAt": new Date(),
          "paymentDetails.amountPaid": amountPaid,
        },
        { new: true }
      );

      if (!order) {
        console.warn(`⚠️ Order not found for reference: ${reference}`);
        return res.status(404).json({ message: "Order not found" });
      }

      console.log(`✅ Order ${order._id} updated successfully via webhook.`);

      // Step 6️⃣: Decrease product stock quantities after successful payment
      try {
        for (const item of order.items) {
          await Products.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity },
          });
        }
        console.log("📦 Product stock quantities updated successfully.");
      } catch (stockError) {
        console.error("⚠️ Error updating product stock:", stockError);
      }

      // Step 5️⃣: Return success to Paystack (must respond with 200)
      return res.status(200).json({ success: true, message: "Webhook processed" });
    }

    // Optionally handle failed or other events
    if (event === "charge.failed") {
      console.warn("❌ Payment failed:", data.reference);
      return res.status(200).json({ success: true, message: "Payment failed event handled" });
    }

    // Default: unhandled event
    console.log(`ℹ️ Unhandled event type: ${event}`);
    res.status(200).json({ success: true, message: "Event received but not handled" });
  } catch (error) {
    console.error("🔥 Webhook processing error:", error);
    res.status(500).json({ success: false, message: "Webhook error", error: error.message });
  }
};
