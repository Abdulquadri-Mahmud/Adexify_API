import express from 'express';
import { addToWishlist, 
    getWishlist, 
    mergeGuestWishlist, 
    removeWishlistItem
} from '../controller/wsislist.controller.js';

const app = express();

app.post("/add", addToWishlist);          // Add to Wishlist
app.get("/get", getWishlist);                // Get Wishlist

app.delete("/remove", removeWishlistItem);// Clear entire Wishlist
app.post("/merge", mergeGuestWishlist); 

export default app;