import express from 'express';
import { registerBuyer, loginBuyer, updateBuyerProfile } from '../controllers/buyer.controller';
import { isBuyer } from '../middleware/buyerAuth';

const router = express.Router();

// Buyer registration
router.post('/register', registerBuyer);

// Buyer login
router.post('/login', loginBuyer);

// Buyer profile update (requires authentication)
router.put('/profile', isBuyer, updateBuyerProfile);

export default router; 