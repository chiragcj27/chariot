import express from 'express';
import {
  registerSeller,
  loginSeller,
  getSellerProfile,
  updateSellerProfile,
} from '../controllers/seller.controller';

const router = express.Router();

// Seller registration
router.post('/register', registerSeller);

// Seller login
router.post('/login', loginSeller);

// Get seller profile
router.get('/profile/:id?', getSellerProfile);

// Update seller profile
router.put('/profile/:id?', updateSellerProfile);

export default router; 