import express from 'express';
import { addToCart, clearCart, getCart, 
    mergeGuestCart, 
    removeCartItem, updateCartItem 
} from '../controller/cart.controller.js';

const app = express();

app.post("/add", addToCart);          // Add to cart
app.get("/get", getCart);                // Get cart
app.put("/update", updateCartItem);   // Update quantity
app.delete("/remove", removeCartItem);// Remove single product
app.delete("/clear", clearCart);      // Clear entire cart
app.post("/merge", mergeGuestCart);   // Merge guest -> user


export default app;