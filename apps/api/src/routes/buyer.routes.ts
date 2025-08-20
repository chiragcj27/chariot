import express from 'express';
import { registerBuyer, loginBuyer, updateBuyerProfile, getBuyerProfile } from '../controllers/buyer.controller';
import { isBuyer } from '../middleware/buyerAuth';

const router = express.Router();

// Buyer registration
router.post('/register', registerBuyer);

// Buyer login
router.post('/login', loginBuyer);

// Get buyer profile (requires authentication)
router.get('/profile', isBuyer, getBuyerProfile);

// Buyer profile update (requires authentication)
router.put('/profile', isBuyer, updateBuyerProfile);

export default router; 