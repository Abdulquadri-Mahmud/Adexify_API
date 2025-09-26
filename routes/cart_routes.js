import express from 'express';
import { 
    addToCart, deleteCartItem, 
    getUserCart, mergeCart, updateCartItem 
} from '../controller/cart.controller.js';

const app = express();

app.post('/add', addToCart);
app.post('/get-user-cart', getUserCart);
app.post("/merge", mergeCart);
app.patch('/update-user-cart', updateCartItem);
app.delete('/delete-cart-item', deleteCartItem);

export default app;