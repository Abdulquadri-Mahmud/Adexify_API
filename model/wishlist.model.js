// models/Wishlist.js
import mongoose from 'mongoose';

const WishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [
    {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      image: { type: [String], required: true },
      category: { type: String, required: true },
      brand: { type: String },
      gender: { type: String },
      description: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

export default mongoose.model('Wishlist', WishlistSchema);