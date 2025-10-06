import express from 'express';
import {
    createOrder,
    verifyPaystackPayment
} from '../controller/order/order.controller.js';

import { paystackWebhook } from '../controller/order/paystackWebhook.controller.js';

const app = express();

// Create new order
app.post("/create", createOrder);

// Verify Paystack payment
app.get("/verify", verifyPaystackPayment);

app.post("/webhook", express.raw({ type: "application/json" }), paystackWebhook);

export default app;