import express from 'express';
import {registerUser,loginUser,logoutUser,checkAuth,} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Protected routes
router.get('/check-auth', protect, checkAuth);

 
export default router;