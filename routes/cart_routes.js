import express from 'express';
import { addToCart, deleteCartItem, getUserCart, updateCartItem } from '../controller/cart.controller.js';

const app = express();

app.post('/add', addToCart);
app.post('/get-user-cart', getUserCart);
app.patch('/update-user-cart', updateCartItem);
app.delete('/delete-cart-item', deleteCartItem);

export default app;