import express from 'express';
import {
  registerSeller,
  loginSeller,
  getSellerProfile,
  updateSellerProfile,
} from '../controllers/seller.controller';
import { handleSellerReapplication } from '../controllers/admin/seller-blacklist.controller';

const router = express.Router();

// Seller registration
router.post('/register', registerSeller);

// Seller login
router.post('/login', loginSeller);

// Get seller profile
router.get('/profile/:id?', getSellerProfile);

// Update seller profile
router.put('/profile/:id?', updateSellerProfile);

// Handle seller reapplication (for blacklisted sellers)
router.post('/:sellerId/reapply', handleSellerReapplication);

export default router; 