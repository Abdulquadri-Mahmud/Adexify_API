import express from 'express';
import { addToWishList, getWishlist, 
    mergeWishlist, removeFromWishlist 
} from '../controller/wsislist.controller.js';

const app = express();

app.post('/add-to-wishlist', addToWishList);
app.post('/get-wishlist', getWishlist);
app.post('/merge', mergeWishlist);
app.delete('/delete-wishlist', removeFromWishlist);

export default app;