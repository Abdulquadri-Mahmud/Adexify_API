import express from 'express';
import { createCheckout, verifyPayment 
    
} from '../controller/checkoutController.js';

const app = express();

app.post("/", createCheckout);
app.get("/verify/:reference", verifyPayment);

export default app;