import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import productsRoutes from './routes/products_routes.js';
import userAuthentication from './routes/user_routes.js';
import adminAuthentication from './routes/admin_auth_routes.js';
import allProductsRoutes from './routes/AllProducts.routes.js';
import CartRoutes from './routes/cart_routes.js';
import WishListRoutes from './routes/wishlist.route.js';
import searchRoutes from './routes/searchRoutes.js';
import productViewRoutes from './routes/products.view.routes.js';
import addressRoutes from './routes/addressRoutes.js';
import orderRoutes from './routes/order.routes.js';

import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

const allowedOrigins = [
    'https://adexify-five.vercel.app',
    'http://localhost:5173',
];

// 'http://localhost:5174', 
// Configure CORS middleware
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Allow access
    } else {
        callback(new Error('Not allowed by CORS')); // Deny access
    }
},
    // credentials: true, // Allow cookies and credentials if needed
};
  
// Apply CORS middleware
app.use(cors(corsOptions));

mongoose.connect(process.env.db).then((response) => {
    console.log('Database Connected!');
    app.listen(process.env.PORT, () => {
        console.log('Server is listening on port 3000!');
    });
}).catch((error) => {
    console.log(error);
});

app.get("/",(req, res,) => {
    res.send('Hello World');
});

app.use("/api/orders/webhook", express.raw({ type: "application/json" }), orderRoutes);

app.use('/api/all-products', allProductsRoutes);
app.use('/api/products', productsRoutes);

app.use('/api/user/auth', userAuthentication);
app.use("/api/users", addressRoutes);

app.use('/api/admin/auth', adminAuthentication);
app.use('/api/cart', CartRoutes);
app.use('/api/wishlist', WishListRoutes);

app.use("/api/product-views", productViewRoutes);

app.use('/api/search', searchRoutes);
// Order API
app.use("/api/orders", orderRoutes);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error!';

    return res.status(statusCode).json({
        success : false,
        statusCode,
        message
    });
});
