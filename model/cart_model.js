import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema({
   userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   products: [
      {
         productId: {
            type: String, required: true 
         },
         name: {
            type: String, required: true 
         },
         stock: {
            type: Number, required: true 
         },
         price: {
            type: Number, required: true 
         },
         discount: {
            type: Number 
            },
         oldprice: {
           type: Number 
         },
         deal: {
           type: String, required: true 
         },
         category: { type: String, required: true 
      
         },
         image: { type: [String], required: true 
      
         },
         description: { type: String, required: true 
      
         },
         discountType: { 
            type: String 
         },
         trackingId: { 
            type: String, required: true 
         },
         size: { 
            type: [String], required: true 
         },
         gender: { 
            type: String, required: true 
         },
         selectedSize: { 
            type: String 
         },
         quantity: { 
            type: Number, default: 1 
         },
      }
   ]
}, { timestamps: true });

const Cart = mongoose.model('Cart', CartSchema);

export default Cart;
