import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productManageRoutes.js'
import wishlistRoutes from './routes/wishlistRoutes.js'
import connectDB from './config/db.js';  



// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const port = process.env.PORT || 9999;
const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));


// // Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// Cookie parser middleware
app.use(cookieParser());

// Routes
app.use('/api/users',  userRoutes);
app.use('/api/product',  productRoutes);
app.use('/api/wishlist',  wishlistRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
 

// Handle 404 routes
// app.use('*', (req, res) => {
//     res.status(404).json({
//         success: false,
//         message: 'Route not found'
//     });
// });


// Start the server
app.listen(port, () => {
    console.log(`Server Running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

