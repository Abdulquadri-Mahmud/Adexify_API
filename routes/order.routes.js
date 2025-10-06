import express from 'express';
import {
    createOrder,
    getUserOrders,
    verifyPaystackPayment
} from '../controller/order/order.controller.js';

import { paystackWebhook } from '../controller/order/paystackWebhook.controller.js';

const app = express();

// Create new order
app.post("/create", createOrder);
app.get("/user", getUserOrders);

// Verify Paystack payment
app.get("/verify", verifyPaystackPayment);

app.post("/webhook", express.raw({ type: "application/json" }), paystackWebhook);

export default app;