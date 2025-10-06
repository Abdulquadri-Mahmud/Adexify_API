import express from 'express';
import { createOrder, verifyPaystackPayment 

} from '../controller/order/order.controller.js';

const app = express();

// Create new order
app.post("/create", createOrder);

// Verify Paystack payment
app.get("/verify", verifyPaystackPayment);

export default app;